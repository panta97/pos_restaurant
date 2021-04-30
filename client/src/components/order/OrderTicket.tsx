import { OrderDiff } from "../../types";
import TicketHeader from "./TicketHeader";
import TicketLine from "./TicketLine";

interface OrderTicketProps {
  order: OrderDiff | OrderDiff[];
}

export const OrderTicket = ({ order }: OrderTicketProps) => {
  const renderTicket = (order: OrderDiff | OrderDiff[]) => {
    // is a bundle order
    if (Array.isArray(order)) {
      return (
        <>
          <TicketHeader order={order[0]} />
          {order.map((ord, i) => (
            <TicketLine key={i} order={ord} />
          ))}
        </>
      );
      // is a simple order
    } else {
      return (
        <>
          <TicketHeader order={order} />
          <TicketLine order={order} />
        </>
      );
    }
  };

  return (
    <div
      className="p-3 border border-gray-600 mb-2"
      style={{
        width: "330px",
        height: "fit-content",
      }}
    >
      {renderTicket(order)}
    </div>
  );
};
