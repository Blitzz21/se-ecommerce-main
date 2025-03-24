-- Create the execute_sql function that allows running raw SQL
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This means it will run with the privileges of the function creator
AS $$
BEGIN
  EXECUTE sql;
END;
$$; 