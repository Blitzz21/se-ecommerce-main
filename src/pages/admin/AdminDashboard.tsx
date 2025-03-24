import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { HiPlus, HiViewGrid, HiChartBar, HiShoppingCart, HiStar, HiCurrencyDollar, HiDatabase, HiX } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { initDb, setAdmin, revokeAdmin } from '../../lib/dbInit';

// Types for cart items and admin users
interface CartItem {
  product_id: string;
  product_name: string;
  quantity?: number;
}

interface AdminUser {
  id: string;
  email: string;
}

interface OrderItem {
  product_id: string;
  product_name?: string;
  quantity?: number;
  price?: number;
  revenue?: number;
}

// Interface for order data
interface OrderData {
  id: string;
  total: string | number;
  items?: Array<{
    product_id: string;
    product_name?: string;
    quantity?: number;
    price?: number;
  }>;
}

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });
  const [topProducts, setTopProducts] = useState<CartItem[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [showUtilities, setShowUtilities] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [revokeEmail, setRevokeEmail] = useState('');
  const [initializingDb, setInitializingDb] = useState(false);
  const [assigningAdmin, setAssigningAdmin] = useState(false);
  const [revokingAdmin, setRevokingAdmin] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  // Load admin users function (defined outside of useEffect for reuse)
  const loadAdminUsers = useCallback(async () => {
    try {
      // Fetch users with admin role
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          profiles:user_id (
            email
          )
        `)
        .eq('role', 'admin');
      
      if (error) throw error;
      
      // Format the data for display
      const formattedAdmins = (data || []).map((item: any) => ({
        id: item.user_id,
        email: item.profiles?.email || 'Unknown email'
      }));
      
      setAdminUsers(formattedAdmins);
    } catch (error) {
      console.error('Error loading admin users:', error);
    }
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch product count
        const { count: productCount, error: productError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (productError) throw productError;
        
        // Fetch orders from both Supabase and localStorage
        let allOrders: OrderData[] = [];
        
        // Get orders from Supabase
        const { data: supabaseOrders, error: ordersError } = await supabase
          .from('orders')
          .select('*');
        
        if (ordersError) {
          console.error('Error fetching orders from Supabase:', ordersError);
        } else if (supabaseOrders) {
          allOrders = [...supabaseOrders];
        }
        
        // Get orders from localStorage
        const demoOrdersString = window.localStorage.getItem('demoOrders');
        if (demoOrdersString) {
          const localOrders = JSON.parse(demoOrdersString) as OrderData[];
          // Add unique orders (avoid duplicates)
          const uniqueLocalOrders = localOrders.filter(
            (localOrder) => !allOrders.some((order) => order.id === localOrder.id)
          );
          allOrders = [...allOrders, ...uniqueLocalOrders];
        }
        
        // Calculate analytics
        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum: number, order) => sum + (parseFloat(order.total as string) || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        setAnalytics({
          totalProducts: productCount || 0,
          totalOrders,
          totalRevenue,
          avgOrderValue
        });
        
        // Fetch cart items from all users
        const { data: cartItems, error: cartError } = await supabase
          .from('cart_items')
          .select('product_id, product_name, quantity')
          .not('user_id', 'is', null); // Ensure we only count items with valid user_id
        
        if (cartError) {
          console.error('Error fetching cart items:', cartError);
        } else {
          // Aggregate cart items by product_id
          const productCounts: Record<string, CartItem> = {};
          
          (cartItems || []).forEach((item: { product_id: string; product_name: string; quantity: number }) => {
            const { product_id, product_name, quantity = 1 } = item;
            if (!productCounts[product_id]) {
              productCounts[product_id] = { product_id, product_name, quantity: 0 };
            }
            productCounts[product_id].quantity = (productCounts[product_id].quantity || 0) + quantity;
          });
          
          // Convert to array and sort by quantity
          const topProducts = Object.values(productCounts)
            .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
            .slice(0, 5);
          
          setTopProducts(topProducts);
        }
        
        // Fetch top rated products
        const { data: ratedProducts, error: ratedError } = await supabase
          .from('products')
          .select('id, name, rating, image')
          .order('rating', { ascending: false })
          .limit(5);
        
        if (ratedError) throw ratedError;
        setTopRated(ratedProducts || []);
        
        // Calculate best sellers from orders
        if (allOrders.length > 0) {
          // Extract and combine all items from all orders
          const allOrderItems: OrderItem[] = [];
          allOrders.forEach((order: OrderData) => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((item: OrderItem) => {
                allOrderItems.push({
                  ...item,
                  revenue: (parseFloat(item.price?.toString() || '0') || 0) * (item.quantity || 1)
                });
              });
            }
          });
          
          // Aggregate by product_id
          const productSales: Record<string, any> = {};
          allOrderItems.forEach(item => {
            const { product_id, product_name, quantity = 1, revenue = 0 } = item;
            if (!productSales[product_id]) {
              productSales[product_id] = { 
                id: product_id, 
                name: product_name || 'Unknown Product', 
                sales: 0, 
                revenue: 0 
              };
            }
            productSales[product_id].sales += quantity;
            productSales[product_id].revenue += revenue;
          });
          
          // Convert to array, sort by revenue, and take top 5
          const topSellers = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
          
          if (topSellers.length > 0) {
            setBestSellers(topSellers);
          } else {
            // Fallback to sample data if no real data available
            setBestSellers([
              { id: '1', name: 'NVIDIA GeForce RTX 4090', sales: 142, revenue: 227284.58 },
              { id: '2', name: 'AMD Radeon RX 7900 XTX', sales: 98, revenue: 93099.02 },
              { id: '3', name: 'NVIDIA GeForce RTX 4080 SUPER', sales: 76, revenue: 75999.24 },
              { id: '4', name: 'NVIDIA RTX 6000 Ada Generation', sales: 24, revenue: 163223.76 },
              { id: '5', name: 'AMD Radeon RX 7800 XT', sales: 85, revenue: 42499.15 }
            ]);
          }
        } else {
          // Fallback sample data
          setBestSellers([
            { id: '1', name: 'NVIDIA GeForce RTX 4090', sales: 142, revenue: 227284.58 },
            { id: '2', name: 'AMD Radeon RX 7900 XTX', sales: 98, revenue: 93099.02 },
            { id: '3', name: 'NVIDIA GeForce RTX 4080 SUPER', sales: 76, revenue: 75999.24 },
            { id: '4', name: 'NVIDIA RTX 6000 Ada Generation', sales: 24, revenue: 163223.76 },
            { id: '5', name: 'AMD Radeon RX 7800 XT', sales: 85, revenue: 42499.15 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching admin analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchAnalytics();
      loadAdminUsers();
    }
  }, [isAdmin, loadAdminUsers]);

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

  // Set up admin user
  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setAssigningAdmin(true);
      const result = await setAdmin(adminEmail);
      if (result.success) {
        toast.success(`Admin role ${result.message}`);
        setAdminEmail('');
        // Reload the admin users list
        loadAdminUsers();
      } else {
        toast.error(`Failed to assign admin role: ${result.error}`);
      }
    } catch (error) {
      console.error('Error setting up admin:', error);
      toast.error('An error occurred while assigning admin role');
    } finally {
      setAssigningAdmin(false);
    }
  };

  // Revoke admin from user
  const handleRevokeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!revokeEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setRevokingAdmin(true);
      const result = await revokeAdmin(revokeEmail);
      
      if (result.success) {
        toast.success(`Admin role revoked: ${result.message}`);
        setRevokeEmail('');
        // Reload the admin users list
        loadAdminUsers();
      } else {
        toast.error(`Failed to revoke admin role: ${result.error}`);
      }
    } catch (error) {
      console.error('Error revoking admin:', error);
      toast.error('An error occurred while revoking admin role');
    } finally {
      setRevokingAdmin(false);
    }
  };

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
                  <p className="text-xl font-semibold">{analytics.totalProducts}</p>
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
                  <p className="text-xl font-semibold">${analytics.totalRevenue.toFixed(2)}</p>
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
                  <p className="text-xl font-semibold">${analytics.avgOrderValue.toFixed(2)}</p>
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
                  {topProducts.map((product) => (
                    <li key={product.product_id} className="py-3 flex justify-between">
                      <p className="text-sm truncate">{product.product_name}</p>
                      <p className="text-sm text-gray-500">{product.quantity} items</p>
                    </li>
                  ))}
                  {topProducts.length === 0 && (
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
                  {topRated.map((product) => (
                    <li key={product.id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <img 
                          src={product.image || "/placeholder.png"} 
                          alt={product.name} 
                          className="h-8 w-8 object-cover mr-3"
                        />
                        <p className="text-sm truncate">{product.name}</p>
                      </div>
                      <div className="flex items-center">
                        <HiStar className="h-4 w-4 text-yellow-500 mr-1" />
                        <p className="text-sm text-gray-500">{product.rating.toFixed(1)}</p>
                      </div>
                    </li>
                  ))}
                  {topRated.length === 0 && (
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
                  {bestSellers.map((product) => (
                    <li key={product.id} className="py-3 flex justify-between">
                      <p className="text-sm truncate">{product.name}</p>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{product.sales} units</p>
                        <p className="text-xs text-gray-500">${product.revenue.toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
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
                    <form onSubmit={handleSetupAdmin} className="flex flex-col space-y-4">
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
                        disabled={assigningAdmin}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {assigningAdmin ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Assigning...
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
                        <li key={admin.id} className="px-4 py-3 flex justify-between items-center">
                          <span className="text-sm text-gray-700">{admin.email}</span>
                          <button
                            onClick={() => {
                              setRevokeEmail(admin.email);
                              // Scroll to the revoke form
                              document.getElementById('revokeEmail')?.scrollIntoView({ behavior: 'smooth' });
                            }}
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
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 