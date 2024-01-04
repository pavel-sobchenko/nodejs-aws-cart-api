-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create 'users' table with automatically generated UUID
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE
);

-- Create 'carts' table with foreign key relationship to 'users'
CREATE TABLE carts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  created_at DATE NOT NULL,
  updated_at DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('OPEN', 'ORDERED'))
);

-- Create 'orders' table with foreign key relationships to 'users' and 'carts'
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  cart_id UUID REFERENCES carts(id),
  payment JSONB,
  delivery JSONB,
  comments TEXT,
  status VARCHAR(20) CHECK (status IN ('ORDERED', 'OPEN')),
  total NUMERIC(10, 2) NOT NULL
);

-- Insert sample user data
INSERT INTO users (username, email) VALUES
  ('user1', 'user1@example.com'),
  ('user2', 'user2@example.com');

-- Insert sample cart data
INSERT INTO carts (user_id, created_at, updated_at, status) VALUES
  ((SELECT id FROM users WHERE username = 'user1'), '2023-01-01', '2023-01-01', 'OPEN'),
  ((SELECT id FROM users WHERE username = 'user2'), '2023-01-02', '2023-01-02', 'OPEN');

-- Insert sample order data
INSERT INTO orders (user_id, cart_id, payment, delivery, comments, status, total) VALUES
  ((SELECT id FROM users WHERE username = 'user1'), 
  (SELECT id FROM carts WHERE user_id = (SELECT id FROM users WHERE username = 'user1')), 
  '{"currency": "USD"}', '{"address": "123 Main St"}', 'Order comments', 'ORDERED', 100.50),
  ((SELECT id FROM users WHERE username = 'user2'), 
  (SELECT id FROM carts WHERE user_id = (SELECT id FROM users WHERE username = 'user2')), 
  '{"currency": "USD"}', '{"address": "456 Oak St"}', 'Another order comments', 'ORDERED', 75.25);
