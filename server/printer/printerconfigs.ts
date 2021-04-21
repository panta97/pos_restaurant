import NTP from "node-thermal-printer";

export const TEST_PRINTER = {
  type: NTP.types.EPSON,
  interface: "tcp://192.168.0.51",
};

export const BAR_PRINTER = {
  type: NTP.types.EPSON,
  interface: "tcp://192.168.0.44",
};

export const RESTAURANT_PRINTER = {
  type: NTP.types.EPSON,
  interface: "tcp://192.168.0.45",
};
