import NTP from "node-thermal-printer";
import { OrderToPrint, State } from "../ordertypes";
import { TEST_PRINTER } from "./printerconfigs";

const printText = (text: string) => {
  const printer = new NTP.printer(TEST_PRINTER);
  printer.println(text);
  printer.cut();
  printer.execute();
};

const printOrderMock = (orderToPrint: OrderToPrint) => {
  if (orderToPrint.printLines.length === 0) return;
  let paper = `
    ${orderToPrint.id}
    ${orderToPrint.floor} / ${orderToPrint.table}`;
  paper += "\n--------------";
  paper += orderToPrint.printLines.reduce((acc, curr) => {
    acc += `\n${
      curr.state === State.NEW ? "NUEVO" : "CANCELADO"
    } - ${new Date().toLocaleTimeString()}
    ${curr.orderline.qty} | ${curr.orderline.product_id}
    ${curr.orderline.note}`;
    return acc;
  }, "");

  console.log(paper);
};

const printOrder = (orderToPrint: OrderToPrint) => {
  if (orderToPrint.printLines.length === 0) return;

  const printer = new NTP.printer(TEST_PRINTER);
  orderToPrint.printLines.forEach((orderPrintLine) => {
    // print order, floor and table
    // print new and cancelled in a single ticket
    if (orderPrintLine.state === State.NEW) {
      printer.bold(true);
      printer.alignCenter();
      printer.println(orderToPrint.id);
      printer.table([
        `PISO: ${orderToPrint.floor}`,
        `MESA: ${orderToPrint.table}`,
      ]);
      printer.newLine();
      printer.bold(false);
    }

    // print dish or drink state and time
    printer.table([
      `${orderPrintLine.state === State.NEW ? "NUEVO" : "CANCELADO"}`,
      new Date().toLocaleTimeString(),
    ]);
    printer.table([
      `Cant: ${orderPrintLine.orderline.qty}`,
      `Plato: ${orderPrintLine.orderline.product_id}`,
    ]);
    // print order line
    if (orderPrintLine.orderline.note) {
      printer.newLine();
      printer.alignLeft();
      printer.print("NOTA: ");
      printer.alignRight();
      printer.print(orderPrintLine.orderline.note);
    }

    // print new and cancelled in a single ticket
    if (orderPrintLine.state === State.NEW) {
      printer.newLine();
      printer.cut();
    }
  });
  printer.execute();
};

export { printText, printOrder, printOrderMock };
