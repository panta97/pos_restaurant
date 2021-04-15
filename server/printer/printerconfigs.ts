import NTP from "node-thermal-printer";

const TEST_PRINTER = {
  type: NTP.types.EPSON,
  interface: "tcp://192.168.0.51",
};

export { TEST_PRINTER };
