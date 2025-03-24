import { Link } from 'react-router-dom';
import { HiShoppingCart } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';

interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Your Cart | ShopSmart</title>
      </Helmet>
      
      <div className="text-center py-12">
        <HiShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
        <h2 className="mt-2 text-lg font-medium text-gray-900">{message}</h2>
        <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart.</p>
        <div className="mt-6">
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmptyState; 