import lodash from "lodash";
import NTP from "node-thermal-printer";
import { OrderPrintLine, OrderToPrint, Printer, State } from "../ordertypes";
import {
  BAR_PRINTER,
  RESTAURANT_PRINTER,
  TEST_PRINTER,
} from "./printerconfigs";

const printText = (text: string) => {
  const printer = new NTP.printer(TEST_PRINTER);
  printer.println(text);
  printer.cut();
  printer.execute();
};

// const printOrderMock = (orderToPrint: OrderToPrint) => {
//   if (orderToPrint.printLines.length === 0) return;
//   let paper = `
//     ${orderToPrint.id}
//     ${orderToPrint.floor} / ${orderToPrint.table}`;
//   paper += "\n--------------";
//   paper += orderToPrint.printLines.reduce((acc, curr) => {
//     acc += `\n${
//       curr.state === State.NEW ? "NUEVO" : "CANCELADO"
//     } - ${new Date().toLocaleTimeString()}
//     ${curr.orderline.qty} | ${curr.orderline.product_id}
//     ${curr.orderline.note}`;
//     return acc;
//   }, "");

//   console.log(paper);
// };

const printHeader = (printer: NTP.printer, orderToPrint: OrderToPrint) => {
  printer.bold(true);
  printer.alignCenter();
  printer.println(orderToPrint.id);
  printer.table([orderToPrint.floor, orderToPrint.table]);
  printer.newLine();
  printer.bold(false);
};
const printOrderLine = (
  printer: NTP.printer,
  orderPrintLine: OrderPrintLine
) => {
  printer.table([
    `${orderPrintLine.state === State.NEW ? "NUEVO" : "CANCELADO"}`,
    new Date().toLocaleTimeString(),
  ]);
  printer.table([
    `Cant: ${orderPrintLine.printLine.qty}`,
    orderPrintLine.printLine.productName,
  ]);
  // print order line
  if (orderPrintLine.printLine.note) {
    printer.alignLeft();
    printer.print("NOTA: ");
    printer.alignRight();
    printer.print(orderPrintLine.printLine.note);
  }
};

const printOrderLines = (printerType: Printer, orderToPrint: OrderToPrint) => {
  //  no order lines to print
  if (orderToPrint.printLines.length === 0) return;
  let printer: NTP.printer;
  switch (printerType) {
    case Printer.BAR:
      printer = new NTP.printer(BAR_PRINTER);
      break;
    case Printer.RESTAURANT:
      printer = new NTP.printer(RESTAURANT_PRINTER);
      break;
  }
  orderToPrint.printLines.forEach((orderPrintLine) => {
    printHeader(printer, orderToPrint);
    // it is a bundle order [C, N]
    if (Array.isArray(orderPrintLine)) {
      orderPrintLine.forEach((opl, i) => {
        printOrderLine(printer, opl);
        if (i < orderPrintLine.length - 1)
          printer.println("------------------------------------------");
      });
      // it is a simple order [N] | [C]
    } else {
      printOrderLine(printer, orderPrintLine);
    }
    printer.cut();
  });
  printer.execute();
};

const filterOrderLines = (
  targetPrinter: Printer,
  orderToPrint: OrderToPrint
) => {
  const newOrderToPrint = lodash.cloneDeep(orderToPrint);
  newOrderToPrint.printLines = newOrderToPrint.printLines.filter(
    (orderPrintLine) => {
      if (Array.isArray(orderPrintLine)) {
        return orderPrintLine[0].targetPrinter === targetPrinter;
      } else {
        return orderPrintLine.targetPrinter === targetPrinter;
      }
    }
  );
  return newOrderToPrint;
};

const printOrder = (orderToPrint: OrderToPrint) => {
  //  order state hasn't changed
  if (orderToPrint.printLines.length === 0) return;
  const restOrder = filterOrderLines(Printer.RESTAURANT, orderToPrint);
  const barOrder = filterOrderLines(Printer.BAR, orderToPrint);
  printOrderLines(Printer.RESTAURANT, restOrder);
  printOrderLines(Printer.BAR, barOrder);
};

export { printText, printOrder };
