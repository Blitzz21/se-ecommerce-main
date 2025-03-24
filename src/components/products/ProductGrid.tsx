import { useState, useEffect } from 'react'
import { Product } from '../../data/products'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { HiShoppingCart, HiFilter, HiSortAscending, HiSortDescending } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCurrency } from '../../contexts/CurrencyContext'

interface ProductGridProps {
  products: Product[]
}

const categories = ['All', 'Gaming', 'Workstation', 'Mining', 'AI'] as const

type SortOption = 'featured' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc'

const ProductGrid = ({ products }: ProductGridProps) => {
  const { addToCart } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'All'
  )
  const [sortOption, setSortOption] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'featured'
  )
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [showFilters, setShowFilters] = useState(false)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [onSaleOnly, setOnSaleOnly] = useState(false)
  const { format } = useCurrency()

  // Update URL when filters change
  const updateSearchParams = (params: Record<string, string | null>) => {
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        searchParams.delete(key)
      } else {
        searchParams.set(key, value)
      }
    })
    setSearchParams(searchParams)
  }

  // Update URL when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    updateSearchParams({
      'category': category === 'All' ? null : category
    })
  }

  // Update URL when sort option changes
  const handleSortChange = (sort: SortOption) => {
    setSortOption(sort)
    updateSearchParams({
      'sort': sort === 'featured' ? null : sort
    })
  }

  // Listen for URL changes
  useEffect(() => {
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') as SortOption
    
    if (category && categories.includes(category as typeof categories[number])) {
      setSelectedCategory(category)
    } else {
      setSelectedCategory('All')
    }
    
    if (sort) {
      setSortOption(sort)
    } else {
      setSortOption('featured')
    }
  }, [searchParams])

  // Filter products by category
  let filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory)

  // Apply additional filters
  if (inStockOnly) {
    filteredProducts = filteredProducts.filter(product => product.stock > 0)
  }

  if (onSaleOnly) {
    filteredProducts = filteredProducts.filter(product => product.sale?.active)
  }

  // Filter by price range
  filteredProducts = filteredProducts.filter(
    product => product.price >= priceRange[0] && product.price <= priceRange[1]
  )

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      default:
        // 'featured' keeps the original order
        return 0
    }
  })

  // Calculate price range values for the filter
  const minPrice = Math.min(...products.map(p => p.price), 0)
  const maxPrice = Math.max(...products.map(p => p.price), 5000)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">
          {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} GPUs`}
        </h1>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
          >
            <HiFilter className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Filter and Sort Panel */}
      {showFilters && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${selectedCategory === category
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Price Range</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{format(priceRange[0])}</span>
                  <span>{format(priceRange[1])}</span>
                </div>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full accent-green-600"
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-green-600"
                />
              </div>
            </div>

            {/* Additional Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Filters</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={() => setInStockOnly(!inStockOnly)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">In Stock Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={() => setOnSaleOnly(!onSaleOnly)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">On Sale Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {sortedProducts.length} products
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map((product) => (
          <div key={product.id} className="relative">
            <Link 
              to={`/products/${product.id}`}
              className="block h-full"
            >
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-md h-full flex flex-col transition-all duration-300 hover:shadow-xl group"
              >
                <div className="relative">
                  {product.badge && (
                    <span className="absolute top-2 left-2 z-10 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {product.badge}
                    </span>
                  )}
                  {product.sale?.active && (
                    <span className="absolute top-2 right-2 z-10 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {product.sale.percentage}% OFF
                    </span>
                  )}
                  <img
                    src={product.image || "https://placehold.co/300x200?text=GPU"}
                    alt={product.name}
                    className="w-full h-48 object-contain p-4"
                  />
                </div>
                
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
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
            {/* Add to Cart Button with Cart Icon */}
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
                <HiShoppingCart className="w-6 h-6" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            No products found with the current filters
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSortOption('featured');
              setPriceRange([minPrice, maxPrice]);
              setInStockOnly(false);
              setOnSaleOnly(false);
              searchParams.delete('category');
              searchParams.delete('sort');
              setSearchParams(searchParams);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductGrid