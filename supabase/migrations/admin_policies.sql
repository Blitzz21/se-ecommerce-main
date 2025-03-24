-- Create a policy for admins to see all orders
CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Create a policy for admins to update any order
CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  ); 