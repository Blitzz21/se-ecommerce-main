import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

interface OrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  items: OrderItem[];
  billing_address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  customer_name: string;
  customer_email: string;
  payment_id: string;
  created_at: string;
}

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        let finalOrders = [];
        
        // Try to fetch from Supabase
        const { data: supabaseOrders, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders from Supabase:', error);
        } else if (supabaseOrders && supabaseOrders.length > 0) {
          console.log('Orders found in Supabase:', supabaseOrders.length);
          finalOrders = [...supabaseOrders];
        }
        
        // Also check localStorage for any orders
        const demoOrdersString = window.localStorage.getItem('demoOrders');
        if (demoOrdersString) {
          const parsedDemoOrders = JSON.parse(demoOrdersString);
          const localOrders = parsedDemoOrders.filter(
            (order) => order.user_id === user.id || order.user_id === 'demo-user-id'
          );
          
          if (localOrders.length > 0) {
            console.log('Orders found in localStorage:', localOrders.length);
            
            // Check if an order with the same ID exists in finalOrders
            const uniqueLocalOrders = localOrders.filter(
              (localOrder) => !finalOrders.some((order) => order.id === localOrder.id)
            );
            
            // Merge orders - use spread to avoid mutating the arrays
            finalOrders = [...finalOrders, ...uniqueLocalOrders];
          }
        }
        
        // Set user_id for any demo orders
        finalOrders = finalOrders.map(order => {
          if (order.user_id === 'demo-user-id') {
            return { ...order, user_id: user.id };
          }
          return order;
        });
        
        // Sort by date (newest first)
        finalOrders.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setOrders(finalOrders);
      } catch (err) {
        console.error('Error in orders fetch process:', err);
        toast.error('Failed to load order history');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const viewOrderDetails = (order: Order) => {
    setActiveOrder(order);
    setShowOrderDetails(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Your Orders | ShopSmart</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Continue Shopping
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        {orders.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-4">No Orders Found</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">Order History</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && activeOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Order Number</h4>
                  <p className="mt-1 text-sm text-gray-900">{activeOrder.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Order Date</h4>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(activeOrder.created_at)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      activeOrder.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : activeOrder.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {activeOrder.status.charAt(0).toUpperCase() + activeOrder.status.slice(1)}
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total</h4>
                  <p className="mt-1 text-sm text-gray-900">${activeOrder.total.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Items</h4>
                <ul className="divide-y divide-gray-200">
                  {activeOrder.items.map((item, index) => (
                    <li key={index} className="py-3 flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h4>
                <p className="text-sm text-gray-900">{activeOrder.customer_name}</p>
                <p className="text-sm text-gray-900">{activeOrder.billing_address.line1}</p>
                <p className="text-sm text-gray-900">
                  {activeOrder.billing_address.city}, {activeOrder.billing_address.state} {activeOrder.billing_address.postal_code}
                </p>
                <p className="text-sm text-gray-900">{activeOrder.billing_address.country}</p>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h4>
                <p className="text-sm text-gray-900">Payment ID: {activeOrder.payment_id}</p>
                <p className="text-sm text-gray-900">Email: {activeOrder.customer_email}</p>
              </div>
            </div>
            
            <div className="px-6 py-3 bg-gray-50 text-right">
              <button
                onClick={() => setShowOrderDetails(false)}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 