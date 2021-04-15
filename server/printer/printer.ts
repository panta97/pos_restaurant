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
  paper += "--------------";
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

export { printText, printOrderMock };
