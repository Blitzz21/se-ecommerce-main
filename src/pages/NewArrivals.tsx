import { getFeaturedProducts } from '../data/products'
import { useCart } from '../contexts/CartContext'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCurrency } from '../contexts/CurrencyContext'

export const NewArrivals = () => {
  const newProducts = getFeaturedProducts().filter(product => product.badge === 'NEW')
  const { addToCart } = useCart()
  const { format } = useCurrency()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          New Arrivals
        </h1>
        <p className="text-lg text-gray-600">
          Check out our latest GPU additions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                  <img
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
                <div className="p-4 flex flex-col flex-grow">
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

      {/* Empty State */}
      {newProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No new products available at the moment. Check back soon!
          </p>
        </div>
      )}
    </div>
  )
}

export default NewArrivals