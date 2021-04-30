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

export interface OrderDiff {
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

export enum Category {
  BAR = 6786,
  RESTAURANT = 6785,
}

export enum OrderPrinted {
  ERROR = 0,
  SUCCESS = 1,
}

export enum OrderDiffState {
  NEW,
  CANCELLED,
}
