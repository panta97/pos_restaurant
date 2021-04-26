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
}

export interface Order {
  id: string;
  floor: string;
  table: string;
  createAt: string;
  orderLines: OrderLine[];
}
