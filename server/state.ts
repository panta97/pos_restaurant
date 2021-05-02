import {
  getOrder,
  getPreviousOrder,
  saveOrder,
  deleteOrder,
  saveOrderDiff,
  updateOrderDiffAge,
} from "./database/db";
import {
  OrderPrintLine,
  OrderPrintType,
  OrderToPrint,
  PrintLine,
  OrderDiffState,
  OrderState,
} from "./ordertypes";

const getOrderToPrint = async (
  currOrder: OrderPrintType
): Promise<OrderToPrint> => {
  // we get the CURRENT order here as PREVIOUS order
  // since the most current order is coming from func parameter
  // const prevOrder = await getOrder(currOrder.id, OrderState.CURRENT);
  const prevOrder = await getPreviousOrder(currOrder.id);
  // previous order exists
  if (prevOrder) {
    // await updateOrderState(currOrder.id);
    await saveOrder(currOrder);
    return {
      id: currOrder.id,
      floor: currOrder.floor,
      table: currOrder.table,
      posSessionId: currOrder.posSessionId,
      printLines: getOrderLineStates(prevOrder as OrderPrintType, currOrder),
    };
    // previous order does not exist
  } else {
    await saveOrder(currOrder);
    return {
      id: currOrder.id,
      floor: currOrder.floor,
      table: currOrder.table,
      posSessionId: currOrder.posSessionId,
      printLines: currOrder.printLines.map((mr) => ({
        targetPrinter: mr.categoryId,
        state: OrderDiffState.NEW,
        printLine: mr,
      })),
    };
  }
};

const getOrderToPrintSimple = async (
  currOrder: OrderPrintType
): Promise<OrderToPrint> => {
  const prevOrder = await getOrder(currOrder.id);
  let orderToPrint: OrderToPrint;
  // previous order exists
  if (prevOrder) {
    await deleteOrder(currOrder.id);
    await saveOrder(currOrder);
    orderToPrint = {
      id: currOrder.id,
      floor: currOrder.floor,
      table: currOrder.table,
      posSessionId: currOrder.posSessionId,
      printLines: getOrderLineStates(prevOrder as OrderPrintType, currOrder),
    };
    // previous order does not exist
  } else {
    await saveOrder(currOrder);
    orderToPrint = {
      id: currOrder.id,
      floor: currOrder.floor,
      table: currOrder.table,
      posSessionId: currOrder.posSessionId,
      printLines: currOrder.printLines.map((mr) => ({
        targetPrinter: mr.categoryId,
        state: OrderDiffState.NEW,
        printLine: mr,
      })),
    };
  }
  await updateOrderDiffAge(currOrder.id);
  await saveOrderDiff(orderToPrint);
  return orderToPrint;
};

// const getOrderToPrintBackUp = async (
//   orderId: string,
//   orderAge: number
// ): Promise<OrderToPrint> => {

// };

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
        // added more in qty
        if (col.qty > pol.qty && col.note === pol.note) {
          col.qty -= pol.qty;
          orderPrintLines.push([
            {
              targetPrinter: col.categoryId,
              state: OrderDiffState.NEW,
              printLine: col,
            },
          ]);
          // remove in qty
        } else if (col.qty < pol.qty && col.note === pol.note) {
          pol.qty -= col.qty;
          orderPrintLines.push([
            {
              targetPrinter: pol.categoryId,
              state: OrderDiffState.CANCELLED,
              printLine: pol,
            },
          ]);
        } else {
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

export { getOrderToPrint, getOrderToPrintSimple };
