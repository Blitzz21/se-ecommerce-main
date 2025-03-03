import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface ProductCardProps {
  id: string
  name: string
  price: number
  imageUrl: string
  description: string
  viewMode: 'grid' | 'list'
}

const ProductCard = ({ id, name, price, imageUrl, description, viewMode }: ProductCardProps) => {
  const containerClass = viewMode === 'grid'
    ? "bg-white rounded-lg shadow-md overflow-hidden"
    : "bg-white rounded-lg shadow-md overflow-hidden flex"

  const imageClass = viewMode === 'grid'
    ? "aspect-w-1 aspect-h-1"
    : "w-48 h-48 flex-shrink-0"

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        y: -4,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={{ duration: 0.3 }}
      className={containerClass}
    >
      <Link to={`/products/${id}`} className={viewMode === 'list' ? 'flex' : ''}>
        <div className={imageClass}>
          <img
            src={imageUrl || "https://placehold.co/400x300?text=GPU"}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className={viewMode === 'list' ? 'flex-1 p-6' : 'p-4'}>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="mt-1 text-gray-500 text-sm line-clamp-2">{description}</p>
          <p className="mt-2 text-lg font-bold text-primary-600">
            ${price.toFixed(2)}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProductCard 