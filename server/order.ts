import { OrderPrintType, OrderType } from "./ordertypes";

const getOrder = (orderId: string, orders: string): OrderPrintType => {
  // optimize parser for long string ?
  const ordersObj: OrderType[] = JSON.parse(orders);
  const order = ordersObj.find((odr) => odr.id === orderId)!.data;
  const multiprint_resume = order.multiprint_resume
    ? Object.entries(order.multiprint_resume).map(([key, val]) => {
        // key could come in this form "1|sin papas"
        const [, orderLine] = /^(\d+).*/.exec(key)!;
        return {
          order_line: Number(orderLine),
          ...val,
        };
      })
    : [];
  return {
    id: orderId,
    floor: order.floor,
    table: order.table,
    multiprint_resume: multiprint_resume,
  };
};

export { getOrder };
