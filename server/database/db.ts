// import sqlite from "sqlite";
import fs from "fs";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { productCatalogErrorHandler } from "../error";
import {
  OrderDb,
  OrderPrinted,
  OrderPrintLine,
  OrderPrintType,
  OrderState,
  OrderToPrint,
  Printer,
  PrintResult,
  ProductDb,
  RestProduct,
} from "../ordertypes";
import { Order as RestOrder } from "../resttypes";
import { tableOrders, tableProducts } from "./schema";

const bootstrapDB = () => {
  if (!fs.existsSync(process.env.DB_PATH!)) {
    const db = new sqlite3.Database(process.env.DB_PATH!);
    db.run(tableOrders);
    db.run(tableProducts);
  }
};

const openDB = async () => {
  return await open({
    filename: process.env.DB_PATH!,
    driver: sqlite3.Database,
  });
};

const saveOrder = async (order: OrderPrintType) => {
  const db = await openDB();
  await Promise.all(
    order.printLines.map(async (pl) => {
      await db.run(
        `insert into orders
        (id, f_floor, f_table, order_line, qty, product_id, note, product_name,
          category_id, created_at, pos_session_id, state, printed)
        values
        (:id, :f_floor, :f_table, :order_line, :qty, :product_id, :note, :product_name,
          :category_id, :created_at, :pos_session_id, :state, :printed)`,
        {
          ":id": order.id,
          ":f_floor": order.floor,
          ":f_table": order.table,
          ":order_line": pl.orderLine,
          ":qty": pl.qty,
          ":product_id": pl.productId,
          ":note": pl.note,
          ":product_name": pl.productName,
          ":category_id": pl.categoryId,
          ":created_at": order.createdAt,
          ":pos_session_id": order.posSessionId,
          ":state": OrderState.CURRENT,
          ":printed": OrderPrinted.ERROR,
        }
      );
    })
  );
};

const getOrder = async (
  orderId: string,
  orderState: OrderState
): Promise<OrderPrintType | boolean> => {
  const db = await openDB();
  const query = `
  select id, f_floor, f_table, order_line, qty, product_id, note, product_name,
         category_id, created_at, pos_session_id
  from orders
  where id = :id and state = :state
  `;
  const order: OrderDb[] = await db.all(query, {
    ":id": orderId,
    ":state": orderState,
  });
  if (order.length === 0) return false;
  return {
    id: order[0].id,
    floor: order[0].f_floor,
    table: order[0].f_table,
    printLines: order.map((o) => ({
      qty: o.qty,
      orderLine: o.order_line,
      note: o.note,
      productId: o.product_id,
      productName: o.product_name,
      categoryId: o.category_id,
    })),
    createdAt: order[0].created_at,
    posSessionId: order[0].pos_session_id,
  };
};

const getPreviousOrder = async (
  orderId: string
): Promise<OrderPrintType | boolean> => {
  const db = await openDB();
  // get previous successful printed order
  const query = `
  select id, f_floor, f_table, order_line, qty, product_id, note, product_name,
         category_id, created_at, pos_session_id
  from orders
  where id = :id
  and printed = :printed
  and category_id = :categoryId
  `;
  // partitioned by printeCategories
  // TODO: fixed hardercoded printerCategories
  const printerCategories = [Printer.BAR, Printer.RESTAURANT];
  let order: OrderDb[] = [];
  for (let i = 0; i < printerCategories.length; i++) {
    order = order.concat(
      await db.all(query, {
        ":id": orderId,
        ":printed": OrderPrinted.SUCCESS,
        ":categoryId": printerCategories[i],
      })
    );
  }
  if (order.length === 0) return false;
  return {
    id: order[0].id,
    floor: order[0].f_floor,
    table: order[0].f_table,
    printLines: order.map((o) => ({
      qty: o.qty,
      orderLine: o.order_line,
      note: o.note,
      productId: o.product_id,
      productName: o.product_name,
      categoryId: o.category_id,
    })),
    createdAt: order[0].created_at,
    posSessionId: order[0].pos_session_id,
  };
};

// get all orders of current pos session id
const getAllOrders = async (): Promise<RestOrder[]> => {
  const db = await openDB();
  const query = `
    select id, f_floor, f_table, order_line, qty, product_id, note, product_name,
    category_id, created_at, pos_session_id, printed
    from orders
    where pos_session_id  =
    (
      select max(pos_session_id)
      from orders
      limit 1
    )
    and state = ?
    order by created_at desc;
  `;
  const orders: OrderDb[] = await db.all(query, [OrderState.CURRENT]);
  const restOrders: RestOrder[] = [];
  let prevOrderId = "";
  for (let i = 0; i < orders.length; i++) {
    if (prevOrderId !== orders[i].id) {
      restOrders.push({
        id: orders[i].id,
        floor: orders[i].f_floor,
        table: orders[i].f_table,
        createAt: orders[i].created_at,
        orderLines: [
          {
            orderLineId: orders[i].order_line,
            categoryId: orders[i].category_id,
            productName: orders[i].product_name,
            qty: orders[i].qty,
            note: orders[i].note,
            printed: orders[i].printed,
          },
        ],
      });
    } else {
      restOrders[restOrders.length - 1].orderLines.push({
        orderLineId: orders[i].order_line,
        categoryId: orders[i].category_id,
        productName: orders[i].product_name,
        qty: orders[i].qty,
        note: orders[i].note,
        printed: orders[i].printed,
      });
    }
    prevOrderId = orders[i].id;
  }
  return restOrders;
};

