import { getSaleProducts } from '../data/products'
import ProductCard from '../components/products/ProductCard'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

export const OnSale = () => {
  const saleProducts = getSaleProducts()
  const { addToCart } = useCart()
  const { user } = useAuth()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Special Offers
        </h1>
        <p className="text-lg text-gray-600">
          Don't miss out on these amazing deals!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {saleProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            imageUrl="https://placehold.co/400x300?text=GPU"
            description={product.description}
            badge={`${product.sale?.percentage}% OFF`}
            sale={product.sale ? {
              active: true,
              percentage: product.sale.percentage,
              oldPrice: product.sale.oldPrice
            } : undefined}
            addToCart={() => addToCart({
              ...product,
              badge: product.badge || null,
              sale: product.sale || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })}
            disabled={product.stock < 1}
          />
        ))}
      </div>

      {/* Empty State */}
      {saleProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No products are currently on sale. Check back later!
          </p>
        </div>
      )}
    </div>
  )
} 