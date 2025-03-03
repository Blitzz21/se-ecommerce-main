import { getFeaturedProducts } from '../data/products'
import { Link } from 'react-router-dom'

export const NewArrivals = () => {
  const newProducts = getFeaturedProducts().filter(product => product.badge === 'NEW')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          New Arrivals
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Check out our latest GPU additions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {newProducts.map((product) => (
          <div 
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
          >
            {/* New Badge */}
            <div className="relative">
              <img 
                src="https://placehold.co/400x300?text=GPU" 
                alt={product.name}
                className="w-full h-48 object-contain bg-gray-100 dark:bg-gray-700 p-4"
              />
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                NEW
              </div>
            </div>

            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h2>
              
              {/* Brand & Model */}
              <div className="flex items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.brand} • {product.model}
                </span>
              </div>

              {/* Ratings */}
              <div className="flex items-center mb-2">
                {Array(5).fill(0).map((_, i) => (
                  <span 
                    key={i} 
                    className={`text-${i < Math.floor(product.rating) ? 'yellow' : 'gray'}-400`}
                  >
                    ★
                  </span>
                ))}
                <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">
                  ({product.reviews})
                </span>
              </div>

              {/* Specs Preview */}
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div>Memory: {product.specs.memory} {product.specs.memoryType}</div>
                <div>Boost Clock: {product.specs.boostClock}</div>
              </div>

              {/* Price */}
              <div className="flex items-baseline mb-4">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${product.price.toFixed(2)}
                </span>
                {product.sale?.active && (
                  <>
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ${product.sale.oldPrice.toFixed(2)}
                    </span>
                    <span className="ml-2 text-sm text-red-500 font-semibold">
                      Save ${(product.sale.oldPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                <div className="flex items-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Link
                  to={`/products/${product.id}`}
                  className="flex-1 text-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  View Details
                </Link>
                <button
                  className={`flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white
                    ${product.stock > 0 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 cursor-not-allowed'}`}
                  disabled={product.stock === 0}
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {newProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No new products available at the moment. Check back soon!
          </p>
        </div>
      )}
    </div>
  )
} 