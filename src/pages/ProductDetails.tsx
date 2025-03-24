import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { HiChevronLeft, HiShoppingCart } from 'react-icons/hi'
import { Helmet } from 'react-helmet-async'
import { toast } from 'react-hot-toast'
import { useCart } from '../contexts/CartContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { supabase } from '../lib/supabase'
import { GpuImage } from '../utils/ImageHelper'

export interface DatabaseProduct {
  id: string
  name: string
  brand: string
  model: string
  price: number
  description: string
  image: string
  category: string
  badge?: 'NEW' | 'SALE' | 'LIMITED' | 'BEST SELLER'
  sale?: {
    active: boolean
    percentage: number
    oldPrice: number
  }
  specs: {
    memory: string
    memoryType: string
    coreClock: string
    boostClock: string
    tdp: string
  }
  stock: number
  rating: number
  reviews: number
  created_at?: string
  updated_at?: string
  created_by?: string
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { format } = useCurrency()
  
  const [product, setProduct] = useState<DatabaseProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        
        if (!id) {
          throw new Error('Product ID is missing')
        }
        
        // Fetch product from Supabase
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) {
          throw error
        }
        
        if (!data) {
          throw new Error('Product not found')
        }
        
        setProduct(data as DatabaseProduct)
      } catch (err) {
        console.error('Error fetching product:', err)
        toast.error('Failed to load product details')
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [id, navigate])
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value > 0 && product && value <= product.stock) {
      setQuantity(value)
    }
  }
  
  const handleAddToCart = async () => {
    if (product) {
      try {
        // Add to cart with the user-selected quantity but only needed fields
        await addToCart({
          id: product.id,
          name: product.name,
          brand: product.brand as any,
          model: product.model,
          price: product.price,
          category: product.category as any,
          image: product.image,
          description: product.description,
          specs: product.specs,
          stock: product.stock,
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          badge: product.badge as any,
          sale: product.sale as any,
          quantity: quantity
        });
        
        toast.success(`${product.name} added to cart`);
      } catch (error: any) {
        if (error.message === 'AUTH_REQUIRED') {
          // Redirect to login page with return path
          navigate('/login', { 
            state: { from: window.location.pathname }
          });
        }
      }
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <HiChevronLeft className="mr-1" /> Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{product.name} | ShopSmart</title>
        <meta name="description" content={`${product.name} - ${product.description}`} />
      </Helmet>
      
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <HiChevronLeft className="mr-1" /> Back
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white p-4 rounded-lg shadow-md overflow-hidden">
            <GpuImage
              src={product.image || "https://placehold.co/600x400?text=No+Image"}
              alt={product.name}
              className="w-full h-auto object-contain max-h-[400px]"
            />
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            {product.badge && (
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-md mr-2 
                ${product.badge === 'SALE' ? 'bg-red-100 text-red-800' : 
                  product.badge === 'NEW' ? 'bg-green-100 text-green-800' : 
                  product.badge === 'LIMITED' ? 'bg-purple-100 text-purple-800' : 
                  'bg-blue-100 text-blue-800'}`}
              >
                {product.badge}
              </span>
            )}
            <span className="text-gray-500">{product.category}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating) 
                      ? 'text-yellow-400' 
                      : i < product.rating 
                        ? 'text-yellow-300'
                        : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              {product.rating.toFixed(1)} ({product.reviews} reviews)
            </span>
          </div>
          
          <div className="mb-6">
            {product.sale?.active ? (
              <div className="flex items-center">
                <span className="text-3xl font-bold text-gray-900">
                  {format(product.price)}
                </span>
                <span className="ml-2 text-lg text-gray-500 line-through">
                  {format(product.sale.oldPrice)}
                </span>
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                  {product.sale.percentage}% OFF
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                {format(product.price)}
              </span>
            )}
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Brand</p>
                <p className="font-medium">{product.brand}</p>
              </div>
              <div>
                <p className="text-gray-500">Model</p>
                <p className="font-medium">{product.model}</p>
              </div>
              <div>
                <p className="text-gray-500">Memory</p>
                <p className="font-medium">{product.specs.memory}</p>
              </div>
              <div>
                <p className="text-gray-500">Memory Type</p>
                <p className="font-medium">{product.specs.memoryType}</p>
              </div>
              <div>
                <p className="text-gray-500">Core Clock</p>
                <p className="font-medium">{product.specs.coreClock}</p>
              </div>
              <div>
                <p className="text-gray-500">Boost Clock</p>
                <p className="font-medium">{product.specs.boostClock}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className={`w-3 h-3 rounded-full mr-2 ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>
          </div>
          
          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row items-center">
              <div className="w-full sm:w-32 mb-4 sm:mb-0 sm:mr-4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleAddToCart}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <HiShoppingCart className="mr-2" />
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetails 