import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../contexts/CartContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { supabase } from '../lib/supabase'
import { Product } from '../data/products'
import { GpuImage } from '../utils/ImageHelper'

export const LandingPage = () => {
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { format } = useCurrency()

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true)

        // First try to get products with the NEW badge
        let { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('badge', 'NEW')
          .order('created_at', { ascending: false })
          .limit(4)

        if (error) throw error

        // If no products with NEW badge, get the most recently added products
        if (!data || data.length === 0) {
          const { data: recentProducts, error: recentError } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(4)
          
          if (recentError) throw recentError
          
          // Mark these products as NEW
          data = recentProducts?.map(product => ({
            ...product,
            badge: 'NEW' // Add the NEW badge to recent products
          })) || []
        }

        // Ensure each product has a valid image path based on name or model
        const formattedProducts = data?.map(product => {
          // If image is missing, invalid, or needs to be fixed, update it based on name/model
          if (!product.image || !product.image.includes('gpu')) {
            const name = product.name.toUpperCase();
            const model = (product.model || '').toUpperCase();
            
            // Check NVIDIA products
            if (name.includes('NVIDIA') || name.includes('RTX') || name.includes('GTX')) {
              if (name.includes('4090') || model.includes('4090')) {
                product.image = '../assets/gpu/rtx-4090.png';
              } else if (name.includes('4080 SUPER') || model.includes('4080 SUPER')) {
                product.image = '../assets/gpu/rtx-4080-super.png';
              } else if (name.includes('4080') || model.includes('4080')) {
                product.image = '../assets/gpu/rtx-4080.png';
              } else if (name.includes('4070') || model.includes('4070')) {
                product.image = '../assets/gpu/rtx-4070-ti.png';
              } else if (name.includes('6000 ADA') || model.includes('6000 ADA')) {
                product.image = '../assets/gpu/rtx-6000-ada.png';
              } else if (name.includes('6000') || model.includes('6000')) {
                product.image = '../assets/gpu/rtx-6000.png';
              } else if (name.includes('5000') || model.includes('5000')) {
                product.image = '../assets/gpu/rtx-5000.png';
              } else if (name.includes('A100') || model.includes('A100')) {
                product.image = '../assets/gpu/a100.png';
              } else if (name.includes('H100') || model.includes('H100')) {
                product.image = '../assets/gpu/h100.png';
              } else if (name.includes('CMP 170HX') || model.includes('CMP 170HX')) {
                product.image = '../assets/gpu/cmp-170hx.png';
              } else if (name.includes('CMP 50HX') || model.includes('CMP 50HX')) {
                product.image = '../assets/gpu/cmp-50hx.png';
              } else {
                // Default NVIDIA image
                product.image = '../assets/gpu/rtx-4090.png';
              }
            } 
            // Check AMD products
            else if (name.includes('AMD') || name.includes('RADEON') || name.includes('RX')) {
              if (name.includes('7900 XTX') || model.includes('7900 XTX')) {
                product.image = '../assets/gpu/rx-7900-xtx.png';
              } else if (name.includes('7800 XT') || model.includes('7800 XT')) {
                product.image = '../assets/gpu/rx-7800-xt.png';
              } else if (name.includes('7600') || model.includes('7600')) {
                product.image = '../assets/gpu/rx-7600.png';
              } else if (name.includes('W7900X') || model.includes('W7900X')) {
                product.image = '../assets/gpu/w7900x.png';
              } else if (name.includes('W7900') || model.includes('W7900')) {
                product.image = '../assets/gpu/radeon-pro-w7900.png';
              } else if (name.includes('MI250X') || model.includes('MI250X')) {
                product.image = '../assets/gpu/mi250x.png';
              } else {
                // Default AMD image
                product.image = '../assets/gpu/rx-7900-xtx.png';
              }
            } 
            // Check Intel products
            else if (name.includes('INTEL') || name.includes('ARC')) {
              if (name.includes('A770 LIMITED') || model.includes('A770 LIMITED')) {
                product.image = '../assets/gpu/intel-arc-a770.png';
              } else if (name.includes('A770') || model.includes('A770')) {
                product.image = '../assets/gpu/arc-a770.png';
              } else {
                // Default Intel image
                product.image = '../assets/gpu/arc-a770.png';
              }
            }
            // Default for unknown brands
            else {
              product.image = '../assets/gpu/rtx-4090.png';
            }
          }
          
          // Ensure GPU image has correct path format
          if (product.image && !product.image.startsWith('../assets/gpu/') && product.image.includes('gpu')) {
            product.image = '../assets/' + product.image.substring(product.image.indexOf('gpu'));
          }
          
          console.log(`Product ${product.name} image path: ${product.image}`);
          
          return {
            ...product,
            badge: product.badge || undefined,
            sale: product.sale || undefined,
            brand: product.brand as any,
            category: product.category as any
          }
        }) || []

        console.log('Fetched new products:', formattedProducts);
        setNewProducts(formattedProducts)
      } catch (error) {
        console.error('Error fetching new products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNewProducts()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to ShopSmart
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Your one-stop shop for high-performance GPUs
            </p>
            <Link
              to="/products"
              className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* New Arrivals Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            New Arrivals
          </h2>
          <p className="text-lg text-gray-600">
            Check out our latest GPU additions
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((product) => (
              <div key={product.id} className="relative">
                <Link to={`/products/${product.id}`} className="block h-full">
                  <motion.div 
                    className="group bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    whileHover={{ 
                      scale: 1.02,
                      y: -4,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden">
                      <GpuImage
                        src={product.image || "https://placehold.co/400x300?text=GPU"}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* New Badge */}
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                        NEW
                      </div>
                    </div>
                    
                    {/* Product details */}
                    <div className="p-4 flex flex-col flex-grow pb-16">
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">
                        {product.description}
                      </p>
                      
                      {/* Price and Stock */}
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex flex-col">
                            {product.sale?.active ? (
                              <>
                                <span className="text-xl font-bold">{format(product.price)}</span>
                                <span className="text-sm text-gray-500 line-through">
                                  {format(product.sale.oldPrice)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xl font-bold">{format(product.price)}</span>
                            )}
                          </div>
                          <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
                
                {/* Add to Cart Button */}
                {product.stock > 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart({
                        ...product,
                        badge: product.badge,
                        sale: product.sale
                      });
                    }}
                    className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg transform transition-transform hover:scale-110 z-10"
                    aria-label="Add to cart"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link
            to="/new-arrivals"
            className="inline-block bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
          >
            View All New Arrivals
          </Link>
        </div>
      </div>
    </div>
  )
} 