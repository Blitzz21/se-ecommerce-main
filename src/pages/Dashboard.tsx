import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { OrderList } from '../components/home/dashboard/OrderList';
import { UserInfo } from '../components/home/dashboard/UserInfo';

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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Fetch from Supabase
        const { data: supabaseOrders, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders from Supabase:', error);
          setOrders([]);
        } else if (supabaseOrders && supabaseOrders.length > 0) {
          console.log('Orders found in Supabase:', supabaseOrders.length);
          setOrders(supabaseOrders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Error in orders fetch process:', err);
        toast.error('Failed to load order history');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Set up realtime subscription
    const ordersSubscription = supabase
      .channel('dashboard-orders-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Dashboard realtime update received:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            setOrders(prevOrders => [payload.new as Order, ...prevOrders]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prevOrders => 
              prevOrders.map(order => 
                order.id === payload.new.id ? (payload.new as Order) : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders(prevOrders => 
              prevOrders.filter(order => order.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Calculate totals from available orders (may be empty)
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Dashboard | ShopSmart</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <div className="text-right">
          <p className="text-lg text-gray-600">Welcome back!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* User Info Card */}
        <div className="md:col-span-2">
          <UserInfo />
        </div>
        
        {/* Order Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{orders.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="mt-1 text-2xl font-semibold text-green-600">
                ${totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="pt-4">
              <button 
                onClick={() => navigate('/products')}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <OrderList orders={orders} limit={5} showViewAll={true} />
    </div>
  );
};

export default Dashboard; 