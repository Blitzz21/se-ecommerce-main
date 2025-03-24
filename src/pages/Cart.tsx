import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiOutlineTrash, HiPlus, HiMinus } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import OrderSummary from '../components/checkout/OrderSummary';
import { useCurrency } from '../contexts/CurrencyContext';
import EmptyState from '../components/EmptyState';

type DatabaseProduct = Database['public']['Tables']['products']['Row'];

const Cart = () => {
  const { user } = useAuth();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    toggleItemSelection, 
    selectAllItems,
  } = useCart();
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [isSelectingAll, setIsSelectingAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { format } = useCurrency();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        if (cartItems.length > 0) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .in(
              'id', 
              cartItems.map(item => item.product_id)
            );
          
          if (!error && data) {
            setProducts(data);
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    // Set initial state for select all checkbox based on whether all items are selected
    const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected !== false);
    setIsSelectingAll(allSelected);
  }, [user, navigate, cartItems]);

  const handleToggleSelectAll = () => {
    const newSelectAllState = !isSelectingAll;
    setIsSelectingAll(newSelectAllState);
    selectAllItems(newSelectAllState);
  };

  const handleToggleItemSelection = (itemId: string, selected: boolean) => {
    toggleItemSelection(itemId, selected);
  };

  // Move this after the useEffect
  if (!user) return null;
  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  const handleQuantityChange = async (itemId: string, productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    // Find the product to check stock
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if requested quantity is available
    if (newQuantity > product.stock) {
      alert(`Only ${product.stock} items available in stock`);
      return;
    }

    await updateQuantity(itemId, newQuantity);
  };

  if (cartItems.length === 0) {
    return <EmptyState message="Your cart is empty" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Your Cart | ShopSmart</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        <Link 
          to="/"
          className="flex items-center text-green-600 hover:text-green-800"
        >
          <HiArrowLeft className="mr-1" /> Continue Shopping
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Cart Items ({cartItems.length})</h2>
                <div className="flex items-center">
                  <input
                    id="select-all"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    checked={isSelectingAll}
                    onChange={handleToggleSelectAll}
                  />
                  <label htmlFor="select-all" className="ml-2 text-sm text-gray-600">
                    Select All
                  </label>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row">
                  <div className="flex-shrink-0 mr-4 mb-4 sm:mb-0">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      checked={item.selected !== false}
                      onChange={(e) => handleToggleItemSelection(item.id, e.target.checked)}
                    />
                  </div>
                  
                  <div className="flex-shrink-0 mr-4 mb-4 sm:mb-0">
                    <img
                      src={item.image || "https://placehold.co/300x200?text=GPU"}
                      alt={item.product_name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <h3 className="text-base font-medium text-gray-900 mb-2 sm:mb-0">
                        {item.product_name}
                      </h3>
                      <p className="text-lg font-medium text-gray-900">
                        {format(item.price * item.quantity)}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => {
                            const product = products.find(p => p.id === item.product_id);
                            if (product) {
                              handleQuantityChange(item.id, product.id, Math.max(1, item.quantity - 1));
                            } else {
                              updateQuantity(item.id, Math.max(1, item.quantity - 1));
                            }
                          }}
                          className="px-3 py-1 text-gray-600 hover:text-gray-900"
                        >
                          <HiMinus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-1 text-gray-900 border-x">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            const product = products.find(p => p.id === item.product_id);
                            if (product) {
                              handleQuantityChange(item.id, product.id, item.quantity + 1);
                            } else {
                              updateQuantity(item.id, item.quantity + 1);
                            }
                          }}
                          className="px-3 py-1 text-gray-600 hover:text-gray-900"
                        >
                          <HiPlus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-4 sm:mt-0 flex items-center text-red-600 hover:text-red-800 text-sm"
                      >
                        <HiOutlineTrash className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <OrderSummary />
        </div>
      </div>
    </div>
  );
};

export default Cart; 