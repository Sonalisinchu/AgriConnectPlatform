-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'farmer',
  is_verified BOOLEAN DEFAULT false,
  farmer_profile JSONB,
  buyer_profile JSONB,
  fpo_profile JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create crops table
CREATE TABLE IF NOT EXISTS crops (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  farmer_id INTEGER NOT NULL REFERENCES users(id),
  current_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  planted_date TIMESTAMP,
  harvest_date TIMESTAMP,
  location TEXT NOT NULL,
  storage_info TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  crop_id INTEGER NOT NULL REFERENCES crops(id),
  farmer_id INTEGER NOT NULL REFERENCES users(id),
  quantity INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create fpo_members table
CREATE TABLE IF NOT EXISTS fpo_members (
  id SERIAL PRIMARY KEY,
  fpo_id INTEGER NOT NULL REFERENCES users(id),
  farmer_id INTEGER NOT NULL REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create crop_intelligence table
CREATE TABLE IF NOT EXISTS crop_intelligence (
  id SERIAL PRIMARY KEY,
  crop_name TEXT NOT NULL UNIQUE,
  soil_requirements TEXT,
  climate TEXT,
  sowing_window TEXT,
  harvest_window TEXT,
  diseases TEXT,
  pest_management TEXT,
  yield_info TEXT
);

-- Create marketplace_requirements table
CREATE TABLE IF NOT EXISTS marketplace_requirements (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  crop_name TEXT NOT NULL,
  quantity_required INTEGER NOT NULL,
  price_range TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  read BOOLEAN DEFAULT false
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_crops_farmer_id ON crops(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crops_category ON crops(category);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_fpo_members_fpo_id ON fpo_members(fpo_id);
CREATE INDEX IF NOT EXISTS idx_fpo_members_farmer_id ON fpo_members(farmer_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_requirements_buyer_id ON marketplace_requirements(buyer_id);
