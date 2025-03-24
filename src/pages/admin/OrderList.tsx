import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { HiSearch, HiRefresh, HiOutlineChevronLeft, HiOutlineChevronRight, HiEye } from 'react-icons/hi';

// Order status types
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Order interface
interface Order {
  id: string;
  user_id: string;
  created_at: string;
  status: OrderStatus;
  total: number;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  payment_method: string;
  items: {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    product_name: string;
  }[];
  email?: string;
  user_name?: string;
}

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 10;

  // Fetch orders with pagination
  const fetchOrders = async (page = 1, search = '', status: OrderStatus | 'all' = 'all') => {
    try {
      setLoading(true);
      
      // Initialize an array to store all orders
      let allOrders: Order[] = [];
      let count = 0;
      
      // Try to fetch from Supabase first
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (
            email, 
            first_name, 
            last_name
          )
        `, { count: 'exact' });
      
      // Add status filter if not 'all'
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      
      // Add search if provided - search in order ID or user email
      if (search) {
        query = query.or(`id.ilike.%${search}%,profiles.email.ilike.%${search}%`);
      }
      
      // Execute the query
      const { data: supabaseOrders, error, count: supabaseCount } = await query
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders from Supabase:', error);
      } else if (supabaseOrders && supabaseOrders.length > 0) {
        console.log('Orders found in Supabase:', supabaseOrders.length);
        
        // Format orders with user email if available
        const formattedSupabaseOrders = supabaseOrders.map(order => {
          const profile = order.profiles;
          return {
            ...order,
            email: profile?.email || 'Unknown',
            user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown',
            profiles: undefined
          };
        });
        
        allOrders = [...formattedSupabaseOrders];
        count = supabaseCount || 0;
      }
      
      // Also check localStorage for any orders
      const demoOrdersString = window.localStorage.getItem('demoOrders');
      if (demoOrdersString) {
        let parsedDemoOrders = JSON.parse(demoOrdersString);
        
        // Apply status filter if needed
        if (status !== 'all') {
          parsedDemoOrders = parsedDemoOrders.filter((order: any) => order.status === status);
        }
        
        // Apply search filter if needed
        if (search) {
          parsedDemoOrders = parsedDemoOrders.filter((order: any) => 
            order.id.includes(search) || 
            (order.customer_email && order.customer_email.includes(search))
          );
        }
        
        // Format local orders
        const localOrders = parsedDemoOrders.map((order: any) => ({
          ...order,
          email: order.customer_email || 'Unknown',
          user_name: order.customer_name || 'Unknown'
        }));
        
        if (localOrders.length > 0) {
          console.log('Orders found in localStorage:', localOrders.length);
          
          // Check if an order with the same ID exists in allOrders
          const uniqueLocalOrders = localOrders.filter(
            (localOrder: any) => !allOrders.some(order => order.id === localOrder.id)
          );
          
          // Merge orders
          allOrders = [...allOrders, ...uniqueLocalOrders];
          count += uniqueLocalOrders.length;
        }
      }
      
      // Apply pagination to the combined array
      const from = (page - 1) * ordersPerPage;
      const to = from + ordersPerPage;
      const paginatedOrders = allOrders.slice(from, to);
      
      setOrders(paginatedOrders);
      setTotalOrders(count);
    } catch (error) {
      console.error('Error in orders fetch process:', error);
      toast.error('Failed to load orders');
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchOrders(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchOrders(1, searchTerm, statusFilter);
  };

  // Handle status change
  const handleStatusChange = (status: OrderStatus | 'all') => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page on new filter
  };
  
  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      // First try to update in Supabase
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) {
        console.error('Error updating order status in Supabase:', error);
        
        // If Supabase fails, try localStorage
        const demoOrdersString = window.localStorage.getItem('demoOrders');
        if (demoOrdersString) {
          const demoOrders = JSON.parse(demoOrdersString);
          const updatedDemoOrders = demoOrders.map((order: any) => 
            order.id === orderId ? { ...order, status } : order
          );
          window.localStorage.setItem('demoOrders', JSON.stringify(updatedDemoOrders));
          console.log('Order status updated in localStorage');
        }
      }
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  // Status badge color map
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Manage Orders | Admin</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
        <p className="text-gray-600">View and manage customer orders</p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex w-full sm:w-1/2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order ID or email..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <HiSearch className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              fetchOrders(1, '', statusFilter);
            }}
            className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <HiRefresh className="h-5 w-5" />
          </button>
        </form>
        
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusChange('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusFilter === 'all' 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map(status => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusFilter === status 
                  ? statusColors[status]
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No orders found. {searchTerm && 'Try a different search term.'}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.user_name}</div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={`px-2 py-1 rounded-md text-xs font-medium ${statusColors[order.status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        // Open order details modal (future enhancement)
                        toast.success(`Viewing details for order #${order.id.substring(0, 8)}`);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <HiEye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * ordersPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ordersPerPage, totalOrders)}
                </span>{' '}
                of <span className="font-medium">{totalOrders}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <HiOutlineChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === i + 1
                        ? 'z-10 bg-green-600 text-white  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <HiOutlineChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList; 