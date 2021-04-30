import { OrderDiff } from "../../types";
import timeDifference from "../../utils";

interface TicketHeaderProps {
  order: OrderDiff;
}

const TicketHeader = ({ order }: TicketHeaderProps) => {
  return (
    <>
      <p className="font-semibold text-center">{order.id}</p>
      <div className="flex justify-between">
        <p>Piso: {order.floor}</p>
        <p>Mesa: {order.table}</p>
      </div>
      <div className="flex justify-between">
        <p>{order.createAt}</p>
        <span className="text-sm">
          {timeDifference(new Date(order.createAt).getTime(), "es-PE")}
        </span>
      </div>
    </>
  );
};

export default TicketHeader;
