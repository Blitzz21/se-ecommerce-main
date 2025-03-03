import { getSaleProducts } from '../data/products'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

export const OnSale = () => {
  const saleProducts = getSaleProducts()
  const { addToCart } = useCart()
  const { user } = useAuth()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Special Offers
        </h1>
        <p className="text-lg text-gray-600">
          Don't miss out on these amazing deals!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {saleProducts.map((product) => (
          <div 
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
          >
            <div className="relative">
              <img 
                src="https://placehold.co/400x300?text=GPU" 
                alt={product.name}
                className="w-full h-48 object-contain bg-gray-50 p-4"
              />
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {product.sale?.percentage}% OFF
              </div>
            </div>

            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {product.name}
              </h2>
              
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
                <span className="text-gray-600 text-sm ml-2">
                  ({product.reviews})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline mb-4">
                <span className="text-xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.sale && (
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

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Link
                  to={`/products/${product.id}`}
                  className="flex-1 text-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  View Details
                </Link>
                <button
                  onClick={() => addToCart({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category_id: product.category,
                    image_url: 'https://placehold.co/400x300?text=GPU',
                    stock: product.stock,
                    created_at: new Date().toISOString()
                  })}
                  disabled={!user || product.stock < 1}
                  className={`flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                    !user 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : product.stock < 1 
                        ? 'bg-red-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {!user 
                    ? 'Login to Buy' 
                    : product.stock < 1 
                      ? 'Out of Stock' 
                      : 'Add to Cart'
                  }
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {saleProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No products are currently on sale. Check back later!
          </p>
        </div>
      )}
    </div>
  )
} 