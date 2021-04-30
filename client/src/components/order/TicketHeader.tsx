import { OrderDiff } from "../../types";

interface TicketHeaderProps {
  order: OrderDiff;
  printOrder: (
    orderId: string,
    orderLine: number,
    orderAge: number
  ) => Promise<void>;
}

const TicketHeader = ({ order, printOrder }: TicketHeaderProps) => {
  const isSend = () => {
    const printed = order.orderLines.reduce(
      (acc, curr) => (acc += curr.printed),
      0
    );
    return printed !== 0;
  };

  return (
    <>
      <div>
        <p className="font-semibold text-center">{order.id}</p>
        <p className="text-right">
          {isSend() ? (
            <p className=" text-green-600 text-sm font-semibold">ENVIADO</p>
          ) : (
            <button
              className=" border border-red-600 rounded text-red-600 text-sm bg-red-50 font-semibold px-1 cursor-pointer"
              onClick={async () => {
                await printOrder(
                  order.id,
                  order.orderLines[0].orderLineId,
                  order.orderLines[0].orderAge
                );
              }}
            >
              ENVIAR
            </button>
          )}
        </p>
      </div>
      <div className="flex justify-between">
        <p>Piso: {order.floor}</p>
        <p>Mesa: {order.table}</p>
      </div>
    </>
  );
};

export default TicketHeader;
