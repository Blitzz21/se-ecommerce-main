import { HiMinusSm, HiPlusSm, HiX } from 'react-icons/hi';
import { Product } from '../../data/products';
import { useCurrency } from '../../contexts/CurrencyContext';

interface CartItemProps {
  product: Product;
  quantity: number;
  selected?: boolean;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onToggleSelect?: (id: string, selected: boolean) => void;
}

export const CartItem = ({ 
  product, 
  quantity, 
  selected = true, 
  onUpdateQuantity, 
  onRemove, 
  onToggleSelect 
}: CartItemProps) => {
  const { format } = useCurrency();
  
  return (
    <div className="flex items-center py-4 border-b">
      {/* Selection Checkbox */}
      {onToggleSelect && (
        <div className="mr-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onToggleSelect(product.id, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
        </div>
      )}
      
      {/* Product Image */}
      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
        <img
          src={product.image || "https://placehold.co/100x100?text=GPU"}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Product Info */}
      <div className="ml-4 flex-1">
        <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.brand} {product.model}</p>
        
        <div className="mt-1 flex items-center">
          <span className="text-sm font-medium text-gray-900">
            {format(product.price)}
          </span>
          {product.sale?.active && (
            <span className="ml-2 text-xs text-gray-500 line-through">
              {format(product.sale.oldPrice)}
            </span>
          )}
        </div>
      </div>
      
      {/* Quantity Controls */}
      <div className="flex items-center">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => quantity > 1 && onUpdateQuantity(product.id, quantity - 1)}
            className={`p-1 ${quantity <= 1 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            disabled={quantity <= 1}
          >
            <HiMinusSm className="h-4 w-4" />
          </button>
          <span className="px-2 text-gray-900">{quantity}</span>
          <button
            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <HiPlusSm className="h-4 w-4" />
          </button>
        </div>
        
        <div className="ml-4 text-sm font-medium text-gray-900">
          {format(product.price * quantity)}
        </div>
        
        <button
          onClick={() => onRemove(product.id)}
          className="ml-4 text-gray-400 hover:text-gray-500"
        >
          <HiX className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}; 