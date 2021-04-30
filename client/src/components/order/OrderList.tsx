import { useEffect, useState } from "react";
import { OrderDiff } from "../../types";
import { OrderTicket } from "./OrderTicket";

const OrderList = () => {
  const [orders, setOrders] = useState<OrderDiff[]>([]);
  const getOrders = async () => {
    const response = await fetch("/list-orders");
    const result: OrderDiff[] = await response.json();
    setOrders(result);
  };

  useEffect(() => {
    getOrders();
  }, []);

  const printOrder = async (
    orderId: string,
    orderLine: number,
    orderAge: number
  ) => {
    const response = await fetch("/print-order-specific", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, orderLine, orderAge }),
    });
    const result = await response.json();
    if (response.status === 500) window.alert(result.msj);
    else if (response.status === 200) {
      window.alert("Printed successfully");
      getOrders();
    }
  };

  return (
    <div>
      <div>Order list</div>
      <div className="px-10">
        <div className="flex flex-wrap justify-between">
          {orders.map((order) => (
            <OrderTicket key={order.id} order={order} printOrder={printOrder} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
