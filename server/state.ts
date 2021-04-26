import { deleteOrder, getOrder, saveOrder } from "./database/db";
import {
  OrderPrintLine,
  OrderPrintType,
  OrderToPrint,
  PrintLine,
  OrderDiffState,
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
      printLines: order.printLines.map((mr) => ({
        targetPrinter: mr.categoryId,
        state: OrderDiffState.NEW,
        printLine: mr,
      })),
    };
  }
};

const getOrderLineStates = (
  prevOrder: OrderPrintType,
  currOrder: OrderPrintType
): (OrderPrintLine | OrderPrintLine[])[] => {
  let orderLinesSet = new Set<number>();
  // pol = previous order line
  // col = current order line
  prevOrder.printLines.forEach((pol) => orderLinesSet.add(pol.orderLine));
  currOrder.printLines.forEach((col) => orderLinesSet.add(col.orderLine));
  // merge both order lines ids from col and pol into orderLines array
  const orderLines = Array.from(orderLinesSet).sort((a, b) => a - b);
  let orderPrintLines: (OrderPrintLine | OrderPrintLine[])[] = [];
  for (let i = 0; i < orderLines.length; i++) {
    const pol = prevOrder.printLines.find((o) => o.orderLine === orderLines[i]);
    const col = currOrder.printLines.find((o) => o.orderLine === orderLines[i]);
    // new order line added
    if (!pol && col) {
      orderPrintLines.push({
        targetPrinter: col.categoryId,
        state: OrderDiffState.NEW,
        printLine: col,
      });
      // order line deleted
    } else if (pol && !col) {
      orderPrintLines.push({
        targetPrinter: pol.categoryId,
        state: OrderDiffState.CANCELLED,
        printLine: pol,
      });
      // order line posibly updated
    } else if (pol && col) {
      // check if it has been updated
      if (areDifferent(pol, col)) {
        orderPrintLines.push([
          {
            targetPrinter: pol.categoryId,
            state: OrderDiffState.CANCELLED,
            printLine: pol,
          },
          {
            targetPrinter: col.categoryId,
            state: OrderDiffState.NEW,
            printLine: col,
          },
        ]);
      }
    }
  }
  // return example
  // [N, C, [N, C]]
  return orderPrintLines;
};

const areDifferent = (
  prevOrderLine: PrintLine,
  currOrderLine: PrintLine
): boolean => {
  if (prevOrderLine.qty !== currOrderLine.qty) return true;
  if (prevOrderLine.note !== currOrderLine.note) return true;
  // not sure if this third if statement should be added
  if (prevOrderLine.productId !== currOrderLine.productId) return true;
  return false;
};

export { getOrderToPrint };
