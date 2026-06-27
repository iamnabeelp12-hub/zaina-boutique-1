-- =============================================
-- ZAINA BOUTIQUE - COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SITE SETTINGS (colors, SEO, customization)
-- =============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
('colors', '{"primary":"#c8a96e","secondary":"#1a1a1a","accent":"#f5e6d3","text":"#2d2d2d","background":"#fff9f5","nav_bg":"#1a1a1a","footer_bg":"#1a1a1a"}'),
('seo', '{"site_title":"Zaina Boutique - Premium Fashion","meta_description":"Discover the latest fashion trends at Zaina Boutique. Shop premium clothing, accessories and more.","meta_keywords":"fashion, boutique, women, clothing, zaina, india","og_image":"","google_analytics":""}'),
('general', '{"site_name":"Zaina Boutique","tagline":"Elegance Redefined","phone":"+917418701120","email":"contact@zainaboutique.com","address":"","whatsapp":"+917418701120","currency":"INR","currency_symbol":"₹","free_shipping_above":999}'),
('social', '{"instagram":"","facebook":"","youtube":"","twitter":""}')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (name, slug, display_order) VALUES
('Sarees', 'sarees', 1),
('Kurtas', 'kurtas', 2),
('Lehengas', 'lehengas', 3),
('Dresses', 'dresses', 4),
('Accessories', 'accessories', 5)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  compare_price NUMERIC(10,2),
  images JSONB DEFAULT '[]',
  category_id UUID REFERENCES categories(id),
  stock INT DEFAULT 0,
  sku TEXT,
  sizes JSONB DEFAULT '[]',
  colors JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  tags JSONB DEFAULT '[]',
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BANNERS (Hero + Offer)
-- =============================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link TEXT,
  button_text TEXT,
  type TEXT DEFAULT 'hero', -- 'hero' or 'offer'
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CUSTOMERS
-- =============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CUSTOMER ADDRESSES
-- =============================================
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REFERRAL / AFFILIATE SYSTEM
-- =============================================
CREATE TABLE IF NOT EXISTS referral_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  code TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id),
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  total_earnings NUMERIC(10,2) DEFAULT 0,
  commission_percent NUMERIC(5,2) DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  shipping_charge NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
  payment_method TEXT DEFAULT 'whatsapp',
  notes TEXT,
  referral_code TEXT,
  referrer_customer_id UUID REFERENCES customers(id),
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REFERRAL COMMISSIONS
-- =============================================
CREATE TABLE IF NOT EXISTS referral_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_link_id UUID REFERENCES referral_links(id),
  order_id UUID REFERENCES orders(id),
  referrer_customer_id UUID REFERENCES customers(id),
  commission_amount NUMERIC(10,2),
  status TEXT DEFAULT 'pending', -- pending, approved, paid
  month_year TEXT, -- e.g., "2024-01"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STORAGE BUCKETS (run after creating tables)
-- =============================================
-- In Supabase Dashboard > Storage, create these buckets:
-- 1. "products" - public bucket for product images
-- 2. "banners"  - public bucket for banner images
-- 3. "general"  - public bucket for general site images

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: categories, products, banners, site_settings
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (TRUE);

-- CUSTOMERS: users can read/write their own data
CREATE POLICY "Customers read own" ON customers FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Customers insert own" ON customers FOR INSERT WITH CHECK (auth.uid() = auth_id);
CREATE POLICY "Customers update own" ON customers FOR UPDATE USING (auth.uid() = auth_id);

-- ADDRESSES
CREATE POLICY "Addresses read own" ON customer_addresses FOR SELECT 
  USING (customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()));
CREATE POLICY "Addresses insert own" ON customer_addresses FOR INSERT 
  WITH CHECK (customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()));
CREATE POLICY "Addresses update own" ON customer_addresses FOR UPDATE 
  USING (customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()));
CREATE POLICY "Addresses delete own" ON customer_addresses FOR DELETE 
  USING (customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()));

-- ORDERS: customers can insert and view their own
CREATE POLICY "Orders insert" ON orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Orders read own" ON orders FOR SELECT 
  USING (customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()));

-- REFERRAL LINKS: public read by code, owners manage theirs
CREATE POLICY "Referral links public read" ON referral_links FOR SELECT USING (TRUE);
CREATE POLICY "Referral links insert own" ON referral_links FOR INSERT 
  WITH CHECK (customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()));

-- REFERRAL COMMISSIONS: read own
CREATE POLICY "Commissions read own" ON referral_commissions FOR SELECT 
  USING (referrer_customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()));

-- =============================================
-- ADMIN ROLE (service role bypasses RLS)
-- Use SUPABASE_SERVICE_ROLE_KEY in admin panel only
-- =============================================

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'ZB' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_code ON referral_links(code);
CREATE INDEX IF NOT EXISTS idx_referral_customer ON referral_links(customer_id);
