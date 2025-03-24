import React, { createContext, useContext, useState, useEffect } from 'react';

// Define supported currencies with their symbols and exchange rates (relative to USD)
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 150.27 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', rate: 56.94 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.53 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.38 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.34 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.24 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.23 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  format: (amount: number) => string;
  convertToUSD: (amount: number) => number;
  convertFromUSD: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Try to get saved currency from localStorage, default to USD
  const [currency, setCurrency] = useState<Currency>(() => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      try {
        return JSON.parse(savedCurrency);
      } catch (e) {
        return currencies[0]; // USD
      }
    }
    return currencies[0]; // USD
  });

  // Save selected currency to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('currency', JSON.stringify(currency));
  }, [currency]);

  // Format price with currency symbol
  const format = (amount: number): string => {
    // Special formatting for currencies that typically don't show decimal places for whole numbers
    if (currency.code === 'JPY' || currency.code === 'PHP' || currency.code === 'INR') {
      return `${currency.symbol}${Math.round(amount * currency.rate).toLocaleString()}`;
    }
    
    return `${currency.symbol}${(amount * currency.rate).toFixed(2)}`;
  };

  // Convert from selected currency to USD (for storing in database)
  const convertToUSD = (amount: number): number => {
    return amount / currency.rate;
  };

  // Convert from USD to selected currency (for displaying)
  const convertFromUSD = (amount: number): number => {
    return amount * currency.rate;
  };

  const value = {
    currency,
    setCurrency,
    format,
    convertToUSD,
    convertFromUSD,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
} 