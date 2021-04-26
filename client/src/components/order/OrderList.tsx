import { useEffect, useState } from "react";
import { Order } from "../../types";
import OrderCard from "./OrderCard";

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    const getOrders = async () => {
      const response = await fetch("/list-orders");
      const result: Order[] = await response.json();
      setOrders(result);
    };
    getOrders();
  }, []);

  return (
    <div>
      <div>Order list</div>
      <div className="px-10">
        <div className="flex flex-wrap justify-between">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
