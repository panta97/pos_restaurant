import { OrderDiffLine } from "../../types";
import { getOrderState } from "../../utils";

interface TicketLineProps {
  orderLine: OrderDiffLine;
}

const TicketLine = ({ orderLine }: TicketLineProps) => {
  return (
    <>
      <div className="flex justify-between">
        <span>{getOrderState(orderLine.orderDiff)}</span>
        <span>{orderLine.createAt}</span>
      </div>
      <div className="flex justify-between">
        <span>Cant: {orderLine.qty}</span>
        <span>{orderLine.productName}</span>
      </div>
    </>
  );
};

export default TicketLine;
