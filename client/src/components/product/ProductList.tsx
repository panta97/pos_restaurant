import { useEffect, useState } from "react";
import { Product } from "../../types";

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const getProducts = async () => {
    const response = await fetch("/list-products");
    const result: Product[] = await response.json();
    setProducts(result);
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleUpdateButton = async () => {
    const response = await fetch("/update-products", {
      method: "POST",
    });
    const result = await response.json();
    if (response.status === 200) {
      alert(result.msj);
      // retrieve updated products
      getProducts();
    } else {
      alert("error");
    }
  };

  return (
    <div>
      <h1 className="text-3xl">Product list</h1>
      <div className="flex flex-col items-center">
        <div>
          <div className="flex justify-start mb-2">
            <button
              className="text-blue-800 font-semibold border border-blue-800 rounded px-2 py-1"
              onClick={handleUpdateButton}
            >
              Actualizar
            </button>
          </div>
          <table className="table-auto border-collapse border border-gray-800">
            <thead>
              <tr>
                <th className="border px-2 py-1 border-gray-600">Índice</th>
                <th className="border px-2 py-1 border-gray-600">
                  Producto Id
                </th>
                <th className="border px-2 py-1 border-gray-600">Nombre</th>
                <th className="border px-2 py-1 border-gray-600">
                  Categoría Id
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr key={p.id}>
                  <td className="text-center px-2 py-1 border border-gray-600">
                    {index}
                  </td>
                  <td className="text-center px-2 py-1 border border-gray-600">
                    {p.id}
                  </td>
                  <td className="border px-2 py-1 border-gray-600">{p.name}</td>
                  <td className="text-center px-2 py-1 border border-gray-600">
                    {p.categoryId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
