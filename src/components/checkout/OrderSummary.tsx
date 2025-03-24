import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';

const OrderSummary = () => {
  const { cartItems, selectedItems, selectedItemsTotal } = useCart();
  const { format } = useCurrency();
  const [updatingCart, setUpdatingCart] = useState(false);
  
  // Add a brief loading state when cart changes
  useEffect(() => {
    setUpdatingCart(true);
    const timer = setTimeout(() => {
      setUpdatingCart(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [cartItems, selectedItems, selectedItemsTotal]);
  
  return (
    <div className="bg-white rounded-lg shadow p-6 relative">
      {updatingCart && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      )}
      
      <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Items ({selectedItems.length})</span>
          <span className="font-medium">{format(selectedItemsTotal)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">Free</span>
        </div>
        
        <div className="border-t pt-4 flex justify-between">
          <span className="text-gray-900 font-medium">Total</span>
          <span className="text-xl font-bold">{format(selectedItemsTotal)}</span>
        </div>
      </div>
      
      <div className="mt-6">
        {selectedItems.length > 0 ? (
          <Link 
            to="/checkout"
            className="w-full bg-green-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-green-700 focus:outline-none"
          >
            Proceed to Checkout
          </Link>
        ) : (
          <button
            disabled
            className="w-full bg-gray-300 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-gray-500 cursor-not-allowed"
          >
            Select Items to Checkout
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderSummary; 