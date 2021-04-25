import NTP from "node-thermal-printer";

const timeout = Number(process.env.PRINTER_TIMEOUT!);
const characterSet = "WPC1252";

export const TEST_PRINTER = {
  type: NTP.types.EPSON,
  interface: "tcp://192.168.0.51",
  characterSet,
  options: {
    timeout,
  },
};

export const BAR_PRINTER = {
  type: NTP.types.EPSON,
  interface: `tcp://${process.env.PRINTER_IP_BAR!}`,
  characterSet,
  options: {
    timeout,
  },
};

export const RESTAURANT_PRINTER = {
  type: NTP.types.EPSON,
  interface: `tcp://${process.env.PRINTER_IP_REST!}`,
  characterSet,
  options: {
    timeout,
  },
};
