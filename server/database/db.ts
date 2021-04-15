// import sqlite from "sqlite";
import fs from "fs";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { OrderDbType, OrderPrintType } from "../ordertypes";

const bootstrapDB = () => {
  const dbFile = "database/orderdb.sqlite";
  if (!fs.existsSync(dbFile)) {
    const db = new sqlite3.Database(dbFile);
    const schema = fs.readFileSync("database/schema.sql", "utf8");
    db.run(schema);
  }
};

const openDB = async () => {
  return await open({
    filename: "database/orderdb.sqlite",
    driver: sqlite3.Database,
  });
};

const saveOrder = async (order: OrderPrintType) => {
  const db = await openDB();
  await Promise.all(
    order.multiprint_resume.map(async (mr) => {
      await db.run(
        `insert into orders (id, f_floor, f_table, order_line, qty, product_id, note)
        values (:id, :f_floor, :f_table, :order_line, :qty, :product_id, :note)`,
        {
          ":id": order.id,
          ":f_floor": order.floor,
          ":f_table": order.table,
          ":order_line": mr.order_line,
          ":qty": mr.qty,
          ":product_id": mr.product_id,
          ":note": mr.note,
        }
      );
    })
  );
};

const getOrder = async (orderId: string): Promise<OrderPrintType | boolean> => {
  const db = await openDB();
  const query = `
  select id, f_floor, f_table, order_line, qty, product_id, note
  from orders
  where id = ?
  `;
  const order: OrderDbType[] = await db.all(query, [orderId]);
  if (order.length === 0) return false;
  return {
    id: order[0].id,
    floor: order[0].f_floor,
    table: order[0].f_table,
    multiprint_resume: order.map((o) => ({
      order_line: o.order_line,
      qty: o.qty,
      product_id: o.product_id,
      note: o.note,
    })),
  };
};

const deleteOrder = async (orderId: string) => {
  const db = await openDB();
  await db.run(`delete from orders where id = :id`, { ":id": orderId });
};

export { bootstrapDB, saveOrder, getOrder, deleteOrder };
