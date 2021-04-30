import { OrderDiffState, OrderPrinted } from "./ordertypes";

export interface Product {
  id: number;
  name: string;
  categoryId: number;
}

export interface OrderLine {
  orderLineId: number;
  categoryId: number;
  orderDiff: OrderDiffState;
  orderAge: number;
  productName: string;
  qty: number;
  note?: string;
  printed: OrderPrinted;
  createAt: string;
}

export interface Order {
  id: string;
  floor: string;
  table: string;
  orderLines: OrderLine[];
}
