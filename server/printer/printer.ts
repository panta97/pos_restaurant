import NTP from "node-thermal-printer";
import { TEST_PRINTER } from "./printerconfigs";

const printText = (text: string) => {
  const printer = new NTP.printer(TEST_PRINTER);
  printer.println(text);
  printer.cut();
  printer.execute();
};

export { printText };
