-- Drop and recreate Orders table (Example)

DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(255) DEFAULT 'Placed Order',
  place_order_time TIMESTAMP
);
