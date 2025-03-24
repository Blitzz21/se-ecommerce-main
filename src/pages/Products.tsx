import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Squares2X2Icon as ViewGridIcon, ListBulletIcon as ViewListIcon, FunnelIcon as FilterIcon } from '@heroicons/react/24/outline'
import { Product } from '../data/products'
import ProductCard from '../components/products/ProductCard'
import { useCart } from '../contexts/CartContext'
import { Helmet } from 'react-helmet-async'
import { useCurrency } from '../contexts/CurrencyContext'

type ViewMode = 'grid' | 'list'

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories] = useState<string[]>(['Gaming', 'Workstation', 'Mining', 'AI']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { format } = useCurrency();
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sortOption, setSortOption] = useState<'featured' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc'>('featured');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('products')
          .select('*')
          
        // Apply category filter if selected
        if (selectedCategory) {
          query = query.eq('category', selectedCategory);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        
        // Convert database products to match the Product type
        const formattedProducts = data?.map(product => ({
          ...product,
          badge: product.badge || undefined,
          sale: product.sale || undefined,
          brand: product.brand as any,
          category: product.category as any
        })) || [];
        
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
        
        // Set initial price range based on products
        const prices = formattedProducts.map(p => p.price);
        const minPrice = Math.min(...prices, 0);
        const maxPrice = Math.max(...prices, 5000);
        setPriceRange([minPrice, maxPrice]);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = [...products];
    
    // Apply price range filter
    filtered = filtered.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Apply stock filter
    if (inStockOnly) {
      filtered = filtered.filter(product => product.stock > 0);
    }
    
    // Apply sale filter
    if (onSaleOnly) {
      filtered = filtered.filter(product => product.sale?.active);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
    
    setFilteredProducts(filtered);
  }, [products, priceRange, inStockOnly, onSaleOnly, sortOption]);

  // Update selectedCategory when URL param changes
  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>{selectedCategory || 'All'} Products | Spartan Parts</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {selectedCategory ? `${selectedCategory} GPUs` : 'All Products'}
        </h1>
        <div className="flex items-center space-x-4">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-500 hover:text-green-600"
            title="Toggle Filters"
          >
            <FilterIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-500 hover:text-green-600"
            title="Toggle View Mode"
          >
            {viewMode === 'grid' ? (
              <ViewListIcon className="h-6 w-6" />
            ) : (
              <ViewGridIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  min={Math.min(...products.map(p => p.price), 0)}
                  max={Math.max(...products.map(p => p.price), 5000)}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full accent-green-600"
                />
                <input
                  type="range"
                  min={Math.min(...products.map(p => p.price), 0)}
                  max={Math.max(...products.map(p => p.price), 5000)}
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

            {/* Sort Options */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Sort By</h3>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            No products found with the current filters
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setPriceRange([Math.min(...products.map(p => p.price), 0), Math.max(...products.map(p => p.price), 5000)]);
              setInStockOnly(false);
              setOnSaleOnly(false);
              setSortOption('featured');
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={`grid ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        } gap-6`}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              imageUrl={product.image || ''}
              image={product.image}
              badge={product.badge}
              sale={product.sale}
              stock={product.stock}
              category={product.category}
              viewMode={viewMode}
              addToCart={() => addToCart(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products; 