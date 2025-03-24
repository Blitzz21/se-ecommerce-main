import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { HiCurrencyDollar, HiShoppingCart, HiUsers, HiTag, HiTrendingUp } from 'react-icons/hi';
import { useCurrency } from '../../contexts/CurrencyContext';

// Analytics data types
interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  recentOrders: any[];
  topProducts: any[];
  salesByDay: {
    date: string;
    total: number;
  }[];
  newCustomers: number;
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const { format } = useCurrency();
  const [data, setData] = useState<AnalyticsData>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    recentOrders: [],
    topProducts: [],
    salesByDay: [],
    newCustomers: 0
  });
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Fetch analytics data
  const fetchAnalytics = async (range: 'week' | 'month' | 'year' = 'month') => {
    try {
      setLoading(true);
      
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (range) {
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'month':
        default:
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
      }
      
      const startDateStr = startDate.toISOString();
      
      // Get total sales and orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, created_at, status')
        .gte('created_at', startDateStr)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // Calculate totals
      const completedOrders = ordersData?.filter(order => 
        order.status !== 'cancelled'
      ) || [];
      
      const totalSales = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = completedOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      // Get unique customers count - use profiles table for security
      const { count: customersCount, error: customersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      if (customersError) throw customersError;
      
      // Get new customers in selected time period
      const { count: newCustomersCount, error: newCustomersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
        
      if (newCustomersError) throw newCustomersError;
      
      // Get total products
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true });
      
      if (productsError) throw productsError;
      
      // Get recent orders (limited to 5)
      const recentOrders = ordersData?.slice(0, 5) || [];
      
      // Group sales by day
      const salesByDay: {date: string; total: number}[] = [];
      const dateMap = new Map<string, number>();
      
      completedOrders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-US');
        const currentTotal = dateMap.get(date) || 0;
        dateMap.set(date, currentTotal + (order.total || 0));
      });
      
      dateMap.forEach((total, date) => {
        salesByDay.push({ date, total });
      });
      
      // Sort by date
      salesByDay.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Fetch top products (limited to 5)
      const { data: topProductsData, error: topProductsError } = await supabase
        .from('products')
        .select('id, name, price, image, sale, stock')
        .order('rating', { ascending: false })
        .limit(5);
      
      if (topProductsError) throw topProductsError;
      
      // Set analytics data
      setData({
        totalSales,
        totalOrders,
        totalCustomers: customersCount || 0,
        totalProducts: productsCount || 0,
        averageOrderValue,
        recentOrders,
        topProducts: topProductsData || [],
        salesByDay,
        newCustomers: newCustomersCount || 0
      });
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when time range changes
  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Analytics | Admin</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Store Analytics</h1>
        <p className="text-gray-600">View sales and performance metrics</p>
      </div>
      
      {/* Time range selector */}
      <div className="mb-6 flex justify-end">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              timeRange === 'week'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 text-sm font-medium ${
              timeRange === 'month'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              timeRange === 'year'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Last Year
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Sales */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <HiCurrencyDollar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <div className="text-2xl font-semibold text-gray-900">{format(data.totalSales)}</div>
                </div>
              </div>
            </div>
            
            {/* Total Orders */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <HiShoppingCart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{data.totalOrders}</p>
                </div>
              </div>
            </div>
            
            {/* Average Order Value */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                  <HiTrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                  <div className="text-2xl font-semibold text-gray-900">{format(data.averageOrderValue)}</div>
                </div>
              </div>
            </div>
            
            {/* Total Products */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                  <HiTag className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-semibold text-gray-900">{data.totalProducts}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
            {/* Total Customers */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                  <HiUsers className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-semibold text-gray-900">{data.totalCustomers}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="text-green-500">+{data.newCustomers}</span> new in this period
                  </p>
                </div>
              </div>
            </div>
            
            {/* Conversion Rate (placeholder for future enhancement) */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                  <HiTrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Engagement</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {data.totalOrders > 0 && data.totalCustomers > 0 
                      ? (data.totalOrders / data.totalCustomers).toFixed(2)
                      : '0'} orders/customer
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {data.recentOrders.length === 0 ? (
                  <p className="px-6 py-4 text-gray-500 text-sm">No orders in the selected time period</p>
                ) : (
                  data.recentOrders.map(order => (
                    <div key={order.id} className="px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order #{order.id.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-1">{format(order.total)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Top Products */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {data.topProducts.length === 0 ? (
                  <p className="px-6 py-4 text-gray-500 text-sm">No products available</p>
                ) : (
                  data.topProducts.map(product => (
                    <div key={product.id} className="px-6 py-4 flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {product.image ? (
                          <img 
                            className="h-12 w-12 rounded-md object-cover" 
                            src={product.image} 
                            alt={product.name} 
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                            <HiTag className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-gray-500">
                            Stock: {product.stock}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {product.sale?.active
                              ? <span>
                                  <span className="text-gray-400 line-through mr-1">
                                    {format(product.price)}
                                  </span>
                                  {format(product.price * (1 - product.sale.percentage / 100))}
                                </span>
                              : format(product.price)
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Sales Chart (placeholder) */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
              {data.salesByDay.length === 0 ? (
                <p className="text-gray-500">No sales data available for the selected period</p>
              ) : (
                <div className="w-full h-full p-4">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-gray-500">Date Range: {formatDate(data.salesByDay[0]?.date)} - {formatDate(data.salesByDay[data.salesByDay.length - 1]?.date)}</p>
                    <p className="text-sm text-gray-500">Total: {format(data.totalSales)}</p>
                  </div>
                  <div className="flex items-end h-40 w-full overflow-x-auto">
                    {data.salesByDay.map((day, index) => {
                      const maxSale = Math.max(...data.salesByDay.map(d => d.total));
                      const height = (day.total / maxSale) * 100;
                      
                      return (
                        <div key={index} className="flex flex-col items-center mx-2 first:ml-0 last:mr-0" style={{ minWidth: '60px' }}>
                          <div className="text-xs text-gray-500 mb-1">{format(day.total)}</div>
                          <div 
                            className="w-8 bg-green-500 rounded-t"
                            style={{ height: `${Math.max(height, 5)}%` }}
                          ></div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics; 