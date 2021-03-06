const tableOrders = `
    CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR NOT NULL,
    f_floor VARCHAR NOT NULL,
    f_table VARCHAR NOT NULL,
    order_line INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    note TEXT,
    product_name VARCHAR NOT NULL,
    category_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    pos_session_id INTEGER NOT NULL
    );`;

const tableOrdersDiff = `
    CREATE TABLE IF NOT EXISTS d_orders (
    id VARCHAR NOT NULL,
    f_floor VARCHAR NOT NULL,
    f_table VARCHAR NOT NULL,
    order_diff INTEGER NOT NULL,
    order_line INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    note TEXT,
    product_name VARCHAR NOT NULL,
    category_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    target_printer INTEGER NOT NULL,
    printed INTEGER,
    order_age INTEGER,
    pos_session_id INTEGER NOT NULL
    );`;

const tableProducts = `
    CREATE TABLE IF NOT EXISTS products (
    id INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    category_id INTEGER NOT NULL
);`;

export { tableOrders, tableProducts, tableOrdersDiff };
