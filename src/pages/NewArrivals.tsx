import { getFeaturedProducts } from '../data/products'
import ProductCard from '../components/products/ProductCard'
import { useCart } from '../contexts/CartContext'

export const NewArrivals = () => {
  const newProducts = getFeaturedProducts().filter(product => product.badge === 'NEW')
  const { addToCart } = useCart()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          New Arrivals
        </h1>
        <p className="text-lg text-gray-600">
          Check out our latest GPU additions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {newProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            imageUrl="https://placehold.co/400x300?text=GPU"
            description={product.description}
            badge="NEW"
            addToCart={addToCart}
          />
        ))}
      </div>

      {/* Empty State */}
      {newProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No new products available at the moment. Check back soon!
          </p>
        </div>
      )}
    </div>
  )
}

export default NewArrivals