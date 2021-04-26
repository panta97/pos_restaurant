/* ------------------ odoo pos types ------------------ */
// post restaurant unpaid order types
export interface OrderType {
  id: string;
  data: OrderData;
}

export interface OrderData {
  name: string;
  amount_paid: number;
  amount_total: number;
  amount_tax: number;
  amount_return: number;
  lines?: OrderLine[] | null;
  statement_ids?: null[] | null;
  pos_session_id: number;
  pricelist_id: number;
  partner_id: boolean;
  user_id: number;
  uid: string;
  sequence_number: number;
  creation_date: string;
  fiscal_position_id: boolean;
  to_invoice: boolean;
  loyalty_points: number;
  multiprint_resume: { [k: string]: MultiprintLine };
  table: string;
  table_id: number;
  floor: string;
  floor_id: number;
  customer_count: number;
}
export interface OrderLine {
  qty: number;
  price_unit: number;
  discount: number;
  product_id: number;
  tax_ids?: ((number | boolean | number[] | null)[] | null)[] | null;
  id: number;
  pack_lot_ids?: null[] | null;
  mp_dirty: boolean;
  mp_skip: boolean;
  note: string;
}

export interface MultiprintLine {
  qty: number;
  note?: string | null;
  product_id: number;
  product_name_wrapped?: string[] | null;
}

/* ------------------ custom types ------------------ */
export interface MultiprintLineExt extends MultiprintLine {
  order_line: number;
}

export interface PrintLine {
  qty: number;
  productName: string;
  note?: string | null;
  productId: number;
  categoryId: number;
  orderLine: number;
}

export interface OrderPrintType {
  id: string;
  floor: string;
  table: string;
  printLines: PrintLine[];
  createdAt: string;
  posSessionId: number;
}

export interface OrderDb {
  id: string;
  f_floor: string;
  f_table: string;
  order_line: number;
  qty: number;
  product_id: number;
  note?: string;
  product_name: string;
  category_id: number;
  created_at: string;
  pos_session_id: number;
}

export interface ProductDb {
  id: number;
  name: string;
  category_id: number;
}

export enum OrderDiffState {
  NEW,
  CANCELLED,
}

// relation target printer with product category
export enum Printer {
  BAR = Number(process.env.CAT_ID_BAR!),
  RESTAURANT = Number(process.env.CAT_ID_REST!),
}

// custom print helper types
export interface OrderPrintLine {
  targetPrinter: Printer;
  state: OrderDiffState;
  printLine: PrintLine;
}

export interface OrderToPrint {
  id: string;
  floor: string;
  table: string;
  printLines: (OrderPrintLine | OrderPrintLine[])[];
}

// product rest type
export interface RestProduct {
  id: number;
  name: string;
  category_id: number;
}

// error types
export interface PrintResult {
  promiseResult: PromiseSettledResult<String | undefined>;
  printer: Printer;
}
