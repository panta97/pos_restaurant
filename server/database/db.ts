// import sqlite from "sqlite";
import fs from "fs";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { productCatalogErrorHandler } from "../error";
import {
  OrderDb,
  OrderPrintType,
  OrderState,
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
          category_id, created_at, pos_session_id, state)
        values
        (:id, :f_floor, :f_table, :order_line, :qty, :product_id, :note, :product_name,
          :category_id, :created_at, :pos_session_id, :state)`,
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
         category_id
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

// get all orders of current pos session id
const getAllOrders = async (): Promise<RestOrder[]> => {
  const db = await openDB();
  const query = `
    select id, f_floor, f_table, order_line, qty, product_id, note, product_name,
    category_id, created_at, pos_session_id
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
  o1 first    2   delete
  */
  const query = `
    update orders
    set state = state + 1
    where id = ?;
  `;
  // TODO: research how this would fail
  await db.run(query, [orderId]);
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
  getAllOrders,
  deleteOrder,
  updateOrderState,
  getProducts,
  getAllProducts,
  saveProducts,
};
