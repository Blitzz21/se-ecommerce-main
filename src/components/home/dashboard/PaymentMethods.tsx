import { useState } from 'react';
import { HiCreditCard, HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import { FaPaypal, FaMobile, FaMoneyBillWave } from 'react-icons/fa';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'gcash' | 'grabpay' | 'cashapp';
  name: string;
  details: string;
  expiryDate?: string;
  isDefault: boolean;
}

interface PaymentMethodsProps {
  className?: string;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ className = '' }) => {
  // Initialize with an empty array instead of demo payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'card' | 'paypal' | 'gcash' | 'grabpay' | 'cashapp'>('card');
  const [paymentForm, setPaymentForm] = useState({
    name: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    paypalEmail: '',
    gcashNumber: '',
    grabpayNumber: '',
    cashappUsername: '',
    isDefault: false
  });

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If it's the first payment method or set as default, update other payment methods
    let newPaymentMethods = [...paymentMethods];
    if (paymentForm.isDefault) {
      newPaymentMethods = newPaymentMethods.map(method => ({
        ...method,
        isDefault: false
      }));
    }

    let newPayment: PaymentMethod;

    if (paymentType === 'card') {
      // Format card number for display
      const lastFour = paymentForm.cardNumber.slice(-4);
      newPayment = {
        id: `${paymentMethods.length + 1}`,
        type: 'card',
        name: `Card ending in ${lastFour}`,
        details: `**** **** **** ${lastFour}`,
        expiryDate: paymentForm.expiryDate,
        isDefault: paymentForm.isDefault || paymentMethods.length === 0
      };
    } else if (paymentType === 'paypal') {
      newPayment = {
        id: `${paymentMethods.length + 1}`,
        type: 'paypal',
        name: 'PayPal',
        details: paymentForm.paypalEmail,
        isDefault: paymentForm.isDefault || paymentMethods.length === 0
      };
    } else if (paymentType === 'gcash') {
      newPayment = {
        id: `${paymentMethods.length + 1}`,
        type: 'gcash',
        name: 'GCash',
        details: paymentForm.gcashNumber,
        isDefault: paymentForm.isDefault || paymentMethods.length === 0
      };
    } else if (paymentType === 'grabpay') {
      newPayment = {
        id: `${paymentMethods.length + 1}`,
        type: 'grabpay',
        name: 'GrabPay',
        details: paymentForm.grabpayNumber,
        isDefault: paymentForm.isDefault || paymentMethods.length === 0
      };
    } else { // cashapp
      newPayment = {
        id: `${paymentMethods.length + 1}`,
        type: 'cashapp',
        name: 'Cash App',
        details: paymentForm.cashappUsername,
        isDefault: paymentForm.isDefault || paymentMethods.length === 0
      };
    }
    
    newPaymentMethods.push(newPayment);
    setPaymentMethods(newPaymentMethods);
    resetForm();
  };

  const handleEditPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditingPayment) return;
    
    // If set as default, update other payment methods
    let updatedPaymentMethods = [...paymentMethods];
    if (paymentForm.isDefault) {
      updatedPaymentMethods = updatedPaymentMethods.map(method => ({
        ...method,
        isDefault: false
      }));
    }
    
    const currentPayment = paymentMethods.find(p => p.id === isEditingPayment);
    if (!currentPayment) return;

    let updatedPayment: PaymentMethod;

    if (paymentType === 'card') {
      // Format card number for display
      const lastFour = paymentForm.cardNumber ? paymentForm.cardNumber.slice(-4) : currentPayment.details.slice(-4);
      updatedPayment = {
        ...currentPayment,
        name: `Card ending in ${lastFour}`,
        details: `**** **** **** ${lastFour}`,
        expiryDate: paymentForm.expiryDate || currentPayment.expiryDate,
        isDefault: paymentForm.isDefault
      };
    } else if (paymentType === 'paypal') {
      updatedPayment = {
        ...currentPayment,
        type: 'paypal',
        name: 'PayPal',
        details: paymentForm.paypalEmail,
        expiryDate: undefined,
        isDefault: paymentForm.isDefault
      };
    } else if (paymentType === 'gcash') {
      updatedPayment = {
        ...currentPayment,
        type: 'gcash',
        name: 'GCash',
        details: paymentForm.gcashNumber,
        expiryDate: undefined,
        isDefault: paymentForm.isDefault
      };
    } else if (paymentType === 'grabpay') {
      updatedPayment = {
        ...currentPayment,
        type: 'grabpay',
        name: 'GrabPay',
        details: paymentForm.grabpayNumber,
        expiryDate: undefined,
        isDefault: paymentForm.isDefault
      };
    } else { // cashapp
      updatedPayment = {
        ...currentPayment,
        type: 'cashapp',
        name: 'Cash App',
        details: paymentForm.cashappUsername,
        expiryDate: undefined,
        isDefault: paymentForm.isDefault
      };
    }
    
    updatedPaymentMethods = updatedPaymentMethods.map(method => 
      method.id === isEditingPayment ? updatedPayment : method
    );
    
    setPaymentMethods(updatedPaymentMethods);
    resetForm();
  };

  const handleRemovePayment = (id: string) => {
    // Filter out the payment method to be removed
    let updatedPaymentMethods = paymentMethods.filter(method => method.id !== id);
    
    // If we removed the default payment method and there are other methods, make the first one default
    if (paymentMethods.find(m => m.id === id)?.isDefault && updatedPaymentMethods.length > 0) {
      updatedPaymentMethods = updatedPaymentMethods.map((method, index) => 
        index === 0 ? { ...method, isDefault: true } : method
      );
    }
    
    setPaymentMethods(updatedPaymentMethods);
  };

  const handleSetDefault = (id: string) => {
    // Update all payment methods, setting isDefault to true only for the selected method
    const updatedPaymentMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    }));
    
    setPaymentMethods(updatedPaymentMethods);
  };

  const startEditing = (paymentMethod: PaymentMethod) => {
    setPaymentType(paymentMethod.type);
    
    if (paymentMethod.type === 'card') {
      setPaymentForm({
        name: paymentMethod.name,
        cardNumber: '', // We don't store or display full card number for security
        expiryDate: paymentMethod.expiryDate || '',
        cvc: '',
        paypalEmail: '',
        gcashNumber: '',
        grabpayNumber: '',
        cashappUsername: '',
        isDefault: paymentMethod.isDefault
      });
    } else if (paymentMethod.type === 'paypal') {
      setPaymentForm({
        name: '',
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        paypalEmail: paymentMethod.details,
        gcashNumber: '',
        grabpayNumber: '',
        cashappUsername: '',
        isDefault: paymentMethod.isDefault
      });
    } else if (paymentMethod.type === 'gcash') {
      setPaymentForm({
        name: '',
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        paypalEmail: '',
        gcashNumber: paymentMethod.details,
        grabpayNumber: '',
        cashappUsername: '',
        isDefault: paymentMethod.isDefault
      });
    } else if (paymentMethod.type === 'grabpay') {
      setPaymentForm({
        name: '',
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        paypalEmail: '',
        gcashNumber: '',
        grabpayNumber: paymentMethod.details,
        cashappUsername: '',
        isDefault: paymentMethod.isDefault
      });
    } else { // cashapp
      setPaymentForm({
        name: '',
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        paypalEmail: '',
        gcashNumber: '',
        grabpayNumber: '',
        cashappUsername: paymentMethod.details,
        isDefault: paymentMethod.isDefault
      });
    }
    
    setIsEditingPayment(paymentMethod.id);
    setIsAddingPayment(false);
  };

  const resetForm = () => {
    setPaymentForm({
      name: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      paypalEmail: '',
      gcashNumber: '',
      grabpayNumber: '',
      cashappUsername: '',
      isDefault: false
    });
    setPaymentType('card');
    setIsAddingPayment(false);
    setIsEditingPayment(null);
  };
  
  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <HiCreditCard className="h-6 w-6 text-gray-400" />;
      case 'paypal':
        return <FaPaypal className="h-6 w-6 text-[#003087]" />;
      case 'gcash':
        return <FaMobile className="h-6 w-6 text-[#00a1df]" />;
      case 'grabpay':
        return <FaMobile className="h-6 w-6 text-[#00b14f]" />;
      case 'cashapp':
        return <FaMoneyBillWave className="h-6 w-6 text-[#00d632]" />;
      default:
        return <HiCreditCard className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-gray-900">Payment Methods</h2>
        {!isAddingPayment && !isEditingPayment && (
          <button
            onClick={() => setIsAddingPayment(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none"
          >
            <HiPlus className="mr-1 h-4 w-4" />
            Add Payment Method
          </button>
        )}
      </div>

      {paymentMethods.length === 0 && !isAddingPayment ? (
        <div className="text-center py-8 text-gray-500">
          <HiCreditCard className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-sm">No payment methods saved yet</p>
          <button
            onClick={() => setIsAddingPayment(true)}
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          >
            Add a Payment Method
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Payment methods list */}
          {!isAddingPayment && !isEditingPayment && paymentMethods.map(method => (
            <div key={method.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                  {getPaymentIcon(method.type)}
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900">{method.name}</p>
                    {method.isDefault && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>{method.details}</p>
                    {method.expiryDate && <p>Expires: {method.expiryDate}</p>}
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => startEditing(method)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <HiPencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleRemovePayment(method.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <HiTrash className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add/Edit payment method form */}
          {(isAddingPayment || isEditingPayment) && (
            <div className="mt-6 border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {isAddingPayment ? 'Add New Payment Method' : 'Edit Payment Method'}
              </h3>
              
              <div className="mb-4">
                <div className="flex space-x-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPaymentType('card')}
                    className={`mb-2 py-2 px-4 border rounded-md flex justify-center items-center space-x-2 ${
                      paymentType === 'card' 
                        ? 'bg-green-100 border-green-500 text-green-800' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <HiCreditCard className="h-5 w-5" />
                    <span>Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('paypal')}
                    className={`mb-2 py-2 px-4 border rounded-md flex justify-center items-center space-x-2 ${
                      paymentType === 'paypal' 
                        ? 'bg-blue-100 border-blue-500 text-blue-800' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <FaPaypal className="h-5 w-5 text-[#003087]" />
                    <span>PayPal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('gcash')}
                    className={`mb-2 py-2 px-4 border rounded-md flex justify-center items-center space-x-2 ${
                      paymentType === 'gcash' 
                        ? 'bg-blue-100 border-blue-500 text-blue-800' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <FaMobile className="h-5 w-5 text-[#00a1df]" />
                    <span>GCash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('grabpay')}
                    className={`mb-2 py-2 px-4 border rounded-md flex justify-center items-center space-x-2 ${
                      paymentType === 'grabpay' 
                        ? 'bg-green-100 border-green-500 text-green-800' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <FaMobile className="h-5 w-5 text-[#00b14f]" />
                    <span>GrabPay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('cashapp')}
                    className={`mb-2 py-2 px-4 border rounded-md flex justify-center items-center space-x-2 ${
                      paymentType === 'cashapp' 
                        ? 'bg-green-100 border-green-500 text-green-800' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <FaMoneyBillWave className="h-5 w-5 text-[#00d632]" />
                    <span>Cash App</span>
                  </button>
                </div>
              </div>
              
              <form onSubmit={isAddingPayment ? handleAddPayment : handleEditPayment}>
                {paymentType === 'card' && (
                  <>
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6">
                        <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                          Card number
                        </label>
                        <input
                          type="text"
                          id="card-number"
                          value={paymentForm.cardNumber}
                          onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                          placeholder="1234 5678 9012 3456"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          required={isAddingPayment}
                        />
                      </div>

                      <div className="col-span-3">
                        <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700">
                          Expiry date (MM/YY)
                        </label>
                        <input
                          type="text"
                          id="expiry-date"
                          value={paymentForm.expiryDate}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 4) {
                              setPaymentForm({...paymentForm, expiryDate: value});
                            }
                          }}
                          placeholder="MM/YY"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          required={isAddingPayment}
                        />
                      </div>

                      <div className="col-span-3">
                        <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
                          CVC
                        </label>
                        <input
                          type="text"
                          id="cvc"
                          value={paymentForm.cvc}
                          onChange={(e) => setPaymentForm({...paymentForm, cvc: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                          placeholder="123"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          required={isAddingPayment}
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentType === 'paypal' && (
                  <div className="col-span-6">
                    <label htmlFor="paypal-email" className="block text-sm font-medium text-gray-700">
                      PayPal Email Address
                    </label>
                    <input
                      type="email"
                      id="paypal-email"
                      value={paymentForm.paypalEmail}
                      onChange={(e) => setPaymentForm({...paymentForm, paypalEmail: e.target.value})}
                      placeholder="your-email@example.com"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                )}

                {paymentType === 'gcash' && (
                  <div className="col-span-6">
                    <label htmlFor="gcash-number" className="block text-sm font-medium text-gray-700">
                      GCash Phone Number
                    </label>
                    <input
                      type="tel"
                      id="gcash-number"
                      value={paymentForm.gcashNumber}
                      onChange={(e) => setPaymentForm({...paymentForm, gcashNumber: e.target.value.replace(/\D/g, '').slice(0, 11)})}
                      placeholder="09xxxxxxxxx"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                )}

                {paymentType === 'grabpay' && (
                  <div className="col-span-6">
                    <label htmlFor="grabpay-number" className="block text-sm font-medium text-gray-700">
                      GrabPay Phone Number
                    </label>
                    <input
                      type="tel"
                      id="grabpay-number"
                      value={paymentForm.grabpayNumber}
                      onChange={(e) => setPaymentForm({...paymentForm, grabpayNumber: e.target.value.replace(/\D/g, '').slice(0, 11)})}
                      placeholder="09xxxxxxxxx"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                )}

                {paymentType === 'cashapp' && (
                  <div className="col-span-6">
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
                        value={paymentForm.cashappUsername}
                        onChange={(e) => setPaymentForm({...paymentForm, cashappUsername: e.target.value})}
                        placeholder="username"
                        className="block w-full border border-gray-300 rounded-none rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      id="default-payment"
                      name="default-payment"
                      type="checkbox"
                      checked={paymentForm.isDefault}
                      onChange={(e) => setPaymentForm({...paymentForm, isDefault: e.target.checked})}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="default-payment" className="ml-2 block text-sm text-gray-700">
                      Set as default payment method
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-700 focus:outline-none"
                  >
                    {isAddingPayment ? 'Add Payment Method' : 'Update Payment Method'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 