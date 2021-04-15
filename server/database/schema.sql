CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR NOT NULL,
    f_floor VARCHAR NOT NULL,
    f_table VARCHAR NOT NULL,
    order_line INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    note TEXT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    category VARCHAR NOT NULL
);
