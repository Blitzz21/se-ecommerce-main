import { supabase } from '../lib/supabase';

// Map of product names/models to local image paths - Using paths that the ImageHelper.tsx will recognize
const productImageMap = {
  // NVIDIA
  'NVIDIA GeForce RTX 4090': '../assets/gpu/rtx-4090.png',
  'RTX 4090': '../assets/gpu/rtx-4090.png',
  'NVIDIA GeForce RTX 4080 SUPER': '../assets/gpu/rtx-4080-super.png',
  'RTX 4080 SUPER': '../assets/gpu/rtx-4080-super.png',
  'NVIDIA GeForce RTX 4080': '../assets/gpu/rtx-4080.png',
  'RTX 4080': '../assets/gpu/rtx-4080.png',
  'NVIDIA GeForce RTX 4070 Ti SUPER': '../assets/gpu/rtx-4070-ti.png',
  'RTX 4070 Ti SUPER': '../assets/gpu/rtx-4070-ti.png',
  'NVIDIA RTX 6000 Ada Generation': '../assets/gpu/rtx-6000-ada.png',
  'RTX 6000 Ada': '../assets/gpu/rtx-6000-ada.png',
  'NVIDIA RTX 6000': '../assets/gpu/rtx-6000.png',
  'RTX 6000': '../assets/gpu/rtx-6000.png',
  'NVIDIA RTX 5000 Ada Generation': '../assets/gpu/rtx-5000.png',
  'RTX 5000': '../assets/gpu/rtx-5000.png',
  'NVIDIA A100': '../assets/gpu/a100.png',
  'A100': '../assets/gpu/a100.png',
  'NVIDIA H100': '../assets/gpu/h100.png',
  'H100': '../assets/gpu/h100.png',
  'NVIDIA CMP 170HX': '../assets/gpu/cmp-170hx.png',
  'CMP 170HX': '../assets/gpu/cmp-170hx.png',
  'NVIDIA CMP 50HX': '../assets/gpu/cmp-50hx.png',
  'CMP 50HX': '../assets/gpu/cmp-50hx.png',
  
  // AMD
  'AMD Radeon RX 7900 XTX': '../assets/gpu/rx-7900-xtx.png',
  'RX 7900 XTX': '../assets/gpu/rx-7900-xtx.png',
  'AMD Radeon RX 7800 XT': '../assets/gpu/rx-7800-xt.png',
  'RX 7800 XT': '../assets/gpu/rx-7800-xt.png',
  'AMD Radeon RX 7600': '../assets/gpu/rx-7600.png',
  'RX 7600': '../assets/gpu/rx-7600.png',
  'AMD Radeon PRO W7900': '../assets/gpu/radeon-pro-w7900.png',
  'Radeon PRO W7900': '../assets/gpu/radeon-pro-w7900.png',
  'AMD Radeon PRO W7900X': '../assets/gpu/w7900x.png',
  'W7900X': '../assets/gpu/w7900x.png',
  'AMD Instinct MI250X': '../assets/gpu/mi250x.png',
  'MI250X': '../assets/gpu/mi250x.png',
  
  // Intel
  'Intel Arc A770': '../assets/gpu/arc-a770.png',
  'Arc A770': '../assets/gpu/arc-a770.png',
  'Intel Arc A770 Limited Edition': '../assets/gpu/intel-arc-a770.png',
  'Arc A770 LE': '../assets/gpu/intel-arc-a770.png',
};

async function updateProductImages() {
  try {
    console.log('Fetching all products from the database...');
    const { data: products, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${products.length} products. Starting update...`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      // Try to find a matching image based on product name or model
      let imagePath = null;
      
      // Check full product name first
      if (productImageMap[product.name]) {
        imagePath = productImageMap[product.name];
      } 
      // Then check model
      else if (productImageMap[product.model]) {
        imagePath = productImageMap[product.model];
      }
      // Fallback to brand + searching
      else {
        // Find any key in the map that contains this product's name
        const matchingKey = Object.keys(productImageMap).find(key => 
          product.name.includes(key) || key.includes(product.name)
        );
        
        if (matchingKey) {
          imagePath = productImageMap[matchingKey];
        }
      }
      
      if (imagePath) {
        console.log(`Updating image for ${product.name} to ${imagePath}`);
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ image: imagePath })
          .eq('id', product.id);
        
        if (updateError) {
          console.error(`Failed to update ${product.name}:`, updateError);
        } else {
          updatedCount++;
        }
      } else {
        console.warn(`No matching image found for ${product.name}`);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} products.`);
    
  } catch (error) {
    console.error('Error updating products:', error);
  }
}

// Execute the update function
updateProductImages();

export default updateProductImages; 