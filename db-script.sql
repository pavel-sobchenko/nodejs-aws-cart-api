CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create 'carts' table with automatically generated UUID
CREATE TABLE carts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at DATE NOT NULL,
  updated_at DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('OPEN', 'ORDERED'))
);

-- Insert data into 'carts' table
INSERT INTO carts (user_id, created_at, updated_at, status)
VALUES
  (uuid_generate_v4(), '2023-01-01', '2023-01-01', 'OPEN'),
  (uuid_generate_v4(), '2023-01-02', '2023-01-02', 'ORDERED');

-- Create 'cart_items' table with automatically generated UUID
CREATE TABLE cart_items (
  cart_id UUID REFERENCES carts(id),
  product_id UUID,
  count INTEGER,
  PRIMARY KEY (cart_id, product_id)
);

-- Insert data into 'cart_items' table
INSERT INTO cart_items (cart_id, product_id, count)
VALUES
  ((SELECT id FROM carts ORDER BY created_at LIMIT 1), uuid_generate_v4(), 3),
  ((SELECT id FROM carts ORDER BY created_at LIMIT 1), uuid_generate_v4(), 2),
  ((SELECT id FROM carts ORDER BY created_at DESC LIMIT 1), uuid_generate_v4(), 1),
  ((SELECT id FROM carts ORDER BY created_at DESC LIMIT 1), uuid_generate_v4(), 4);

