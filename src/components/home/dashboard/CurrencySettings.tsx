import { useState } from 'react';
import { useCurrency, currencies } from '../../../contexts/CurrencyContext';

interface CurrencySettingsProps {
  className?: string;
}

export const CurrencySettings: React.FC<CurrencySettingsProps> = ({ className = '' }) => {
  const { currency, setCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCurrencies = searchTerm
    ? currencies.filter(
        c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          c.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currencies;

  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
      <h2 className="text-xl font-medium text-gray-900 mb-4">Currency Settings</h2>
      
      <div className="mb-4">
        <label htmlFor="currency-search" className="sr-only">
          Search currencies
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            id="currency-search"
            name="currency-search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Search currencies"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCurrencies.map((curr) => (
          <div 
            key={curr.code} 
            className={`relative rounded-lg border px-5 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500 ${currency.code === curr.code ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
            onClick={() => setCurrency(curr)}
          >
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-xl font-medium">
              {curr.symbol}
            </div>
            <div className="flex-1 min-w-0">
              <button 
                type="button" 
                className="focus:outline-none w-full text-left"
              >
                <span className="absolute inset-0" aria-hidden="true"></span>
                <p className="text-sm font-medium text-gray-900">
                  {curr.code}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {curr.name}
                </p>
              </button>
            </div>
            {currency.code === curr.code && (
              <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full ring-2 ring-offset-2 ring-green-600 bg-green-600"></span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-900">Current Currency</h3>
        <div className="mt-2 flex items-center">
          <span className="text-2xl font-semibold mr-2">{currency.symbol}</span>
          <div>
            <p className="text-sm font-medium">{currency.code} - {currency.name}</p>
            <p className="text-xs text-gray-500">Exchange rate: 1 USD = {currency.rate} {currency.code}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Note: All prices are stored in USD and converted to your selected currency for display. 
          Exchange rates are approximate and updated periodically.
        </p>
      </div>
    </div>
  );
}; 