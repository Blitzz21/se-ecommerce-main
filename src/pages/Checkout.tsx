import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { toast } from 'react-hot-toast';
import { HiChevronLeft, HiHome } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import { v4 as uuidv4 } from 'uuid';
import { FaPaypal, FaMobile, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';

type Product = Database['public']['Tables']['products']['Row'];

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const CheckoutForm = () => {
  const { user } = useAuth();
  const { selectedItems, selectedItemsTotal, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'gcash' | 'grabpay' | 'cashapp'>('card');
  
  // Card payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  
  // PayPal fields
  const [paypalEmail, setPaypalEmail] = useState(user?.email || '');
  
  // GCash fields
  const [gcashNumber, setGcashNumber] = useState(user?.user_metadata?.phone || '');
  
  // GrabPay fields
  const [grabpayNumber, setGrabpayNumber] = useState(user?.user_metadata?.phone || '');
  
  // Cash App fields
  const [cashappUsername, setCashappUsername] = useState('');
  
  const [billingDetails, setBillingDetails] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Load saved addresses
    const fetchSavedAddresses = () => {
      try {
        // For demo purposes, we'll use empty addresses array by default
        const demoAddresses: Address[] = [];
        
        setAddresses(demoAddresses);
        setSelectedAddress(demoAddresses.length > 0 ? demoAddresses[0].id : '');
        
        // No default address since we have an empty array
      } catch (error) {
        console.error('Error loading saved addresses:', error);
      }
    };

    // Fetch products and addresses
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in(
            'id',
            selectedItems.map(item => item.product_id)
          );

        if (error) throw error;
        if (data) setProducts(data);
      } catch (err) {
        console.error('Error fetching products for checkout:', err);
        toast.error('Failed to load product details');
      }
    };

    fetchProducts();
    fetchSavedAddresses();
  }, [selectedItems, navigate, user?.email]);

  const handleAddressSelect = (addressId: string) => {
    const selected = addresses.find(addr => addr.id === addressId);
    if (selected) {
      setSelectedAddress(addressId);
      setBillingDetails({
        line1: selected.street,
        line2: '',
        city: selected.city,
        state: selected.state,
        postal_code: selected.postalCode,
        country: selected.country,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('billing_')) {
      const billingField = name.replace('billing_', '');
      setBillingDetails(prev => ({
        ...prev,
        [billingField]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    // Validate form based on selected payment method
    if (paymentMethod === 'card') {
      if (
        !name ||
        !cardNumber ||
        !expiry ||
        !cvc ||
        (!useExistingAddress && (
          !billingDetails.line1 ||
          !billingDetails.city ||
          !billingDetails.state ||
          !billingDetails.postal_code
        ))
      ) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else if (paymentMethod === 'paypal') {
      if (
        !paypalEmail ||
        (!useExistingAddress && (
          !billingDetails.line1 ||
          !billingDetails.city ||
          !billingDetails.state ||
          !billingDetails.postal_code
        ))
      ) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else if (paymentMethod === 'gcash') {
      if (
        !gcashNumber ||
        (!useExistingAddress && (
          !billingDetails.line1 ||
          !billingDetails.city ||
          !billingDetails.state ||
          !billingDetails.postal_code
        ))
      ) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else if (paymentMethod === 'grabpay') {
      if (
        !grabpayNumber ||
        (!useExistingAddress && (
          !billingDetails.line1 ||
          !billingDetails.city ||
          !billingDetails.state ||
          !billingDetails.postal_code
        ))
      ) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else if (paymentMethod === 'cashapp') {
      if (
        !cashappUsername ||
        (!useExistingAddress && (
          !billingDetails.line1 ||
          !billingDetails.city ||
          !billingDetails.state ||
          !billingDetails.postal_code
        ))
      ) {
        toast.error('Please fill in all required fields');
        return;
      }
    }

    try {
      setLoading(true);

      // In a real app, we would validate the payment here with a payment processor
      const paymentId = `pm_${Date.now()}`;  // simulate a payment ID

      // Create order items
      const orderItems = selectedItems.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
          product_id: item.product_id,
          product_name: product?.name || item.product_name,
          price: product?.price || item.price,
          quantity: item.quantity
        };
      });

      const order = {
        id: uuidv4(),
        user_id: user.id,
        total: selectedItemsTotal,
        status: 'paid',
        items: orderItems,
        billing_address: billingDetails,
        shipping_address: billingDetails,
        customer_name: name,
        customer_email: user.email || '',
        payment_id: paymentId,
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try to insert order to Supabase
      const { error: orderError } = await supabase
        .from('orders')
        .insert([order]);

      if (orderError) {
        console.error('Error creating order in Supabase:', orderError);
        toast.error('Failed to place order');
        setLoading(false);
        return;
      }

      console.log('Order successfully saved in Supabase:', order.id);

      // Remove purchased items from cart
      for (const item of selectedItems) {
        await removeFromCart(item.id);
      }

      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-lg shadow overflow-hidden divide-y divide-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Billing Information</h3>
          
          {addresses.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center">
                <input
                  id="use-existing-address"
                  name="use-existing-address"
                  type="checkbox"
                  checked={useExistingAddress}
                  onChange={(e) => setUseExistingAddress(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="use-existing-address" className="ml-2 block text-sm text-gray-700">
                  Use a saved address
                </label>
              </div>
            </div>
          )}

          {useExistingAddress ? (
            <div className="mt-4">
              <label htmlFor="saved-address" className="block text-sm font-medium text-gray-700">
                Select an address
              </label>
              <select
                id="saved-address"
                value={selectedAddress}
                onChange={(e) => handleAddressSelect(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                {addresses.map(address => (
                  <option key={address.id} value={address.id}>
                    {address.name}: {address.street}, {address.city}, {address.state} {address.postalCode}
                  </option>
                ))}
              </select>

              {selectedAddress && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <HiHome className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3 text-sm">
                      {addresses.find(a => a.id === selectedAddress)?.street}<br />
                      {addresses.find(a => a.id === selectedAddress)?.city}, {addresses.find(a => a.id === selectedAddress)?.state} {addresses.find(a => a.id === selectedAddress)?.postalCode}<br />
                      {addresses.find(a => a.id === selectedAddress)?.country}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>

              <div className="col-span-6">
                <label htmlFor="billing_line1" className="block text-sm font-medium text-gray-700">
                  Street address
                </label>
                <input
                  type="text"
                  name="billing_line1"
                  id="billing_line1"
                  value={billingDetails.line1}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                <label htmlFor="billing_city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  name="billing_city"
                  id="billing_city"
                  value={billingDetails.city}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                <label htmlFor="billing_state" className="block text-sm font-medium text-gray-700">
                  State / Province
                </label>
                <input
                  type="text"
                  name="billing_state"
                  id="billing_state"
                  value={billingDetails.state}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                <label htmlFor="billing_postal_code" className="block text-sm font-medium text-gray-700">
                  ZIP / Postal code
                </label>
                <input
                  type="text"
                  name="billing_postal_code"
                  id="billing_postal_code"
                  value={billingDetails.postal_code}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-6">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center justify-center py-3 px-4 border rounded-md ${
                paymentMethod === 'card'
                  ? 'bg-green-100 border-green-500 text-green-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaCreditCard className={`mr-2 h-5 w-5 ${paymentMethod === 'card' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Credit Card</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('paypal')}
              className={`flex items-center justify-center py-3 px-4 border rounded-md ${
                paymentMethod === 'paypal'
                  ? 'bg-blue-100 border-blue-500 text-blue-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaPaypal className={`mr-2 h-5 w-5 ${paymentMethod === 'paypal' ? 'text-[#003087]' : 'text-gray-500'}`} />
              <span>PayPal</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('gcash')}
              className={`flex items-center justify-center py-3 px-4 border rounded-md ${
                paymentMethod === 'gcash'
                  ? 'bg-blue-100 border-blue-500 text-blue-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaMobile className={`mr-2 h-5 w-5 ${paymentMethod === 'gcash' ? 'text-[#00a1df]' : 'text-gray-500'}`} />
              <span>GCash</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('grabpay')}
              className={`flex items-center justify-center py-3 px-4 border rounded-md ${
                paymentMethod === 'grabpay'
                  ? 'bg-green-100 border-green-500 text-green-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaMobile className={`mr-2 h-5 w-5 ${paymentMethod === 'grabpay' ? 'text-[#00b14f]' : 'text-gray-500'}`} />
              <span>GrabPay</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('cashapp')}
              className={`flex items-center justify-center py-3 px-4 border rounded-md ${
                paymentMethod === 'cashapp'
                  ? 'bg-green-100 border-green-500 text-green-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaMoneyBillWave className={`mr-2 h-5 w-5 ${paymentMethod === 'cashapp' ? 'text-[#00d632]' : 'text-gray-500'}`} />
              <span>Cash App</span>
            </button>
          </div>
          
          {paymentMethod === 'card' && (
            <div className="mt-6 grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                  Card number
                </label>
                <input
                  type="text"
                  id="card-number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                  Expiry date (MM/YY)
                </label>
                <input
                  type="text"
                  id="expiry"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="MM/YY"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
                  CVC
                </label>
                <input
                  type="text"
                  id="cvc"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="123"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
            </div>
          )}
          
          {paymentMethod === 'paypal' && (
            <div className="mt-6">
              <label htmlFor="paypal-email" className="block text-sm font-medium text-gray-700">
                PayPal Email Address
              </label>
              <input
                type="email"
                id="paypal-email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                You'll be redirected to PayPal to complete your purchase securely.
              </p>
            </div>
          )}
          
          {paymentMethod === 'gcash' && (
            <div className="mt-6">
              <label htmlFor="gcash-number" className="block text-sm font-medium text-gray-700">
                GCash Phone Number
              </label>
              <input
                type="tel"
                id="gcash-number"
                value={gcashNumber}
                onChange={(e) => setGcashNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="09xxxxxxxxx"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                You'll receive an SMS to confirm your GCash payment.
              </p>
            </div>
          )}
          
          {paymentMethod === 'grabpay' && (
            <div className="mt-6">
              <label htmlFor="grabpay-number" className="block text-sm font-medium text-gray-700">
                GrabPay Phone Number
              </label>
              <input
                type="tel"
                id="grabpay-number"
                value={grabpayNumber}
                onChange={(e) => setGrabpayNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="09xxxxxxxxx"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                You'll receive a notification to confirm your GrabPay payment.
              </p>
            </div>
          )}
          
          {paymentMethod === 'cashapp' && (
            <div className="mt-6">
              <label htmlFor="cashapp-username" className="block text-sm font-medium text-gray-700">
                Cash App Username
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  $
                </span>
                <input
                  type="text"
                  id="cashapp-username"
                  value={cashappUsername}
                  onChange={(e) => setCashappUsername(e.target.value)}
                  placeholder="username"
                  className="block w-full border border-gray-300 rounded-none rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                You'll receive a request for payment on Cash App.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
          <div className="mt-6 flow-root">
            <ul role="list" className="-my-6 divide-y divide-gray-200">
              {selectedItems.map((item) => {
                const product = products.find((p) => p.id === item.product_id);
                if (!product) return null;

                return (
                  <li key={item.id} className="py-6 flex flex-col sm:flex-row">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mx-auto sm:mx-0">
                      <img
                        src={product.image || "https://placehold.co/400x300?text=GPU"}
                        alt={product.name}
                        className="h-full w-full object-contain object-center"
                      />
                    </div>

                    <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-1 flex-col text-center sm:text-left">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:justify-between text-base font-medium text-gray-900">
                          <h3 className="mb-1 sm:mb-0">{product.name}</h3>
                          <p className="sm:ml-4">${product.price.toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="flex-1 flex items-center justify-center sm:justify-end text-sm mt-2">
                        <p className="text-gray-500">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Subtotal</p>
              <p>${selectedItemsTotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-base font-medium text-gray-900 mt-4">
              <p>Total</p>
              <p>${selectedItemsTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <HiChevronLeft className="-ml-1 mr-2 h-5 w-5" />
          Back to Cart
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </form>
  );
};

const Checkout = () => {
  const { selectedItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedItems.length === 0) {
      navigate('/cart');
    }
  }, [selectedItems, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Checkout | ShopSmart</title>
      </Helmet>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      <CheckoutForm />
    </div>
  );
};

export default Checkout; 