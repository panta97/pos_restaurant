import NTP from "node-thermal-printer";

const timeout = Number(process.env.PRINTER_TIMEOUT!);

export const TEST_PRINTER = {
  type: NTP.types.EPSON,
  interface: "tcp://192.168.0.51",
  options: {
    timeout,
  },
};

export const BAR_PRINTER = {
  type: NTP.types.EPSON,
  interface: `tcp://${process.env.PRINTER_IP_BAR!}`,
  options: {
    timeout,
  },
};

export const RESTAURANT_PRINTER = {
  type: NTP.types.EPSON,
  interface: `tcp://${process.env.PRINTER_IP_REST!}`,
  options: {
    timeout,
  },
};
