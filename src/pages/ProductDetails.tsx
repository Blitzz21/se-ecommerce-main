import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.ts'
import { Database } from '../types/supabase'
import { useCart } from '../contexts/CartContext'

type Product = Database['public']['Tables']['products']['Row']

const ProductDetails = () => {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Product not found');
        
        console.log('Fetched product:', data); // Debug log
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      console.log('Adding to cart:', {
        id: product.id,
        name: product.name,
        price: product.price
      });
      
      await addToCart(product);
    } catch (err) {
      console.error('Error in handleAddToCart:', err);
    }
  };

  if (loading) return <div>Loading...</div>
  if (error || !product) return <div>Error: {error || 'Product not found'}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-2xl font-bold text-primary-600 mb-6">
            ${product.price.toFixed(2)}
          </p>
          <button 
            onClick={handleAddToCart}
            className="btn btn-primary"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails 