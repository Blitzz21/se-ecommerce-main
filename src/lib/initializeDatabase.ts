import { supabase } from './supabase';
import { initializeProducts } from './initializeProducts';
import { initializeOrders } from './initializeOrders';

/**
 * Initializes all necessary database tables and schema for the application.
 * This includes:
 * - user_roles table for admin permission management
 * - products table for product storage
 * - orders table for order management
 * - cart_items table for shopping cart
 */
const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Check if user_roles table exists, if not create it
    const { error: checkRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);
      
    if (checkRolesError) {
      console.log('Creating user_roles table...');
      const { error: createRolesError } = await supabase.rpc('create_user_roles_table');
      
      if (createRolesError) {
        console.error('Error creating user_roles table:', createRolesError);
      } else {
        console.log('user_roles table created successfully');
      }
    } else {
      console.log('user_roles table already exists');
    }
    
    // Initialize products
    console.log('Initializing products...');
    await initializeProducts();
    
    // Initialize orders
    console.log('Initializing orders...');
    await initializeOrders();
    
    // Check if cart_items table exists, if not create it
    const { error: checkCartError } = await supabase
      .from('cart_items')
      .select('*')
      .limit(1);
      
    if (checkCartError) {
      console.log('Creating cart_items table...');
      const { error: createCartError } = await supabase.rpc('create_cart_items_table');
      
      if (createCartError) {
        console.error('Error creating cart_items table:', createCartError);
      } else {
        console.log('cart_items table created successfully');
      }
    } else {
      console.log('cart_items table already exists');
    }
    
    console.log('Database initialization completed');
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
}

/**
 * Create database RPC functions for table creation
 * 
 * This function creates the SQL functions that can be called via supabase.rpc() to create tables.
 * It should be run once or via database migrations, not in regular app code.
 */
const createDatabaseFunctions = async () => {
  try {
    // Create function to create user_roles table
    const createUserRolesFn = `
      CREATE OR REPLACE FUNCTION create_user_roles_table()
      RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS user_roles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(user_id, role)
        );
        
        -- Add RLS policies
        ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
        
        -- Admin users can read any role
        CREATE POLICY "Admins can read any role" ON user_roles
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM user_roles
              WHERE user_id = auth.uid() AND role = 'admin'
            )
          );
        
        -- Users can read their own roles
        CREATE POLICY "Users can read own roles" ON user_roles
          FOR SELECT USING (auth.uid() = user_id);
          
        -- Only admins can insert/update/delete roles
        CREATE POLICY "Only admins can insert roles" ON user_roles
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM user_roles
              WHERE user_id = auth.uid() AND role = 'admin'
            )
          );
          
        CREATE POLICY "Only admins can update roles" ON user_roles
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM user_roles
              WHERE user_id = auth.uid() AND role = 'admin'
            )
          );
          
        CREATE POLICY "Only admins can delete roles" ON user_roles
          FOR DELETE USING (
            EXISTS (
              SELECT 1 FROM user_roles
              WHERE user_id = auth.uid() AND role = 'admin'
            )
          );
      END;
      $$;
    `;
    
    // Create function to create cart_items table
    const createCartItemsFn = `
      CREATE OR REPLACE FUNCTION create_cart_items_table()
      RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS cart_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          product_id UUID NOT NULL,
          product_name TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Add RLS policies
        ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
        
        -- Users can read their own cart items
        CREATE POLICY "Users can read own cart items" ON cart_items
          FOR SELECT USING (auth.uid() = user_id);
          
        -- Users can insert their own cart items
        CREATE POLICY "Users can insert own cart items" ON cart_items
          FOR INSERT WITH CHECK (auth.uid() = user_id);
          
        -- Users can update their own cart items
        CREATE POLICY "Users can update own cart items" ON cart_items
          FOR UPDATE USING (auth.uid() = user_id);
          
        -- Users can delete their own cart items
        CREATE POLICY "Users can delete own cart items" ON cart_items
          FOR DELETE USING (auth.uid() = user_id);
      END;
      $$;
    `;
    
    // Execute the SQL to create the functions
    const { error: createUserRolesFnError } = await supabase.rpc('create_user_roles_function', {
      sql: createUserRolesFn
    });
    
    if (createUserRolesFnError) {
      console.error('Error creating user_roles function:', createUserRolesFnError);
    } else {
      console.log('user_roles function created successfully');
    }
    
    const { error: createCartItemsFnError } = await supabase.rpc('create_cart_items_function', {
      sql: createCartItemsFn
    });
    
    if (createCartItemsFnError) {
      console.error('Error creating cart_items function:', createCartItemsFnError);
    } else {
      console.log('cart_items function created successfully');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating database functions:', error);
    return { success: false, error };
  }
}

export { initializeDatabase, createDatabaseFunctions }; 