import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

type CartItem = Database['public']['Tables']['cart_items']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

const Cart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        setError(error.message);
      } else {
        setCartItems(data || []);
      }
      setLoading(false);
    };

    fetchCartItems();
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');

      if (error) {
        setError(error.message);
      } else {
        setProducts(data || []);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = async (itemId: string, productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    // Find the product to check stock
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if requested quantity is available
    if (newQuantity > product.stock) {
      setError(`Only ${product.stock} items available in stock`);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);

    if (error) {
      setError(error.message);
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      setError(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      setError(error.message);
    } else {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Link 
            to="/products" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {cartItems.map((item) => {
              const product = products.find((p) => p.id === item.product_id);
              if (!product) return null;

              return (
                <div key={item.id} className="flex p-6 hover:bg-gray-50">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src="https://placehold.co/400x300?text=GPU"
                      alt={product.name}
                      className="h-full w-full object-contain object-center"
                    />
                  </div>

                  <div className="ml-6 flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Stock: {product.stock} available
                        </p>
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-1 items-end justify-between">
                      <div className="flex items-center space-x-2">
                        <label htmlFor={`quantity-${item.id}`} className="text-sm text-gray-600">
                          Quantity:
                        </label>
                        <input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          max={product.stock}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, product.id, Number(e.target.value))}
                          className="w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between text-lg font-medium text-gray-900 mb-4">
              <p>Subtotal</p>
              <p>${calculateTotal().toFixed(2)}</p>
            </div>

            <div className="mt-6">
              <Link
                to="/checkout"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 