import { deleteOrder, getOrder, saveOrder } from "./database/db";
import {
  MultiprintLineExt,
  OrderPrintLine,
  OrderPrintType,
  OrderToPrint,
  State,
} from "./ordertypes";

const getOrderToPrint = async (
  order: OrderPrintType
): Promise<OrderToPrint> => {
  const prevOrder = await getOrder(order.id);
  // previous order exists
  if (prevOrder) {
    // simply delete it all and insert it again
    await deleteOrder(order.id);
    await saveOrder(order);
    return {
      id: order.id,
      floor: order.floor,
      table: order.table,
      printLines: getOrderLineStates(prevOrder as OrderPrintType, order),
    };
    // previous order does not exist
  } else {
    await saveOrder(order);
    return {
      id: order.id,
      floor: order.floor,
      table: order.table,
      printLines: order.multiprint_resume.map((mr) => ({
        targetPrinter: "test",
        state: State.NEW,
        orderline: mr,
      })),
    };
  }
};

const getOrderLineStates = (
  prevOrder: OrderPrintType,
  currOrder: OrderPrintType
): OrderPrintLine[] => {
  let orderLinesSet = new Set<number>();
  // pol = previous order line
  // col = current order line
  prevOrder.multiprint_resume.forEach((pol) =>
    orderLinesSet.add(pol.order_line)
  );
  currOrder.multiprint_resume.forEach((col) =>
    orderLinesSet.add(col.order_line)
  );
  // merge both order lines ids from col and pol into orderLines array
  const orderLines = Array.from(orderLinesSet).sort((a, b) => a - b);
  let orderPrintLines: OrderPrintLine[] = [];
  for (let i = 0; i < orderLines.length; i++) {
    const pol = prevOrder.multiprint_resume.find(
      (o) => o.order_line === orderLines[i]
    );
    const col = currOrder.multiprint_resume.find(
      (o) => o.order_line === orderLines[i]
    );
    // new order line added
    if (!pol && col) {
      orderPrintLines.push({
        targetPrinter: "test",
        state: State.NEW,
        orderline: col,
      });
      // order line deleted
    } else if (pol && !col) {
      orderPrintLines.push({
        targetPrinter: "test",
        state: State.CANCELLED,
        orderline: pol,
      });
      // order line posibly updated
    } else if (pol && col) {
      // check if it has been updated
      if (areDifferent(pol, col)) {
        orderPrintLines.push({
          targetPrinter: "test",
          state: State.CANCELLED,
          orderline: pol,
        });
        orderPrintLines.push({
          targetPrinter: "test",
          state: State.NEW,
          orderline: col,
        });
      }
    }
  }
  return orderPrintLines;
};

const areDifferent = (
  prevOrderLine: MultiprintLineExt,
  currOrderLine: MultiprintLineExt
): boolean => {
  if (prevOrderLine.qty !== currOrderLine.qty) return true;
  if (prevOrderLine.note !== currOrderLine.note) return true;
  // not sure if this third if statement should be added
  if (prevOrderLine.product_id !== currOrderLine.product_id) return true;
  return false;
};

export { getOrderToPrint };
