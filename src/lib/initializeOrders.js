import { supabase } from './supabase'

export const initializeOrders = async () => {
  try {
    console.log('Initializing orders table...')
    
    // First check if orders table exists
    const { data: checkResult, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, let's create it
      console.log('Orders table not found. Creating table...')
      
      // Create the table with direct SQL
      const { error: createError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            items JSONB NOT NULL,
            billing_address JSONB,
            customer_name TEXT,
            customer_email TEXT,
            payment_id TEXT,
            payment_method TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
      
      if (createError) {
        console.error('Error creating orders table via RPC:', createError)
        
        // If SQL RPC fails, try localStorage fallback
        console.log('Falling back to localStorage for orders storage')
        
        // Check if demo orders already exist
        if (!window.localStorage.getItem('demoOrders')) {
          // Initialize empty demo orders array
          window.localStorage.setItem('demoOrders', JSON.stringify([]))
          console.log('Initialized empty demoOrders in localStorage')
        }
      } else {
        console.log('Orders table created successfully')
      }
    } else if (checkError) {
      console.error('Error checking orders table:', checkError)
      // Fallback to localStorage
      console.log('Using localStorage for orders')
      if (!window.localStorage.getItem('demoOrders')) {
        window.localStorage.setItem('demoOrders', JSON.stringify([]))
      }
    } else {
      console.log('Orders table already exists')
    }
  } catch (error) {
    console.error('Unexpected error during orders initialization:', error)
    // Ensure localStorage fallback is ready
    if (!window.localStorage.getItem('demoOrders')) {
      window.localStorage.setItem('demoOrders', JSON.stringify([]))
    }
  }
} 