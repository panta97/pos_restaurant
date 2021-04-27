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

  const printOrder = async (orderId: string) => {
    const response = await fetch("/print-order-specific", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });
    const result = await response.json();
    if (response.status === 500) window.alert(result.msj);
  };

  return (
    <div>
      <div>Order list</div>
      <div className="px-10">
        <div className="flex flex-wrap justify-between">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} printOrder={printOrder} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
