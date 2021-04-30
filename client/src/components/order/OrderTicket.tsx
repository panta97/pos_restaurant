import { OrderDiff } from "../../types";
import TicketHeader from "./TicketHeader";
import TicketLine from "./TicketLine";

interface OrderTicketProps {
  order: OrderDiff;
}

export const OrderTicket = ({ order }: OrderTicketProps) => {
  return (
    <div
      className="p-3 border border-gray-600 mb-2"
      style={{
        width: "330px",
        height: "fit-content",
      }}
    >
      <TicketHeader order={order} />
      {order.orderLines.map((orderLine, i) => (
        <TicketLine key={i} orderLine={orderLine} />
      ))}
    </div>
  );
};
