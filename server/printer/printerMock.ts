import lodash from "lodash";
import { updatePrintedState, updatePrintedStateSingle } from "../database/db";
import { printerErrorHandler } from "../error";
import {
  OrderDiffState,
  OrderPrintLine,
  OrderToPrint,
  Printer,
  PrintResult,
} from "../ordertypes";
import fs from "fs";

const printHeader = (orderToPrint: OrderToPrint) => {
  if (orderToPrint.printLines.length === 0) return;

  let paper = `          ${orderToPrint.id}          \n`;
  paper += `Piso: ${orderToPrint.floor}     ${orderToPrint.table}\n`;
  paper += `\n`;
  console.log(paper);
};

const printOrderLine = (orderPrintLine: OrderPrintLine) => {
  let paper = `${
    orderPrintLine.state === OrderDiffState.NEW ? "NUEVO" : "CANCELADO"
  }               ${new Date().toLocaleTimeString()}\n`;
  paper += `Cant: ${orderPrintLine.printLine.qty}               ${orderPrintLine.printLine.productName}\n`;
  if (orderPrintLine.printLine.note) {
    paper += `NOTA:             ${orderPrintLine.printLine.note}\n`;
  }
  console.log(paper);
};

const printOrderLines = (printerType: Printer, orderToPrint: OrderToPrint) => {
  if (orderToPrint.printLines.length === 0) return;
  orderToPrint.printLines.forEach((orderPrintLine) => {
    console.log(
      `>> ${printerType === Printer.BAR ? "BAR" : "RESTAURANT"} PRINTER`
    );
    printHeader(orderToPrint);
    if (Array.isArray(orderPrintLine)) {
      orderPrintLine.forEach((opl, i) => {
        printOrderLine(opl);
        if (i < orderPrintLine.length - 1)
          console.log("------------------------------------------");
      });
    } else {
      printOrderLine(orderPrintLine);
    }
    // cut mock
    console.log(`\n`);
    console.log(`===========================================`);
    console.log(`\n`);
  });
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

const isMockPrinterOn = (printer: Printer) => {
  const file = fs.readFileSync(
    "/Users/roosevelt/Developer/kdosh/pos_restaurant/server/printer/printerState.txt",
    "utf8"
  );
  const lines = file.split("\n");
  const printerBAR = /\w+=(\w+)/i.exec(lines[0])![1];
  const printerREST = /\w+=(\w+)/i.exec(lines[1])![1];
  switch (printer) {
    case Printer.BAR:
      return printerBAR === "on";
    case Printer.RESTAURANT:
      return printerREST === "on";
  }
  return false;
};

const printOrderMock = async (orderToPrint: OrderToPrint) => {
  const printers = [Printer.RESTAURANT, Printer.BAR];
  //  return if order state hasn't changed
  if (orderToPrint.printLines.length === 0) return;
  // if there are no order lines to print
  // it will return {status: 'fulfilled', value: undefined}
  const promiseResults = printers.map((printer) => {
    const order = filterOrderLines(printer, orderToPrint);
    if (isMockPrinterOn(printer)) {
      printOrderLines(printer, order);
      return {
        status: "fulfilled",
        value: "success",
      };
    } else {
      return {
        status: "rejected",
        value: "error",
      };
    }
  });

  const printResults: PrintResult[] = printers.map((printer, i) => ({
    printer: printer,
    promiseResult: promiseResults[i] as PromiseSettledResult<
      String | undefined
    >,
  }));
  updatePrintedState(printResults, orderToPrint);
  printerErrorHandler(printResults, orderToPrint);
};

const printOrderSingleMock = async (orderToPrint: OrderToPrint) => {
  const printers = [Printer.RESTAURANT, Printer.BAR];
  //  return if order state hasn't changed
  if (orderToPrint.printLines.length === 0) return;
  // if there are no order lines to print
  // it will return {status: 'fulfilled', value: undefined}
  const promiseResults = printers.map((printer) => {
    const order = filterOrderLines(printer, orderToPrint);
    if (isMockPrinterOn(printer)) {
      printOrderLines(printer, order);
      return {
        status: "fulfilled",
        value: "success",
      };
    } else {
      return {
        status: "rejected",
        value: "error",
      };
    }
  });

  const printResults: PrintResult[] = printers.map((printer, i) => ({
    printer: printer,
    promiseResult: promiseResults[i] as PromiseSettledResult<
      String | undefined
    >,
  }));
  updatePrintedStateSingle(printResults, orderToPrint);
  printerErrorHandler(printResults, orderToPrint);
};

export { printOrderMock, printOrderSingleMock };
