import { useState, useEffect } from 'react'
import { Product } from '../../data/products'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'

interface ProductGridProps {
  products: Product[]
  viewMode: 'grid' | 'list'
}

const categories = ['All', 'Gaming', 'Workstation', 'Mining', 'AI'] as const

const ProductGrid = ({ products, viewMode }: ProductGridProps) => {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'All'
  )

  // Update URL when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    if (category === 'All') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', category)
    }
    setSearchParams(searchParams)
  }

  // Listen for URL changes
  useEffect(() => {
    const category = searchParams.get('category')
    if (category && categories.includes(category as typeof categories[number])) {
      setSelectedCategory(category)
    } else {
      setSelectedCategory('All')
    }
  }, [searchParams])

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">
          {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} GPUs`}
        </h1>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-600">
            {filteredProducts.length} products
          </span>
        </div>
      </div>

      {/* Product Grid */}
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1'} gap-6`}>
        {filteredProducts.map((product) => (
          <div 
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
          >
            <div className="relative">
              <img 
                src="https://placehold.co/400x300?text=GPU" 
                alt={product.name}
                className="w-full h-48 object-contain bg-gray-50 p-4"
              />
              {product.badge && (
                <span className="absolute top-4 right-4 px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                  {product.badge}
                </span>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {product.name}
              </h2>
              <div className="flex items-center mb-2">
                {Array(5).fill(0).map((_, i) => (
                  <span 
                    key={i} 
                    className={`${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
                <span className="text-gray-600 text-sm ml-2">
                  ({product.reviews})
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.sale?.active && (
                    <span className="text-sm text-red-500 line-through">
                      ${product.sale.oldPrice.toFixed(2)}
                    </span>
                  )}
                </div>
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
                  className={`px-4 py-2 rounded text-white transition-colors ${
                    !user 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : product.stock < 1 
                        ? 'bg-red-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
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
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No products found in {selectedCategory} category
          </p>
        </div>
      )}
    </div>
  )
}

export default ProductGrid 