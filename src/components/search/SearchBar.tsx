import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../data/products';
import { HiSearch } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  products: Product[];
}

export const SearchBar = ({ products }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle clicks outside of search component
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setResults(filtered.slice(0, 5)); // Limit to 5 results
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [searchTerm, products]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleResultClick = (productId: string) => {
    navigate(`/products/${productId}`);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </form>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden"
          >
            {results.map((product) => (
              <motion.button
                key={product.id}
                onClick={() => handleResultClick(product.id)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                whileHover={{ backgroundColor: '#f9fafb' }}
              >
                <img
                  src={product.image || "https://placehold.co/400x300?text=GPU"}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                </div>
              </motion.button>
            ))}
            {searchTerm.length >= 2 && (
              <button
                onClick={handleSearch}
                className="w-full px-4 py-2 text-center text-green-600 hover:bg-gray-50 border-t"
              >
                View all results
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 