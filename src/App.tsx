import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Layout from './components/layout/Layout'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { LandingPage } from './components/home/LandingPage'
import ProductGrid from './components/products/ProductGrid'
import { products } from './data/products'
import { OnSale } from './pages/OnSale'
import { NewArrivals } from './pages/NewArrivals'
import AboutUs from './pages/info/AboutUs'
import ContactUs from './pages/info/ContactUs'
import FAQs from './pages/info/FAQs'
import ShippingPolicy from './pages/info/ShippingPolicy'
import ReturnPolicy from './pages/info/ReturnPolicy'
import TermsOfService from './pages/info/TermsOfService'

function App() {
  return (
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<LandingPage />} />
                <Route path="products" element={<ProductGrid products={products} viewMode="grid" />} />
                <Route path="products/:id" element={<ProductDetails />} />
                <Route path="on-sale" element={<OnSale />} />
                <Route path="new-arrivals" element={<NewArrivals />} />
                <Route path="login" element={<Login />} />
                <Route path="cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                {/* Info Pages */}
                <Route path="about" element={<AboutUs />} />
                <Route path="contact" element={<ContactUs />} />
                <Route path="faq" element={<FAQs />} />
                <Route path="shipping" element={<ShippingPolicy />} />
                <Route path="returns" element={<ReturnPolicy />} />
                <Route path="terms" element={<TermsOfService />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
  )
}

export default App 