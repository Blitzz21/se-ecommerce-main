-- Fix for billing_address column in orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;

-- Create/Fix user_roles table with proper foreign key
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
-- Only admins can view user roles
CREATE POLICY "Admins can view user roles"
  ON user_roles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Only admins can insert user roles
CREATE POLICY "Admins can insert user roles"
  ON user_roles
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Only admins can update user roles
CREATE POLICY "Admins can update user roles"
  ON user_roles
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Only admins can delete user roles
CREATE POLICY "Admins can delete user roles"
  ON user_roles
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Create storage buckets with proper permissions
-- First, ensure the storage extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to create a bucket if it doesn't exist
CREATE OR REPLACE FUNCTION create_bucket_if_not_exists(bucket_name TEXT, public_access BOOLEAN DEFAULT FALSE)
RETURNS void AS $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
  VALUES (bucket_name, bucket_name, public_access, FALSE, 52428800, NULL)
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create product-images bucket
SELECT create_bucket_if_not_exists('product-images', TRUE);

-- Create policy for product-images bucket - anyone can read
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Public Read Access',
  '{"name":"Public Read Access","definition":{"allow_anonymous":true,"allow_public":true,"operations":["SELECT"]},"roleArn":"policy/storage/product-images/Public Read Access","createdAt":"2023-01-01T00:00:00.000Z","updatedAt":"2023-01-01T00:00:00.000Z"}',
  'product-images'
)
ON CONFLICT (name, bucket_id) DO NOTHING;

-- Create policy for product-images bucket - authenticated users can upload
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Authenticated Upload Access',
  '{"name":"Authenticated Upload Access","definition":{"authenticated":true,"operations":["INSERT", "UPDATE", "DELETE"]},"roleArn":"policy/storage/product-images/Authenticated Upload Access","createdAt":"2023-01-01T00:00:00.000Z","updatedAt":"2023-01-01T00:00:00.000Z"}',
  'product-images'
)
ON CONFLICT (name, bucket_id) DO NOTHING;

-- Create an initial admin user (replace with your actual admin user ID)
INSERT INTO user_roles (user_id, role)
VALUES ('336187fc-3f85-4de9-9df4-f5d42e5c0b92', 'admin')
ON CONFLICT (user_id, role) DO NOTHING; 