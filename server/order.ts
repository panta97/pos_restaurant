import { getProducts } from "./database/db";
import { OrderData, OrderPrintType, OrderType, PrintLine } from "./ordertypes";
import { getCurrentTime } from "./utils";

// tranform order from request
const getOrder = async (
  orderId: string,
  orders: string
): Promise<OrderPrintType> => {
  // TODO: optimize parser for long string
  const ordersObj: OrderType[] = JSON.parse(orders);
  const order = ordersObj.find((odr) => odr.id === orderId)!.data;
  return {
    id: orderId,
    floor: order.floor,
    table: order.table,
    printLines: await getMultiPrintLines(order),
    posSessionId: order.pos_session_id,
    createdAt: getCurrentTime(),
  };
};

const getPrevAndCurrOrder = async (
  orderId: string,
  orders: string
): Promise<[OrderPrintType, OrderPrintType]> => {
  const ordersObj: OrderType[] = JSON.parse(orders);
  const order = ordersObj.find((odr) => odr.id === orderId)!.data;

  const sharedProps = {
    id: orderId,
    floor: order.floor,
    table: order.table,
    posSessionId: order.pos_session_id,
    createdAt: getCurrentTime(),
  };

  const prevOrder: OrderPrintType = {
    ...sharedProps,
    printLines: await getMultiPrintLines(order),
  };

  const currOrder: OrderPrintType = {
    ...sharedProps,
    printLines: await getPrintLines(order),
  };

  return [prevOrder, currOrder];
};

// as curr previous order
const getPrintLines = async (order: OrderData): Promise<PrintLine[]> => {
  if (!order.lines) return [];
  let productIds = order.lines.map(([, , line]) => line.product_id);
  // distinct
  productIds = productIds.filter(
    (val, index, self) => self.indexOf(val) === index
  );
  const productsDb = await getProducts(productIds);
  const printLines: PrintLine[] = order.lines
    .map(([, , line]) => {
      const productDb = productsDb.find((pdb) => pdb.id === line.product_id)!;
      return {
        qty: line.qty,
        productName: productDb.name,
        note: line.note,
        productId: line.product_id,
        categoryId: productDb.category_id,
        orderLine: line.id,
      };
    })
    .sort((a, b) => a.orderLine - b.orderLine);
  return printLines;
};

// as previous order
const getMultiPrintLines = async (order: OrderData): Promise<PrintLine[]> => {
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
  const printLines: PrintLine[] = Object.entries(order.multiprint_resume)
    .map(([key, val]) => {
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
    })
    .sort((a, b) => a.orderLine - b.orderLine);
  return printLines;
};

export { getOrder, getPrevAndCurrOrder };
