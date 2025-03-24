import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

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
      console.log('Creating empty orders array in localStorage...');
      
      // Create empty orders array in localStorage
      if (!window.localStorage.getItem('demoOrders')) {
        // Initialize with empty array instead of demo orders
        window.localStorage.setItem('demoOrders', JSON.stringify([]));
        console.log('Empty orders array created in localStorage');
      } else {
        console.log('Orders array already exists in localStorage');
      }
      
      console.log('Using localStorage for orders simulation');
      return;
    }
    
    console.log('Orders table exists, skipping initialization');
  } catch (err) {
    console.error('Error initializing orders:', err);
    
    // Fallback to localStorage in case of any error
    if (!window.localStorage.getItem('demoOrders')) {
      // Initialize with empty array instead of demo orders
      window.localStorage.setItem('demoOrders', JSON.stringify([]));
      console.log('Empty orders array created in localStorage (fallback)');
    }
    
    console.log('Using localStorage for orders simulation (fallback)');
  }
} 