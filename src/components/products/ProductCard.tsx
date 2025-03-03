import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowRight } from 'react-icons/hi'

interface ProductCardProps {
  id: string
  name: string
  price: number
  imageUrl: string
  description: string
  badge?: string
  sale?: {
    active: boolean
    percentage: number
    oldPrice: number
  }
  addToCart: (product: any) => void
  disabled?: boolean
  viewMode?: 'grid' | 'list'
}

const ProductCard = ({ id, name, price, imageUrl, description, badge, sale, addToCart, disabled = false }: ProductCardProps) => {
  const handleAddToCart = () => {
    if (!disabled) {
      addToCart({
        id,
        name,
        price,
        imageUrl,
        description,
        badge: badge || null,
        sale: sale || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  };

  return (
    <motion.div 
      className="group bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
      whileHover={{ 
        scale: disabled ? 1 : 1.02,
        y: disabled ? 0 : -4,
        boxShadow: disabled ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Product Image with overlay */}
      <div className="relative overflow-hidden">
        <img
          src={imageUrl || "https://placehold.co/400x300?text=GPU"}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badge if exists */}
        {badge && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-full">
            {badge}
          </div>
        )}
        
        {/* Quick-add button overlay */}
        {!disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors transform hover:scale-105"
            >
              Quick Add
            </button>
          </div>
        )}
      </div>
      
      {/* Product details */}
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/products/${id}`}>
          <h3 className="text-lg font-semibold mb-1 group-hover:text-green-600 transition-colors">{name}</h3>
          <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
        </Link>
        
        {/* Price and CTA */}
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xl font-bold">${price.toFixed(2)}</p>
            {sale && (
              <span className="text-red-500 text-sm font-bold">SALE</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={disabled}
            className={`w-full ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-green-600'} text-white px-4 py-2 rounded transition-colors flex items-center justify-center`}
          >
            <span>{disabled ? 'Out of Stock' : 'Add to Cart'}</span>
            {!disabled && <HiArrowRight className="ml-2 h-4 w-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard