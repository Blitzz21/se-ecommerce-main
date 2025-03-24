import { supabase } from './supabase';
import { products } from '../data/products';

export const initializeProducts = async () => {
  try {
    console.log('Starting product initialization...');
    
    // Map products to include timestamps while preserving original data
    const productsWithTimestamps = products.map(product => ({
      ...product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // First, let's check what products are currently in the database
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name');

    if (fetchError) {
      console.error('Error fetching existing products:', fetchError);
      return false;
    }

    console.log('Current products in database:', existingProducts?.length || 0);

    // Try to insert products one by one to better handle errors
    let successCount = 0;
    for (const product of productsWithTimestamps) {
      const { error: insertError } = await supabase
        .from('products')
        .upsert([product]);

      if (insertError) {
        console.error(`Error inserting product ${product.name}:`, insertError);
      } else {
        successCount++;
      }
    }

    console.log(`Successfully inserted/updated ${successCount} products`);
    return successCount > 0;
  } catch (err) {
    console.error('Error in initializeProducts:', err);
    return false;
  }
}; 