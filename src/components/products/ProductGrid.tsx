import { useState, useEffect } from 'react'
import { Product } from '../../data/products'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
}

const categories = ['All', 'Gaming', 'Workstation', 'Mining', 'AI'] as const

const ProductGrid = ({ products }: ProductGridProps) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            imageUrl={product.image}
            description={product.description}
            badge={product.badge}
            sale={product.sale}
            addToCart={addToCart}
          />
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