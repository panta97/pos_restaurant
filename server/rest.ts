import fetch from "node-fetch";
import { RestProduct } from "./ordertypes";

const getProducts = async (): Promise<RestProduct[]> => {
  const response = await fetch(process.env.API_URL!, {
    method: "GET",
    headers: { "x-api-key": process.env.API_KEY! },
    redirect: "follow",
  });
  const products: RestProduct[] = await response.json();
  return products;
};

export { getProducts };
