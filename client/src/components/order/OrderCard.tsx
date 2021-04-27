import { Category, Order } from "../../types";
import timeDifference from "../../utils";
import OrderLines from "./OrderLines";

interface OrderCardProps {
  order: Order;
  printOrder: (orderId: string) => Promise<void>;
}

const OrderCard = ({ order, printOrder }: OrderCardProps) => {
  return (
    <div
      className="p-3 border border-gray-600 mb-2"
      style={{
        width: "330px",
        height: "fit-content",
      }}
    >
      <p className="font-semibold text-center">{order.id}</p>
      <div className="flex justify-between">
        <p> Piso: {order.floor}</p>
        <p>{order.table}</p>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm">
          {timeDifference(new Date(order.createAt).getTime(), "es-PE")}
        </span>
        <button
          className="border border-green-600 rounded text-green-600 text-sm bg-green-50 font-semibold p-1 mb-2 cursor-pointer"
          onClick={() => printOrder(order.id)}
        >
          ENVIAR
        </button>
      </div>
      <div className="border border-dashed"></div>
      {<OrderLines lines={order.orderLines} category={Category.RESTAURANT} />}
      {<OrderLines lines={order.orderLines} category={Category.BAR} />}
    </div>
  );
};

export default OrderCard;
