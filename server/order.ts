import { getProducts } from "./database/db";
import { OrderData, OrderPrintType, OrderType, PrintLine } from "./ordertypes";

// tranform order from request
const getOrder = async (
  orderId: string,
  orders: string
): Promise<OrderPrintType> => {
  // optimize parser for long string ?
  const ordersObj: OrderType[] = JSON.parse(orders);
  const order = ordersObj.find((odr) => odr.id === orderId)!.data;
  return {
    id: orderId,
    floor: order.floor,
    table: order.table,
    printLines: await getPrintLines(order),
  };
};

const getPrintLines = async (order: OrderData): Promise<PrintLine[]> => {
  // we return to an empty array if
  // an empty order is sent
  if (!order.multiprint_resume) return [];
  let productIds = Object.values(order.multiprint_resume).map(
    (val) => val.product_id
  );
  // distinct
  productIds = productIds.filter(
    (val, index, self) => self.indexOf(val) === index
  );
  const productsDb = await getProducts(productIds);
  const printLines: PrintLine[] = Object.entries(order.multiprint_resume).map(
    ([key, val]) => {
      const productDb = productsDb.find((pdb) => pdb.id === val.product_id)!;
      // key could come in this form "1|sin papas"
      const [, orderLine] = /^(\d+).*/.exec(key)!;
      // add productName and categoryId
      return {
        qty: val.qty,
        productName: productDb.name,
        note: val.note,
        productId: val.product_id,
        categoryId: productDb.category_id,
        orderLine: Number(orderLine),
      };
    }
  );
  return printLines;
};

export { getOrder };
