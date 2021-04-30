import { OrderDiffState, OrderPrinted } from "./ordertypes";

export interface Product {
  id: number;
  name: string;
  categoryId: number;
}

export interface Order {
  id: string;
  floor: string;
  table: string;
  createAt: string;
  orderLineId: number;
  categoryId: number;
  orderDiff: OrderDiffState;
  orderAge: number;
  productName: string;
  qty: number;
  note?: string;
  printed: OrderPrinted;
}
