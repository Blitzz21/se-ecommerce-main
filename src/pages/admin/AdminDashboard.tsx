import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { HiPlus, HiViewGrid, HiChartBar, HiShoppingCart, HiStar, HiCurrencyDollar, HiDatabase, HiX, HiUserGroup } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { initDb, setAdmin, revokeAdminRole, initializeStorage } from '../../lib/dbInit';
import { useCurrency } from '../../contexts/CurrencyContext';

// Types for cart items and admin users
interface CartItem {
  product_id: string;
  product_name: string;
  quantity?: number;
  id?: string;  // For compatibility with the topProducts structure
  name?: string; // For compatibility with the topProducts structure
  count?: number; // For compatibility with the topProducts structure
}

// Order status types
type OrderStatus = 'paid' | 'processing' | 'processed' | 'shipping' | 'delivering' | 'delivered' | 'cancelled';

interface AdminUser {
  userId: string;
  email?: string;
}

// Interface for order data
interface OrderData {
  id: string;
  total: string | number;
  created_at: string;
  status?: OrderStatus;
  items?: Array<{
    product_id: string;
    product_name?: string;
    quantity?: number;
    price?: number;
  }>;
}

// Update the Analytics interface
interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{id: string, name: string, count: number}>;
}

export const AdminDashboard = () => {
  const { isAdmin, getAllAdmins } = useAuth();
  const { format } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    topProducts: []
  });
  const [topProducts, setTopProducts] = useState<CartItem[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [showUtilities, setShowUtilities] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [revokeEmail, setRevokeEmail] = useState('');
  const [initializingDb, setInitializingDb] = useState(false);
  const [revokingAdmin, setRevokingAdmin] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Load all admin users
  const loadAdminUsers = async () => {
    try {
      setLoadingAdmins(true);
      const admins = await getAllAdmins();
      setAdminUsers(admins);
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast.error('Failed to load admin users');
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Memoize fetchAnalytics to prevent recreation on every render
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      let allOrders: OrderData[] = [];
      
      // Get orders from Supabase
      const { data: supabaseOrders, error } = await supabase
        .from('orders')
        .select('*');
      
      if (error) {
        console.error('Error fetching orders from Supabase:', error);
      } else if (supabaseOrders && supabaseOrders.length > 0) {
        console.log('Orders found in Supabase for analytics:', supabaseOrders.length);
        allOrders = [...supabaseOrders];
      }
      
      // Calculate analytics
      const totalOrders = allOrders.length;
      const totalRevenue = allOrders.reduce((sum, order) => sum + (parseFloat(order.total as string) || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Fetch real-time cart items data to show most added to cart
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('product_id, product_name, quantity')
        .order('created_at', { ascending: false });

      if (cartError) {
        console.error('Error fetching cart items:', cartError);
      } else if (cartItems && cartItems.length > 0) {
        console.log('Cart items found:', cartItems.length);
        
        // Aggregate quantities for the same product across all carts
        const productQuantities: { [key: string]: { product_id: string, product_name: string, quantity: number } } = {};
        
        cartItems.forEach(item => {
          if (!productQuantities[item.product_id]) {
            productQuantities[item.product_id] = {
              product_id: item.product_id,
              product_name: item.product_name,
              quantity: 0
            };
          }
          productQuantities[item.product_id].quantity += item.quantity || 1;
        });
        
        // Convert to array and sort by quantity
        const realtimeTopProducts = Object.values(productQuantities)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);
        
        console.log('Most added to cart products:', realtimeTopProducts);
        setTopProducts(realtimeTopProducts);
      } else {
        console.log('No cart items found, setting empty array');
        setTopProducts([]);
      }
      
      // Set all analytics data
      setAnalytics({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        topProducts: topProducts.map(p => ({
          id: p.product_id,
          name: p.product_name,
          count: p.quantity || 0
        }))
      });
      
      // Fetch highest rated products
      const { data: highestRatedProducts, error: ratingError } = await supabase
        .from('products')
        .select('id, name, image, rating')
        .order('rating', { ascending: false })
        .limit(5);
        
      if (ratingError) {
        console.error('Error fetching highest rated products:', ratingError);
      } else {
        setTopRated(highestRatedProducts || []);
      }
      
      // Calculate best selling products based on order data
      const productSales: { [key: string]: { 
        id: string, 
        name: string, 
        sales: number, 
        revenue: number 
      }} = {};
      
      allOrders.forEach(order => {
        if (order.status !== 'cancelled' && order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (item.product_id) {
              if (!productSales[item.product_id]) {
                productSales[item.product_id] = {
                  id: item.product_id,
                  name: item.product_name || 'Unknown Product',
                  sales: 0,
                  revenue: 0
                };
              }
              
              const quantity = item.quantity || 1;
              const price = item.price || 0;
              
              productSales[item.product_id].sales += quantity;
              productSales[item.product_id].revenue += quantity * price;
            }
          });
        }
      });
      
      const bestSellingProducts = Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
      
      setBestSellers(bestSellingProducts);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Combined useEffect for initial data loading and realtime subscriptions
  useEffect(() => {
    if (!isAdmin) return;

    let mounted = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Initialize storage for product images if needed
        try {
          await initializeStorage();
          console.log('Storage initialization completed');
        } catch (storageError) {
          console.error('Failed to initialize storage:', storageError);
        }
        
        // Fetch analytics data and load admin users
        if (mounted) {
          await Promise.all([
            fetchAnalytics(),
            loadAdminUsers()
          ]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    // Set up realtime subscriptions
    const ordersSubscription = supabase
      .channel('admin-analytics-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders'
        }, 
        (payload: any) => {
          console.log('Admin analytics realtime update received:', payload);
          if (mounted) {
            fetchAnalytics();
          }
        }
      )
      .subscribe();
    
    const cartSubscription = supabase
      .channel('admin-cart-channel')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items'
        },
        (payload: any) => {
          console.log('Cart items realtime update received:', payload);
          if (mounted) {
            fetchAnalytics();
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      mounted = false;
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(cartSubscription);
    };
  }, [isAdmin, fetchAnalytics]); // Only re-run if isAdmin or fetchAnalytics changes

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Link to="/" className="text-green-600 hover:text-green-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Initialize the database
  const handleInitializeDatabase = async () => {
    try {
      setInitializingDb(true);
      const result = await initDb();
      if (result.success) {
        toast.success('Database initialized successfully');
      } else {
        toast.error('Failed to initialize database');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      toast.error('An error occurred while initializing the database');
    } finally {
      setInitializingDb(false);
    }
  };

  // Function to add a new admin by email
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    try {
      const result = await setAdmin(newAdminEmail);
      
      if (result.success) {
        toast.success(`Admin role granted to ${newAdminEmail}`);
        setNewAdminEmail('');
        // Reload admin list
        loadAdminUsers();
      } else {
        toast.error(result.error || 'Failed to add admin user');
      }
    } catch (error) {
      console.error('Error adding admin user:', error);
      toast.error('Failed to add admin user');
    }
  };

  // Fix the handleRevokeAdmin function to take an event and optional email parameter
  const handleRevokeAdmin = async (e: React.FormEvent | string, emailParam?: string) => {
    // If called as an event handler
    if (typeof e === 'object') {
      e.preventDefault();
      
      if (!revokeEmail) {
        toast.error('Please enter an email address');
        return;
      }
      
      await performRevokeAdmin(revokeEmail);
    } 
    // If called directly with email string
    else if (typeof e === 'string' && e) {
      await performRevokeAdmin(e);
    }
    // If called with event + emailParam
    else if (emailParam) {
      await performRevokeAdmin(emailParam);
    }
  };

  // Helper function to perform the actual revoke operation
  const performRevokeAdmin = async (email: string) => {
    if (!email) return;
    
    try {
      setRevokingAdmin(true);
      const result = await revokeAdminRole(email);
      
      if (result.success) {
        toast.success(`Admin role revoked from ${email}`);
        // Reload admin list
        loadAdminUsers();
      } else {
        toast.error(result.error || 'Failed to revoke admin role');
      }
    } catch (error) {
      console.error('Error revoking admin role:', error);
      toast.error('Failed to revoke admin role');
    } finally {
      setRevokingAdmin(false);
      setRevokeEmail('');
    }
  };

  // Add a new section to render the admin users list
  const renderAdminUsersSection = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <HiUserGroup className="h-6 w-6 text-green-500 mr-2" />
        <h2 className="text-xl font-medium">Admin Users</h2>
      </div>
      
      <div className="mb-6">
        <form onSubmit={handleAddAdmin} className="flex space-x-2">
          <input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="Email address"
            className="border border-gray-300 rounded-md px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Add Admin
          </button>
        </form>
      </div>
      
      {loadingAdmins ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    No admin users found
                  </td>
                </tr>
              ) : (
                adminUsers.map((admin) => (
                  <tr key={admin.userId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.userId.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {admin.email || 'Unknown Email'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {admin.email && (
                        <button
                          onClick={(e) => handleRevokeAdmin(e, admin.email!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Revoke Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Admin Dashboard | ShopSmart</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link 
          to="/admin/products/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <HiPlus className="-ml-1 mr-2 h-5 w-5" />
          New Product
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <HiViewGrid className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-xl font-semibold">{analytics.topProducts.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <HiShoppingCart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-xl font-semibold">{analytics.totalOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                  <HiCurrencyDollar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-xl font-semibold">{format(analytics.totalRevenue)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                  <HiChartBar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                  <p className="text-xl font-semibold">{format(analytics.averageOrderValue)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Admin Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/admin/products"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <HiViewGrid className="mr-2 h-5 w-5 text-gray-500" />
                Manage Products
              </Link>
              <Link 
                to="/admin/orders"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <HiShoppingCart className="mr-2 h-5 w-5 text-gray-500" />
                Manage Orders
              </Link>
              <Link 
                to="/admin/analytics"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <HiChartBar className="mr-2 h-5 w-5 text-gray-500" />
                View Detailed Analytics
              </Link>
            </div>
          </div>
          
          {/* Product Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Most Added to Cart */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-md font-medium text-gray-900">Most Added to Cart</h3>
              </div>
              <div className="p-4">
                <ul className="divide-y divide-gray-200">
                  {topProducts.length > 0 ? (
                    topProducts.map((product) => (
                      <li key={product.product_id} className="py-3 flex justify-between">
                        <p className="text-sm truncate">{product.product_name}</p>
                        <p className="text-sm text-gray-500">{product.quantity} items</p>
                      </li>
                    ))
                  ) : (
                    <li className="py-3 text-center text-sm text-gray-500">No data available</li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Highest Rated Products */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-md font-medium text-gray-900">Highest Rated Products</h3>
              </div>
              <div className="p-4">
                <ul className="divide-y divide-gray-200">
                  {topRated.length > 0 ? (
                    topRated.map((product) => (
                      <li key={product.id} className="py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <img 
                            src={product.image || "/placeholder.png"} 
                            alt={product.name} 
                            className="h-8 w-8 object-cover rounded-full mr-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.png";
                            }}
                          />
                          <p className="text-sm truncate">{product.name}</p>
                        </div>
                        <div className="flex items-center">
                          <HiStar className="h-4 w-4 text-yellow-500 mr-1" />
                          <p className="text-sm text-gray-500">{(product.rating || 0).toFixed(1)}</p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-3 text-center text-sm text-gray-500">No data available</li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Best Selling Products */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-md font-medium text-gray-900">Best Selling Products</h3>
              </div>
              <div className="p-4">
                <ul className="divide-y divide-gray-200">
                  {bestSellers.length > 0 ? (
                    bestSellers.map((product) => (
                      <li key={product.id} className="py-3 flex justify-between">
                        <p className="text-sm truncate">{product.name}</p>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">{product.sales || 0} units</p>
                          <p className="text-xs text-gray-500">{format(product.revenue || 0)}</p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-3 text-center text-sm text-gray-500">No data available</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Admin Utilities Section */}
          <div className="mb-8">
            <button
              onClick={() => setShowUtilities(!showUtilities)}
              className="mb-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              <HiDatabase className="-ml-1 mr-2 h-5 w-5" />
              {showUtilities ? 'Hide Admin Utilities' : 'Show Admin Utilities'}
            </button>
            
            {showUtilities && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Database Initialization</h2>
                  <button
                    onClick={handleInitializeDatabase}
                    disabled={initializingDb}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {initializingDb ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Initializing...
                      </div>
                    ) : (
                      <>Initialize Database</>
                    )}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Add Admin User</h2>
                    <form onSubmit={handleAddAdmin} className="flex flex-col space-y-4">
                      <div>
                        <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                          User Email
                        </label>
                        <input
                          type="email"
                          id="adminEmail"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="user@example.com"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={revokingAdmin}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {revokingAdmin ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Revoking...
                          </div>
                        ) : (
                          <>Assign Admin Role</>
                        )}
                      </button>
                    </form>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Revoke Admin Rights</h2>
                    <form onSubmit={handleRevokeAdmin} className="flex flex-col space-y-4">
                      <div>
                        <label htmlFor="revokeEmail" className="block text-sm font-medium text-gray-700">
                          Admin Email
                        </label>
                        <input
                          type="email"
                          id="revokeEmail"
                          value={revokeEmail}
                          onChange={(e) => setRevokeEmail(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="admin@example.com"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={revokingAdmin}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      >
                        {revokingAdmin ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Revoking...
                          </div>
                        ) : (
                          <>Revoke Admin Rights</>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Current Admin Users</h2>
                  {adminUsers.length === 0 ? (
                    <p className="text-gray-500">No admin users found</p>
                  ) : (
                    <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                      {adminUsers.map(admin => (
                        <li key={admin.userId} className="px-4 py-3 flex justify-between items-center">
                          <span className="text-sm text-gray-700">{admin.email || 'Unknown Email'}</span>
                          <button
                            onClick={(e) => handleRevokeAdmin(e, admin.email || '')}
                            className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200"
                          >
                            <HiX className="mr-1 h-3 w-3" />
                            Revoke
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Insert admin users section here */}
          {renderAdminUsersSection()}
        </>
      )}
    </div>
  );
}; 