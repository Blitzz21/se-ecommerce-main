import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

interface OrderListProps {
  orders: Order[];
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export const OrderList: React.FC<OrderListProps> = ({ 
  orders = [], 
  limit = 5,
  showViewAll = true,
  className = '' 
}) => {
  const navigate = useNavigate();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  // Safely get displayed orders, handling empty arrays or undefined
  const displayedOrders = Array.isArray(orders) && orders.length > 0
    ? (limit ? orders.slice(0, limit) : orders)
    : [];

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const viewOrderDetails = (order: Order) => {
    setActiveOrder(order);
    setShowOrderDetails(true);
  };

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

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium text-gray-900">Recent Orders</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {orders.length > 0 ? `${displayedOrders.length} of ${orders.length} orders` : 'No orders yet'}
          </p>
        </div>
        {showViewAll && orders.length > limit && (
          <button
            onClick={() => navigate('/orders')}
            className="text-sm font-medium text-green-600 hover:text-green-800"
          >
            View all orders
          </button>
        )}
      </div>

      {!orders || orders.length === 0 ? (
        <div className="px-4 py-5 sm:p-6 text-center">
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Browse Products
          </button>
        </div>
      ) : (
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
              {displayedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id ? order.id.slice(0, 8) + '...' : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.created_at ? formatDate(order.created_at) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.items ? `${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}` : '0 items'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${order.total ? order.total.toFixed(2) : '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
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
      )}

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
                  <p className="mt-1 text-sm text-gray-900">{activeOrder.id || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Order Date</h4>
                  <p className="mt-1 text-sm text-gray-900">{activeOrder.created_at ? formatDate(activeOrder.created_at) : 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${statusColors[activeOrder.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                      {activeOrder.status ? activeOrder.status.charAt(0).toUpperCase() + activeOrder.status.slice(1) : 'Unknown'}
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total</h4>
                  <p className="mt-1 text-sm text-gray-900">${activeOrder.total ? activeOrder.total.toFixed(2) : '0.00'}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Items</h4>
                {activeOrder.items && activeOrder.items.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {activeOrder.items.map((item, index) => (
                      <li key={index} className="py-3 flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product_name || 'Unnamed Product'}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity || 0}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No items in this order</p>
                )}
              </div>
              
              {activeOrder.billing_address && (
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-900">{activeOrder.customer_name || 'N/A'}</p>
                  <p className="text-sm text-gray-900">{activeOrder.billing_address.line1 || 'N/A'}</p>
                  <p className="text-sm text-gray-900">
                    {activeOrder.billing_address.city || 'N/A'}, {activeOrder.billing_address.state || 'N/A'} {activeOrder.billing_address.postal_code || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-900">{activeOrder.billing_address.country || 'N/A'}</p>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h4>
                <p className="text-sm text-gray-900">Payment ID: {activeOrder.payment_id || 'N/A'}</p>
                <p className="text-sm text-gray-900">Email: {activeOrder.customer_email || 'N/A'}</p>
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