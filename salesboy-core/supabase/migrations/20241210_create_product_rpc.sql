-- Create product_catalog table
CREATE TABLE IF NOT EXISTS product_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  price DECIMAL(10,2),
  description TEXT,
  category TEXT,
  sku TEXT,
  in_stock BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_catalog_user_id ON product_catalog(user_id);
CREATE INDEX IF NOT EXISTS idx_product_catalog_name ON product_catalog(user_id, product_name);

-- Enable RLS
ALTER TABLE product_catalog ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "Users can manage their own products" ON product_catalog;
CREATE POLICY "Users can manage their own products"
ON product_catalog
FOR ALL
USING (auth.uid() = user_id);

-- Create simple RPC function
CREATE OR REPLACE FUNCTION create_product_catalog_table()
RETURNS void AS $$
BEGIN
  -- Function exists for compatibility
  NULL;
END;
$$ LANGUAGE plpgsql;