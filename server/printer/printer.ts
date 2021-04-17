import NTP from "node-thermal-printer";
import { OrderPrintLine, OrderToPrint, State } from "../ordertypes";
import { TEST_PRINTER } from "./printerconfigs";

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

const printOrder = (orderToPrint: OrderToPrint) => {
  //  state hasn't changed
  if (orderToPrint.printLines.length === 0) return;

  const printer = new NTP.printer(TEST_PRINTER);
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

export { printText, printOrder };
