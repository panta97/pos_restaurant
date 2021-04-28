import { Category, OrderLine, OrderPrinted } from "../../types";

interface OrderLinesProps {
  lines: OrderLine[];
  category: Category;
}

const OrderLines = ({ lines, category }: OrderLinesProps) => {
  lines = lines.filter((l) => l.categoryId === category);
  let categoryName = "";
  switch (category) {
    case Category.BAR:
      categoryName = "BAR";
      break;
    case Category.RESTAURANT:
      categoryName = "RESTAURANTE";
      break;
  }
  return (
    <>
      {lines.length > 0 && (
        <div className="break-all">
          <div className="flex justify-between items-center">
            <p>Pedidos {categoryName}</p>
            {lines.some((line) => line.printed === OrderPrinted.ERROR) ? (
              <button className=" border border-red-600 rounded text-red-600 text-sm bg-red-50 font-semibold px-1 cursor-pointer">
                ENVIAR
              </button>
            ) : (
              <p className=" text-green-600 text-sm font-semibold">ENVIADO</p>
            )}
          </div>
          <ul>
            {lines.map((ol) => (
              <li key={ol.orderLineId}>
                <div className="flex flex-col items-end">
                  <div className="w-full">{`- ${ol.qty} ${ol.productName}`}</div>
                  {ol.note && (
                    <div className="text-gray-600 text-sm italic w-11/12">
                      {ol.note}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default OrderLines;
