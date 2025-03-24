const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'https://bxgpysdkbycluoggsrcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z3B5c2RrYnljbHVvZ2dzcmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA2NTIxNzgsImV4cCI6MjAxNjIyODE3OH0.QVQ5WsX5OE5bBe9lJpBWk6mIzfjQvB0LgBs1Zslw_iY'
);

async function initializeDatabase() {
  console.log('Initializing database...');
  
  try {
    // 1. Create profiles table if it doesn't exist
    console.log('Creating profiles table...');
    await createProfilesTable();
    
    // 2. Create products table if it doesn't exist
    console.log('Creating products table...');
    await createProductsTable();
    
    // 3. Create user_roles table if it doesn't exist
    console.log('Creating user_roles table...');
    await createUserRolesTable();
    
    // 4. Create orders table if it doesn't exist
    console.log('Creating orders table...');
    await createOrdersTable();
    
    // 5. Create cart_items table if it doesn't exist
    console.log('Creating cart_items table...');
    await createCartItemsTable();
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

async function createProfilesTable() {
  try {
    // Check if table exists
    const { error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      // Create profiles table
      const { error } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            avatar_url TEXT,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (error) throw error;
      console.log('Profiles table created successfully');
    } else {
      console.log('Profiles table already exists');
    }
  } catch (error) {
    console.error('Error creating profiles table:', error);
    throw error;
  }
}

async function createProductsTable() {
  try {
    // Check if table exists
    const { error: checkError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      // Create products table
      const { error } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            price NUMERIC NOT NULL,
            image TEXT,
            category TEXT,
            stock INTEGER NOT NULL DEFAULT 0,
            brand TEXT,
            model TEXT,
            badge TEXT,
            rating NUMERIC DEFAULT 0,
            reviews INTEGER DEFAULT 0,
            specs JSONB,
            sale JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES auth.users(id)
          );
        `
      });
      
      if (error) throw error;
      console.log('Products table created successfully');
    } else {
      console.log('Products table already exists');
    }
  } catch (error) {
    console.error('Error creating products table:', error);
    throw error;
  }
}

async function createUserRolesTable() {
  try {
    // Check if table exists
    const { error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      // Create user_roles table
      const { error } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS user_roles (
            id SERIAL PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id),
            role TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, role)
          );
        `
      });
      
      if (error) throw error;
      console.log('User_roles table created successfully');
    } else {
      console.log('User_roles table already exists');
    }
  } catch (error) {
    console.error('Error creating user_roles table:', error);
    throw error;
  }
}

async function createOrdersTable() {
  try {
    // Check if table exists
    const { error: checkError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      // Create orders table
      const { error } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id),
            status TEXT NOT NULL DEFAULT 'pending',
            total NUMERIC NOT NULL,
            items JSONB NOT NULL,
            shipping_address JSONB,
            billing_address JSONB,
            payment_method JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (error) throw error;
      console.log('Orders table created successfully');
    } else {
      console.log('Orders table already exists');
    }
  } catch (error) {
    console.error('Error creating orders table:', error);
    throw error;
  }
}

async function createCartItemsTable() {
  try {
    // Check if table exists
    const { error: checkError } = await supabase
      .from('cart_items')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      // Create cart_items table
      const { error } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS cart_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id),
            product_id UUID NOT NULL REFERENCES products(id),
            quantity INTEGER NOT NULL DEFAULT 1,
            selected BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, product_id)
          );
        `
      });
      
      if (error) throw error;
      console.log('Cart_items table created successfully');
    } else {
      console.log('Cart_items table already exists');
    }
  } catch (error) {
    console.error('Error creating cart_items table:', error);
    throw error;
  }
}

// Execute the function
initializeDatabase(); 