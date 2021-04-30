import { OrderDiff } from "../../types";
import { getOrderState } from "../../utils";

interface TicketLineProps {
  order: OrderDiff;
}

const TicketLine = ({ order }: TicketLineProps) => {
  return (
    <>
      <div className="flex justify-between">
        <span>{getOrderState(order.orderDiff)}</span>
        <span>{order.createAt}</span>
      </div>
      <div className="flex justify-between">
        <span>Cant: {order.qty}</span>
        <span>{order.productName}</span>
      </div>
    </>
  );
};

export default TicketLine;
