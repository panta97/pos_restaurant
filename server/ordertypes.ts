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

export interface OrderPrintType {
  id: string;
  floor: string;
  table: string;
  multiprint_resume: MultiprintLineExt[];
}

export interface OrderDbType {
  id: string;
  f_floor: string;
  f_table: string;
  order_line: number;
  qty: number;
  product_id: number;
  note?: string;
}

export enum State {
  NEW,
  CANCELLED,
}

// custom print helper types
export interface OrderPrintLine {
  targetPrinter: string;
  state: State;
  orderline: MultiprintLine;
}

export interface OrderToPrint {
  id: string;
  floor: string;
  table: string;
  printLines: OrderPrintLine[];
}