const deleteOrder = async (orderId: string) => {
  const db = await openDB();
  await db.run(`delete from orders where id = :id`, { ":id": orderId });
};

const updateOrderState = async (orderId: string) => {
  const db = await openDB();
  // increase by 1 to all order lines
  /*
  order   state
  o1 first    0   current order
  ------------------------------
  o1 second   0   current order
  o1 first    1   prev order
  ------------------------------
  o1 thrid    0   current order
  o1 second   1   prev order
  o1 first    2   keep all following (oldest)
  */
  // UPDATE
  const queryUpdate = `
    update orders
    set state = state + 1
    where id = ?;
  `;
  // TODO: research how this would fail
  await db.run(queryUpdate, [orderId]);
  // // DELETE
  // const queryDelete = `
  //   delete from orders
  //   where id = :id
  //   and state >= :state;
  // `;
  // await db.run(queryDelete, {
  //   ":id": orderId,
  //   ":state": OrderState.DELETE,
  // });
};

const updatePrintedState = async (
  printResults: PrintResult[],
  orderToPrint: OrderToPrint
) => {
  for (let i = 0; i < printResults.length; i++) {
    const db = await openDB();
    const pr = printResults[i];
    // print SUCCESS
    if (
      pr.promiseResult.status === "fulfilled" &&
      pr.promiseResult.value !== undefined
    ) {
      const queryUpdate = `
        update orders
        set printed = :printed
        where id = :id
        and category_id = :categoryId
        and state = :state;
      `;
      await db.run(queryUpdate, {
        ":printed": OrderPrinted.SUCCESS,
        ":id": orderToPrint.id,
        ":categoryId": pr.printer,
        ":state": OrderState.CURRENT,
      });
      // delete previous print success
      const queryDelete = `
        delete from orders
        where id = :id
        and category_id = :categoryId
        and state <> :state;
      `;
      await db.run(queryDelete, {
        ":id": orderToPrint.id,
        ":categoryId": pr.printer,
        ":state": OrderState.CURRENT,
      });
      // print ERROR
    } else {
      // from printer category update all order lines to print success
      // except the ones from error
      const notPrintedOrderLineIds = new Set<number>();
      orderToPrint.printLines.forEach((orderPrintLine) => {
        if (Array.isArray(orderPrintLine)) {
          orderPrintLine.forEach((opl) => {
            notPrintedOrderLineIds.add(opl.printLine.orderLine);
          });
        } else {
          notPrintedOrderLineIds.add(orderPrintLine.printLine.orderLine);
        }
      });
      const orderLineIds = Array.from(notPrintedOrderLineIds);
      const queryUpdate = `
        update orders
        set printed = :printed
        where id = :id
        and category_id = :categoryId
        and state = :state;
        and order_line not in (${orderLineIds.join(",")})
      `;
      await db.run(queryUpdate, {
        ":id": orderToPrint.id,
        ":printed": OrderPrinted.SUCCESS,
        ":category_id": pr.printer,
        ":state": OrderState.CURRENT,
      });
    }
  }
};

const getProducts = async (productIds: number[]) => {
  const db = await openDB();
  const query = `
    select id, name, category_id
    from products
    where id in (${productIds.join(",")})
  `;
  const products: ProductDb[] = await db.all(query);
  productCatalogErrorHandler(productIds, products);
  return products;
};

const getAllProducts = async () => {
  const db = await openDB();
  const query = `
    select id, name, category_id
    from products;
  `;
  const products: ProductDb[] = await db.all(query);
  return products;
};

const saveProducts = async (products: RestProduct[]) => {
  // just in case products list is empty
  // keep working with latest products catalog
  if (products.length === 0) return;
  const db = await openDB();
  // delete all previous products
  await db.run(`delete from products`);
  // insert updated product catalog
  await Promise.all(
    products.map(async (product) => {
      await db.run(
        `insert into products
        (id, name, category_id)
        values
        (:id, :name, :category_id)`,
        {
          ":id": product.id,
          ":name": product.name,
          ":category_id": product.category_id,
        }
      );
    })
  );
};

export {
  bootstrapDB,
  saveOrder,
  getOrder,
  getPreviousOrder,
  getAllOrders,
  deleteOrder,
  updateOrderState,
  getProducts,
  getAllProducts,
  saveProducts,
  updatePrintedState,
};
