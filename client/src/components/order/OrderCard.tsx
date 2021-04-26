import React from "react";
import { Category, Order } from "../../types";
import OrderLines from "./OrderLines";

interface OrderCardProps {
  order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
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
      <div className="text-sm">{order.createAt}</div>
      <div className="border border-dashed"></div>
      {<OrderLines lines={order.orderLines} category={Category.RESTAURANT} />}
      {<OrderLines lines={order.orderLines} category={Category.BAR} />}
    </div>
  );
};

export default OrderCard;
