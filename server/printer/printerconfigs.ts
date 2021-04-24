import NTP from "node-thermal-printer";

const timeout = 500;

export const TEST_PRINTER = {
  type: NTP.types.EPSON,
  interface: "tcp://192.168.0.51",
  options: {
    timeout,
  },
};

export const BAR_PRINTER = {
  type: NTP.types.EPSON,
  interface: "tcp://192.168.0.45",
  options: {
    timeout,
  },
};

export const RESTAURANT_PRINTER = {
  type: NTP.types.EPSON,
  interface: "tcp://192.168.0.44",
  options: {
    timeout,
  },
};
