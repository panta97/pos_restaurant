import { OrderToPrint, Printer, PrintResult } from "./ordertypes";

const printerErrorHandler = (
  printResults: PrintResult[],
  orderToPrint: OrderToPrint
) => {
  // handle error mismatch between category id
  const allUndefined = printResults.every(
    (pr) =>
      pr.promiseResult.status === "fulfilled" &&
      pr.promiseResult.value === undefined
  );
  if (allUndefined) {
    let errorMsg = "CRITICAL ERROR !!!\n";
    errorMsg += "Nothing got printed, maybe there is a mismatch\n";
    errorMsg += "between print type category id and table products\n";
    errorMsg += "check env variables CAT_ID_BAR and CAT_ID_REST\n";
    errorMsg += "and sqlite table products\n";
    throw new Error(errorMsg);
  }
  // handle error when could not connect with printer
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
