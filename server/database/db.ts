// import sqlite from "sqlite";
import fs from "fs";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { productCatalogErrorHandler } from "../error";
import {
  OrderAge,
  OrderDb,
  OrderDiffDb,
  OrderDiffState,
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
import { getCurrentTime } from "../utils";
import { tableOrders, tableOrdersDiff, tableProducts } from "./schema";

const bootstrapDB = () => {
  if (!fs.existsSync(process.env.DB_PATH!)) {
    const db = new sqlite3.Database(process.env.DB_PATH!);
    db.run(tableOrders);
    db.run(tableOrdersDiff);
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
          category_id, created_at, pos_session_id)
        values
        (:id, :f_floor, :f_table, :order_line, :qty, :product_id, :note, :product_name,
          :category_id, :created_at, :pos_session_id)`,
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
        }
      );
    })
  );
};

const saveOrderDiff = async (orderToPrint: OrderToPrint) => {
  if (orderToPrint.printLines.length === 0) return;
  const db = await openDB();
  const query = `
    insert into d_orders
    (id, f_floor, f_table, order_diff, order_line, qty, product_id, note, product_name,
      category_id, created_at, target_printer, printed, order_age, pos_session_id)
    values
    (:id, :f_floor, :f_table, :order_diff, :order_line, :qty, :product_id, :note, :product_name,
      :category_id, :created_at, :target_printer, :printed, :order_age, :pos_session_id)
  `;
  const currenTime = getCurrentTime();
  await Promise.all(
    orderToPrint.printLines.map(async (pl) => {
      // insert bundle diff order
      if (Array.isArray(pl)) {
        await Promise.all(
          pl.map(async (printLine) => {
            await db.run(query, {
              ":id": orderToPrint.id,
              ":f_floor": orderToPrint.floor,
              ":f_table": orderToPrint.table,
              ":order_diff": printLine.state,
              ":order_line": printLine.printLine.orderLine,
              ":qty": printLine.printLine.qty,
              ":product_id": printLine.printLine.productId,
              ":note": printLine.printLine.note,
              ":product_name": printLine.printLine.productName,
              ":category_id": printLine.printLine.categoryId,
              ":created_at": currenTime,
              ":target_printer": printLine.targetPrinter,
              ":printed": OrderPrinted.ERROR,
              ":order_age": OrderAge.YOUNGEST,
              ":pos_session_id": orderToPrint.posSessionId,
            });
          })
        );
        // insert simple diff order
      } else {
        await db.run(query, {
          ":id": orderToPrint.id,
          ":f_floor": orderToPrint.floor,
          ":f_table": orderToPrint.table,
          ":order_diff": pl.state,
          ":order_line": pl.printLine.orderLine,
          ":qty": pl.printLine.qty,
          ":product_id": pl.printLine.productId,
          ":note": pl.printLine.note,
          ":product_name": pl.printLine.productName,
          ":category_id": pl.printLine.categoryId,
          ":created_at": currenTime,
          ":target_printer": pl.targetPrinter,
          ":printed": OrderPrinted.ERROR,
          ":order_age": OrderAge.YOUNGEST,
          ":pos_session_id": orderToPrint.posSessionId,
        });
      }
    })
  );
};

const getOrder = async (orderId: string): Promise<OrderPrintType | boolean> => {
  const db = await openDB();
  const query = `
  select id, f_floor, f_table, order_line, qty, product_id, note, product_name, category_id
  from orders
  where id = ?
  `;
  const order: OrderDb[] = await db.all(query, [orderId]);
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

const mapOrderDiffDBToOrderToPrint = (order: OrderDiffDb): OrderToPrint => {
  return {
    id: order.id,
    floor: order.f_floor,
    table: order.f_table,
    posSessionId: order.pos_session_id,
    printLines: [
      {
        state: order.order_diff,
        targetPrinter: order.target_printer,
        printLine: {
          qty: order.qty,
          productName: order.product_name,
          note: order.note,
          productId: order.product_id,
          categoryId: order.category_id,
          orderLine: order.order_line,
        },
      },
    ],
  };
};

// OTP = order to print
const getOTP = async (
  orderId: string,
  orderLine: number,
  orderAge: number,
  printed: OrderPrinted
) => {
  const db = await openDB();
  const query = `
  select id, f_floor, f_table, order_diff, order_line, qty, product_id, note, product_name,
         category_id, created_at, target_printer, printed, order_age, pos_session_id
  from d_orders
  where id = :id
  and order_line = :orderLine
  and order_age = :orderAge
  and printed = :orderPrinted;
  `;
  const ordersDiffDb: OrderDiffDb[] = await db.all(query, {
    ":id": orderId,
    ":orderLine": orderLine,
    ":orderAge": orderAge,
    ":orderPrinted": printed,
  });
  if (ordersDiffDb.length === 0) throw new Error("Retrieved 0 rows");
  const OTP: OrderToPrint = mapOrderDiffDBToOrderToPrint(ordersDiffDb[0]);
  // you'll get either one row (simple order)
  // or two rows (bundle order)
  if (ordersDiffDb.length === 1) {
    return OTP;
  } else if (ordersDiffDb.length === 2) {
    // ODB = orderDiffDB
    const secondODB = ordersDiffDb[1];
    const secondPrintLine = {
      state: secondODB.order_diff,
      targetPrinter: secondODB.target_printer,
      printLine: {
        qty: secondODB.qty,
        productName: secondODB.product_name,
        note: secondODB.note,
        productId: secondODB.product_id,
        categoryId: secondODB.category_id,
        orderLine: secondODB.order_line,
      },
    } as OrderPrintLine;
    const firstPrintLine = OTP.printLines[0] as OrderPrintLine;
    // replace current printLines[PL] to printLines [[PL, PL]]
    OTP.printLines[0] = [firstPrintLine, secondPrintLine];
    return OTP;
  } else {
    let errorMsg = `retrived more than thwo rows fro orderId ${orderId}\n`;
    errorMsg += `orderLine: ${orderLine} and\n`;
    errorMsg += `orderAge: ${orderAge}`;
    throw new Error(errorMsg);
  }
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

const mapOderDiffDBToRestOrder = (orderDb: OrderDiffDb): RestOrder => {
  return {
    id: orderDb.id,
    floor: orderDb.f_floor,
    table: orderDb.f_table,
    orderLines: [
      {
        orderLineId: orderDb.order_line,
        categoryId: orderDb.category_id,
        orderDiff: orderDb.order_diff,
        orderAge: orderDb.order_age,
        productName: orderDb.product_name,
        qty: orderDb.qty,
        note: orderDb.note,
        printed: orderDb.printed,
        createAt: orderDb.created_at,
      },
    ],
  };
};
// get all orders of current pos session id
const getAllOrders = async (): Promise<RestOrder[]> => {
  const db = await openDB();
  const query = `
    select id, f_floor, f_table, order_diff, order_line, qty, product_id, note, product_name,
    category_id, created_at, target_printer, printed, order_age, pos_session_id
    from d_orders
    where pos_session_id =
    (
      select max (pos_session_id)
      from d_orders
      limit 1
    )
    order by created_at desc;
  `;
  const orders: OrderDiffDb[] = await db.all(query);
  if (orders.length === 0) return [];
  const restOrders: RestOrder[] = [mapOderDiffDBToRestOrder(orders[0])];
  let prevOrder: RestOrder = restOrders[0];
  for (let i = 1; i < orders.length; i++) {
    const restOrder = mapOderDiffDBToRestOrder(orders[i]);
    // it is a bundle order
    if (
      restOrder.orderLines[0].orderLineId ===
        prevOrder.orderLines[0].orderLineId &&
      restOrder.orderLines[0].orderAge === prevOrder.orderLines[0].orderAge
    ) {
      const prevRestOrder = restOrders[restOrders.length - 1] as RestOrder;
      // make it a bundle
      prevRestOrder.orderLines.push({
        orderLineId: orders[i].order_line,
        categoryId: orders[i].category_id,
        orderDiff: orders[i].order_diff,
        orderAge: orders[i].order_age,
        productName: orders[i].product_name,
        qty: orders[i].qty,
        note: orders[i].note,
        printed: orders[i].printed,
        createAt: orders[i].created_at,
      });
      // it is a simple order
    } else {
      restOrders.push(restOrder);
    }
    prevOrder = restOrder;
  }
  return restOrders;
};

const deleteOrder = async (orderId: string) => {
  const db = await openDB();
  await db.run(`delete from orders where id = :id`, { ":id": orderId });
};

const updateOrderDiffAge = async (orderId: string) => {
  const db = await openDB();
  // UPDATE
  const queryUpdate = `
    update d_orders
    set order_age = order_age + 1
    where id = ?;
  `;
  // TODO: research how this would fail
  await db.run(queryUpdate, [orderId]);
};

const updatePrintedState = async (
  printResults: PrintResult[],
  orderToPrint: OrderToPrint
) => {
  const query = `
    update d_orders
    set printed = :printed
    where id = :orderId
    and category_id = :categoryId
    and order_age = :orderAge
  `;
  for (let i = 0; i < printResults.length; i++) {
    const db = await openDB();
    const pr = printResults[i];
    // print ERROR
    if (
      pr.promiseResult.status === "rejected" ||
      (pr.promiseResult.status === "fulfilled" &&
        pr.promiseResult.value === undefined)
    ) {
      continue;
    }
    // print SUCCESS
    await db.run(query, {
      ":printed": OrderPrinted.SUCCESS,
      ":orderId": orderToPrint.id,
      ":categoryId": printResults[i].printer,
      ":orderAge": OrderAge.YOUNGEST,
    });
  }
};

const updatePrintedStateSingle = async (
  printResults: PrintResult[],
  orderToPrint: OrderToPrint
) => {
  const query = `
    update d_orders
    set printed = :printed
    where id = :orderId
    and category_id = :categoryId
    and order_line = :orderLineId
    and order_age = :orderAge
  `;
  const db = await openDB();

  for (let i = 0; i < printResults.length; i++) {
    const db = await openDB();
    const pr = printResults[i];
    // print ERROR
    if (
      pr.promiseResult.status === "rejected" ||
      (pr.promiseResult.status === "fulfilled" &&
        pr.promiseResult.value === undefined)
    ) {
      continue;
    }
    // print SUCCESS
    let orderLineId = -1;
    const printLine = orderToPrint.printLines[0];
    if (Array.isArray(printLine)) {
      orderLineId = printLine[0].printLine.orderLine;
    } else {
      orderLineId = printLine.printLine.orderLine;
    }

    await db.run(query, {
      ":printed": OrderPrinted.SUCCESS,
      ":orderId": orderToPrint.id,
      ":categoryId": printResults[i].printer,
      ":orderLineId": orderLineId,
      ":orderAge": OrderAge.YOUNGEST,
    });
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
  getOTP,
  getPreviousOrder,
  getAllOrders,
  deleteOrder,
  getProducts,
  getAllProducts,
  saveProducts,
  saveOrderDiff,
  updateOrderDiffAge,
  updatePrintedState,
  updatePrintedStateSingle,
};
