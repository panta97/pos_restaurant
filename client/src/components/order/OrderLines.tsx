import { Category, OrderLine } from "../../types";

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
          <p>Pedidos {categoryName}</p>
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
