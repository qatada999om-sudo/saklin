CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  role TEXT CHECK (role IN ('customer','merchant','rider','admin')) NOT NULL,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  otp_verified BOOLEAN DEFAULT FALSE,
  wallet_balance NUMERIC(10,3) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  label TEXT,
  text TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  zone_id BIGINT,
  is_default BOOLEAN DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS zones (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km NUMERIC(6,2)
);
CREATE TABLE IF NOT EXISTS stores (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT REFERENCES users(id),
  type TEXT CHECK (type IN ('grocery','pharmacy','market','water')) NOT NULL,
  name TEXT NOT NULL,
  zone_id BIGINT REFERENCES zones(id),
  open_hours JSONB,
  delivery_radius_km NUMERIC(5,2) DEFAULT 5,
  base_delivery_fee NUMERIC(10,3) DEFAULT 0.500,
  status TEXT CHECK (status IN ('active','inactive','snoozed')) DEFAULT 'active'
);
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id BIGINT REFERENCES categories(id)
);
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT REFERENCES stores(id),
  category_id BIGINT REFERENCES categories(id),
  name TEXT NOT NULL,
  brand TEXT,
  sku TEXT,
  barcode TEXT,
  price NUMERIC(10,3) NOT NULL,
  vat_rate NUMERIC(5,2) DEFAULT 5.00,
  is_otc BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS inventory (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  stock_qty INTEGER DEFAULT 0,
  substitute_group TEXT
);
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  store_id BIGINT REFERENCES stores(id),
  address_id BIGINT REFERENCES addresses(id),
  status TEXT CHECK (status IN ('pending','accepted','shopping','enroute','delivered','cancelled','returned')) DEFAULT 'pending',
  payment_method TEXT CHECK (payment_method IN ('mpgs','apple_pay','google_pay','cod','wallet')),
  subtotal NUMERIC(10,3) NOT NULL,
  delivery_fee NUMERIC(10,3) DEFAULT 0,
  vat_amount NUMERIC(10,3) DEFAULT 0,
  discount NUMERIC(10,3) DEFAULT 0,
  total NUMERIC(10,3) NOT NULL,
  eta_minutes INTEGER,
  scheduled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  qty INTEGER NOT NULL,
  unit_price NUMERIC(10,3) NOT NULL,
  approved_substitute_product_id BIGINT REFERENCES products(id)
);
CREATE TABLE IF NOT EXISTS riders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  vehicle_type TEXT CHECK (vehicle_type IN ('car','bike','scooter')),
  active_zone_id BIGINT REFERENCES zones(id),
  rating NUMERIC(3,2) DEFAULT 5.0,
  documents_verified BOOLEAN DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS shipments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) UNIQUE,
  rider_id BIGINT REFERENCES riders(id),
  pickup_time TIMESTAMP,
  dropoff_time TIMESTAMP,
  gps_path JSONB,
  status TEXT CHECK (status IN ('assigned','picked','enroute','delivered','failed'))
);
CREATE TABLE IF NOT EXISTS returns (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id),
  reason TEXT,
  photos JSONB,
  decision TEXT CHECK (decision IN ('accepted','rejected','partial'))
);
CREATE TABLE IF NOT EXISTS promos (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  type TEXT CHECK (type IN ('percent','amount')),
  value NUMERIC(10,3),
  min_order NUMERIC(10,3) DEFAULT 0,
  zones JSONB,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP
);
