import { OrderToPrint, Printer, PrintResult } from "./ordertypes";

const printerErrorHandler = (
  printResults: PrintResult[],
  orderToPrint: OrderToPrint
) => {
  printResults = printResults.filter(
    (pr) => pr.promiseResult.status === "rejected"
  );
  if (printResults.length === 0) return;
  let printersMsg = printResults.map((pr) => {
    let placeholder = "impresora ";
    switch (pr.printer) {
      case Printer.BAR:
        return (placeholder += "BAR");
      case Printer.RESTAURANT:
        return (placeholder += "RESTAURANTE");
    }
  });

  let errorMsg = `No se pudo imprimir la order ${orderToPrint.id}\n`;
  errorMsg += `En ${printersMsg.join(" e ")}\n`;
  errorMsg += `Verificar impresora\n`;
  throw new Error(errorMsg);
};

export { printerErrorHandler };
