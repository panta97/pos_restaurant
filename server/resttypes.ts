import { OrderPrinted } from "./ordertypes";

export interface Product {
  id: number;
  name: string;
  categoryId: number;
}

export interface OrderLine {
  orderLineId: number;
  categoryId: number;
  productName: string;
  qty: number;
  note?: string;
  printed: OrderPrinted;
}

export interface Order {
  id: string;
  floor: string;
  table: string;
  createAt: string;
  orderLines: OrderLine[];
}
