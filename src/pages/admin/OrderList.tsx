import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { HiSearch, HiRefresh, HiOutlineChevronLeft, HiOutlineChevronRight, HiEye } from 'react-icons/hi';

// Order status types
type OrderStatus = 'paid' | 'processing' | 'processed' | 'shipping' | 'delivering' | 'delivered' | 'cancelled';

// Order interface updated to match database structure
interface Order {
  id: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  status: OrderStatus;
  total: number;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
  shipping_address?: {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  billing_address?: {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  customer_name?: string;
  customer_email?: string;
  payment_id?: string;
  payment_method?: string;
  // Frontend-only properties for display
  email?: string;
  user_name?: string;
}

export const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 10;


  // Add this state at the top of the component
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders with pagination
  const fetchOrders = async (page = 1, search = '', status: OrderStatus | 'all' = 'all') => {
    try {
      setLoading(true);
      
      console.log('Fetching orders with params:', { page, search, status });
      
      // Get total count first with a simpler query
      const countQuery = supabase
        .from('orders')
        .select('id', { count: 'exact' });
        
      // Add status filter if needed
      if (status !== 'all') {
        countQuery.eq('status', status);
      }
      
      // Add search filter if needed
      if (search) {
        countQuery.or(`id.ilike.%${search}%,customer_email.ilike.%${search}%`);
      }
      
      const { count: totalCount, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Error fetching order count:', countError);
      } else {
        console.log('Total orders count:', totalCount);
        setTotalOrders(totalCount || 0);
      }
      
      // Now fetch the actual orders
      let query = supabase
        .from('orders')
        .select('*');
      
      // Add status filter if needed
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      
      // Add search if provided
      if (search) {
        query = query.or(`id.ilike.%${search}%,customer_email.ilike.%${search}%`);
      }
      
      // Add pagination
      const from = (page - 1) * ordersPerPage;
      query = query
        .order('created_at', { ascending: false })
        .range(from, from + ordersPerPage - 1);
      
      // Execute the query
      const { data: orderData, error: ordersError } = await query;
      
      if (ordersError) {
        console.error('Error fetching orders from Supabase:', ordersError);
        toast.error('Failed to load orders. Please try again later.');
        setOrders([]);
      } else if (orderData && orderData.length > 0) {
        console.log('Orders found in Supabase:', orderData.length);
        
        // Format orders with user information
        const formattedOrders = orderData.map(order => ({
          ...order,
          email: order.customer_email || 'Unknown',
          user_name: order.customer_name || 'Unknown'
        }));
        
        setOrders(formattedOrders);
      } else {
        console.log('No orders found in database');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error in orders fetch process:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchOrders(currentPage, searchTerm, statusFilter);

    // Set up realtime subscription for orders
    const ordersSubscription = supabase
      .channel('admin-orders-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders'
        }, 
        (payload) => {
          console.log('Admin realtime update received:', payload);
          
          // If we're not on the first page or have filters, just refetch
          if (currentPage !== 1 || searchTerm || statusFilter !== 'all') {
            fetchOrders(currentPage, searchTerm, statusFilter);
            return;
          }
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            // For insert, we need to get the user profile data as well
            fetchOrderWithProfile(payload.new.id).then(formattedOrder => {
              if (formattedOrder) {
                // Add to beginning if we're on the first page and no filters
                setOrders(prevOrders => {
                  // Limit to ordersPerPage
                  const updatedOrders = [formattedOrder, ...prevOrders];
                  return updatedOrders.slice(0, ordersPerPage);
                });
                
                // Update total count
                setTotalOrders(prevCount => prevCount + 1);
              }
            });
          } else if (payload.eventType === 'UPDATE') {
            // For updates, update the order if it's in our current view
            setOrders(prevOrders => 
              prevOrders.map(order => 
                order.id === payload.new.id ? {
                  ...order,
                  ...payload.new,
                } : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // For deletes, remove the order if it's in our current view
            setOrders(prevOrders => 
              prevOrders.filter(order => order.id !== payload.old.id)
            );
            // Update total count
            setTotalOrders(prevCount => Math.max(0, prevCount - 1));
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount or when filters change
    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, [currentPage, searchTerm, statusFilter]);

  // Helper function to fetch a single order with profile
  const fetchOrderWithProfile = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (
            email, 
            first_name, 
            last_name
          )
        `)
        .eq('id', orderId)
        .single();
        
      if (error || !data) {
        console.error('Error fetching order details:', error);
        return null;
      }
      
      const profile = data.profiles;
      return {
        ...data,
        email: profile?.email || 'Unknown',
        user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown',
        profiles: undefined
      };
    } catch (error) {
      console.error('Error fetching order with profile:', error);
      return null;
    }
  };

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
  
  // Get valid next statuses based on current status
  const getValidNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case 'paid':
        return ['processing', 'cancelled'];
      case 'processing':
        return ['processed', 'cancelled'];
      case 'processed':
        return ['shipping', 'cancelled'];
      case 'shipping':
        return ['delivering', 'cancelled'];
      case 'delivering':
        return ['delivered', 'cancelled'];
      case 'delivered':
        return ['cancelled']; // Can still cancel if needed
      case 'cancelled':
        return ['paid']; // Allow reactivating a cancelled order
      default:
        return ['paid', 'processing', 'processed', 'shipping', 'delivering', 'delivered', 'cancelled'];
    }
  };

  // Get valid statuses for dropdown including current status
  const getStatusOptions = (currentStatus: OrderStatus): OrderStatus[] => {
    const nextStatuses = getValidNextStatuses(currentStatus);
    if (!nextStatuses.includes(currentStatus)) {
      return [currentStatus, ...nextStatuses];
    }
    return nextStatuses;
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      
      if (error) {
        console.error('Error updating order status in Supabase:', error);
        toast.error('Failed to update order status');
        return;
      }
      
      // Don't update local state manually - the realtime subscription will handle this
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
    paid: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    processed: 'bg-indigo-100 text-indigo-800',
    shipping: 'bg-purple-100 text-purple-800',
    delivering: 'bg-teal-100 text-teal-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  // Add this helper function for formatting JSON
  const formatAddress = (address: any) => {
    if (!address) return 'No address provided';
    
    try {
      // If it's a string, try to parse it
      const addressObj = typeof address === 'string' 
        ? JSON.parse(address) 
        : address;
        
      return (
        <div>
          <p>{addressObj.line1 || addressObj.address || 'N/A'}</p>
          <p>
            {addressObj.city || 'N/A'}, {addressObj.state || 'N/A'} {addressObj.postal_code || 'N/A'}
          </p>
          <p>{addressObj.country || 'N/A'}</p>
        </div>
      );
    } catch (e) {
      console.error('Error parsing address:', e);
      return 'Invalid address format';
    }
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
          {(['paid', 'processing', 'processed', 'shipping', 'delivering', 'delivered', 'cancelled'] as const).map(status => (
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
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
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
                    {order.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.user_name || order.customer_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.email || order.customer_email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${parseFloat(order.total.toString()).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={`px-2 py-1 rounded-md text-xs font-medium ${statusColors[order.status]}`}
                    >
                      {getStatusOptions(order.status).map(status => (
                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      <HiEye className="h-5 w-5" aria-hidden="true" />
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

      {/* When no orders are found */}
      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'No orders match your current filters.' 
              : 'There are no orders in the system yet.'}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                fetchOrders(1, '', 'all');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <HiRefresh className="-ml-1 mr-2 h-5 w-5" />
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Order Details: #{selectedOrder.id.substring(0, 8)}
              </h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Order Information</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[selectedOrder.status]}`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Order Date:</span>{' '}
                      {formatDate(selectedOrder.created_at)}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Total:</span>{' '}
                      ${parseFloat(selectedOrder.total.toString()).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Payment ID:</span>{' '}
                      {selectedOrder.payment_id || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Payment Method:</span>{' '}
                      {selectedOrder.payment_method || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Customer Information</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Name:</span>{' '}
                      {selectedOrder.customer_name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Email:</span>{' '}
                      {selectedOrder.customer_email || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">User ID:</span>{' '}
                      {selectedOrder.user_id}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500">Shipping Address</h4>
                <div className="mt-2 text-sm text-gray-900">
                  {formatAddress(selectedOrder.shipping_address)}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500">Billing Address</h4>
                <div className="mt-2 text-sm text-gray-900">
                  {formatAddress(selectedOrder.billing_address)}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Order Items</h4>
                {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200 mt-2">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.product_name || 'Unknown Product'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${parseFloat(item.price.toString()).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">No items found for this order.</p>
                )}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList; 