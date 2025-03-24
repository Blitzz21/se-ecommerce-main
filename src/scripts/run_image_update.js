import { supabase } from '../lib/supabase';
import fs from 'fs';
import path from 'path';

/**
 * Run the SQL commands to update product images
 */
async function runImageUpdateSQL() {
  try {
    console.log('Reading SQL update script...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'update_product_images.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement 
        });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
        } else {
          successCount++;
          console.log(`Successfully executed statement ${i + 1}`);
        }
      } catch (stmtError) {
        console.error(`Exception executing statement ${i + 1}:`, stmtError);
      }
    }
    
    console.log(`Finished executing SQL statements. ${successCount} of ${statements.length} were successful.`);
    console.log('Product images have been updated to use local GPU assets.');
    
  } catch (error) {
    console.error('Error running image update SQL:', error);
  }
}

// Alternative method using individual update statements through Supabase JS client
async function updateProductImages() {
  try {
    console.log('Starting product image update process...');
    
    // Get all products
    const { data: products, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) throw error;
    
    console.log(`Found ${products?.length || 0} products. Updating images...`);
    
    // Image mapping (same as in SQL script)
    const imageMapping = {
      // NVIDIA
      'RTX 4090': '../assets/gpu/rtx-4090.png',
      'RTX 4080 SUPER': '../assets/gpu/rtx-4080-super.png',
      'RTX 4080': '../assets/gpu/rtx-4080.png',
      'RTX 4070': '../assets/gpu/rtx-4070-ti.png',
      'RTX 6000 Ada': '../assets/gpu/rtx-6000-ada.png',
      'RTX 6000': '../assets/gpu/rtx-6000.png',
      'RTX 5000': '../assets/gpu/rtx-5000.png',
      'A100': '../assets/gpu/a100.png',
      'H100': '../assets/gpu/h100.png',
      'CMP 170HX': '../assets/gpu/cmp-170hx.png',
      'CMP 50HX': '../assets/gpu/cmp-50hx.png',
      
      // AMD
      'RX 7900 XTX': '../assets/gpu/rx-7900-xtx.png',
      'RX 7800 XT': '../assets/gpu/rx-7800-xt.png',
      'RX 7600': '../assets/gpu/rx-7600.png',
      'Radeon PRO W7900': '../assets/gpu/radeon-pro-w7900.png',
      'W7900X': '../assets/gpu/w7900x.png',
      'MI250X': '../assets/gpu/mi250x.png',
      
      // Intel
      'Arc A770': '../assets/gpu/arc-a770.png',
      'Arc A770 LE': '../assets/gpu/intel-arc-a770.png'
    };
    
    // Process each product
    let updatedCount = 0;
    const updates = [];
    
    for (const product of products || []) {
      let imagePath = null;
      
      // Find a matching image based on model or name
      for (const [key, path] of Object.entries(imageMapping)) {
        if (product.model?.includes(key) || product.name?.includes(key)) {
          imagePath = path;
          break;
        }
      }
      
      // Default to brand if no specific match
      if (!imagePath) {
        if (product.brand === 'NVIDIA') {
          imagePath = '../assets/gpu/rtx-4090.png';
        } else if (product.brand === 'AMD') {
          imagePath = '../assets/gpu/rx-7900-xtx.png';
        } else if (product.brand === 'Intel') {
          imagePath = '../assets/gpu/arc-a770.png';
        }
      }
      
      // Update if we found a matching image
      if (imagePath && product.image !== imagePath) {
        updates.push(
          supabase
            .from('products')
            .update({ image: imagePath })
            .eq('id', product.id)
            .then(({ error }) => {
              if (!error) {
                updatedCount++;
                console.log(`Updated ${product.name} with image ${imagePath}`);
              } else {
                console.error(`Failed to update ${product.name}:`, error);
              }
              return { id: product.id, success: !error };
            })
        );
      }
    }
    
    // Wait for all updates to complete
    await Promise.all(updates);
    
    console.log(`Successfully updated ${updatedCount} product images.`);
    
  } catch (error) {
    console.error('Error updating product images:', error);
  }
}

// Choose which method to run
// Uncomment one of these

// Execute via rpc exec_sql (requires proper permissions)
// runImageUpdateSQL();

// Execute via JS client
updateProductImages();

console.log("Image update script started. Check the logs for results."); 