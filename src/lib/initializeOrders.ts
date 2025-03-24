import { supabase } from './supabase';

export async function initializeOrders() {
  try {
    console.log('Checking if orders table exists...');
    
    // Check if the orders table exists
    const { error } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('Orders table does not exist or is inaccessible:', error.message);
      return;
    }
    
    console.log('Orders table exists, skipping initialization');
  } catch (err) {
    console.error('Error checking orders table:', err);
  }
} 