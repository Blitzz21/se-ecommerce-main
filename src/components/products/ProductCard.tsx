import { Link } from 'react-router-dom'
import { HiShoppingCart } from 'react-icons/hi'
import { motion } from 'framer-motion'
import { useCurrency } from '../../contexts/CurrencyContext'

interface ProductCardProps {
  id: string
  name: string
  price: number
  imageUrl?: string
  description: string
  badge?: string
  sale?: {
    active: boolean
    percentage: number
    oldPrice: number
  }
  stock?: number
  addToCart: () => void
  disabled?: boolean
  viewMode?: 'grid' | 'list'
  image?: string
  category?: string
}

const ProductCard = ({
  id,
  name,
  price,
  imageUrl,
  description,
  badge,
  sale,
  stock = 1,
  addToCart,
  disabled = false,
  viewMode = 'grid',
  image,
}: ProductCardProps) => {
  const { format } = useCurrency();

  // List view 
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-xl group relative">
        <Link to={`/products/${id}`} className="block">
          <div className="flex">
            <div className="relative w-1/3">
              {badge && (
                <span className="absolute top-2 left-2 z-10 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {badge}
                </span>
              )}
              {sale?.active && (
                <span className="absolute top-2 right-2 z-10 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {sale.percentage}% OFF
                </span>
              )}
              <img
                src={image || imageUrl || "https://placehold.co/300x200?text=GPU"}
                alt={name}
                className="w-full h-48 object-contain p-4"
              />
            </div>
            <div className="p-4 flex flex-col w-2/3">
              <h3 className="text-lg font-semibold mb-1 group-hover:text-green-600 transition-colors">
                {name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{description}</p>
              
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex flex-col">
                    {sale?.active ? (
                      <>
                        <span className="text-xl font-bold">{format(price)}</span>
                        <span className="text-sm text-gray-500 line-through">
                          {format(sale.oldPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-bold">{format(price)}</span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                {!disabled && stock > 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                  >
                    <HiShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="h-full relative">
      <Link to={`/products/${id}`} className="block h-full">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-lg shadow-md h-full flex flex-col transition-all duration-300 hover:shadow-xl group"
        >
          <div className="relative">
            {badge && (
              <span className="absolute top-2 left-2 z-10 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {badge}
              </span>
            )}
            {sale?.active && (
              <span className="absolute top-2 right-2 z-10 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {sale.percentage}% OFF
              </span>
            )}
            <img
              src={image || imageUrl || "https://placehold.co/300x200?text=GPU"}
              alt={name}
              className="w-full h-48 object-contain p-4"
            />
          </div>
          
          <div className="p-4 flex flex-col flex-grow pb-16">
            <h3 className="text-lg font-semibold mb-1 group-hover:text-green-600 transition-colors">
              {name}
            </h3>
            <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">
              {description}
            </p>
            
            {/* Price and Stock */}
            <div className="mt-auto">
              <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col">
                  {sale?.active ? (
                    <>
                      <span className="text-xl font-bold">{format(price)}</span>
                      <span className="text-sm text-gray-500 line-through">
                        {format(sale.oldPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold">{format(price)}</span>
                  )}
                </div>
                <span className={`text-sm font-medium ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Add to Cart Button */}
      {!disabled && stock > 0 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart();
          }}
          className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg transform transition-transform hover:scale-110 z-10"
          aria-label="Add to cart"
        >
          <HiShoppingCart className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}

export default ProductCard