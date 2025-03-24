-- Create a profiles view that works with the auth.users table
CREATE OR REPLACE VIEW profiles AS
SELECT
  id as id,
  email,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users;

-- Grant select permissions to authenticated users
GRANT SELECT ON profiles TO authenticated;

-- Fix user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Make sure the orders table has the right structure
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;

-- Create a new admin user from an existing user (replace with your user ID)
INSERT INTO user_roles (user_id, role)
VALUES ('336187fc-3f85-4de9-9df4-f5d42e5c0b92', 'admin')
ON CONFLICT (user_id, role) DO NOTHING; 