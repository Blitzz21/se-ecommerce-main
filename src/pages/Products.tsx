import { useEffect, useState } from 'react'
import { useSupabaseQuery } from '../hooks/useSupabase'
import ProductGrid from '../components/products/ProductGrid'
import { supabase } from '../lib/supabase.ts'
import { Squares2X2Icon as ViewGridIcon, ListBulletIcon as ViewListIcon } from '@heroicons/react/24/outline'
import { Database } from '../types/supabase'

type ViewMode = 'grid' | 'list'

type Product = Database['public']['Tables']['products']['Row']

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { data: categories } = useSupabaseQuery(async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name')
    return { data: data || [], error } // Ensure data is an array, defaulting to an empty array if null
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
        <div className="flex items-center space-x-4">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
          >
            <option value="">All Categories</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-500 hover:text-primary-600"
          >
            {viewMode === 'grid' ? (
              <ViewListIcon className="h-6 w-6" />
            ) : (
              <ViewGridIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      <ProductGrid products={products} viewMode={viewMode} />
    </div>
  )
}

export default Products 