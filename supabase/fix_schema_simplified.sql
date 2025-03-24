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
-- Allow authenticated users to see their own roles
CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a bootstrap policy to allow the initial admin to create other admins
CREATE POLICY "Bootstrap admin policy"
  ON user_roles
  FOR ALL
  USING (true);

-- Create an initial admin user (replace with your actual admin user ID)
INSERT INTO user_roles (user_id, role)
VALUES ('336187fc-3f85-4de9-9df4-f5d42e5c0b92', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Enable realtime for orders table
DO $$
BEGIN
  -- Check if publication exists
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Publication exists, add table if not already part of it
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'orders'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
  ELSE
    -- Publication doesn't exist, create it with the table
    CREATE PUBLICATION supabase_realtime FOR TABLE public.orders;
  END IF;
END
$$; 