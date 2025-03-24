import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { LandingPage } from './components/home/LandingPage'
import { OnSale } from './pages/OnSale'
import { NewArrivals } from './pages/NewArrivals'
import AboutUs from './pages/info/AboutUs'
import ContactUs from './pages/info/ContactUs'
import FAQs from './pages/info/FAQs'
import ShippingPolicy from './pages/info/ShippingPolicy'
import ReturnPolicy from './pages/info/ReturnPolicy'
import TermsOfService from './pages/info/TermsOfService'
import { useEffect } from 'react'
import { initDb, createAdminRole } from './lib/dbInit'
import AccountPage from './pages/AccountPage'
import Orders from './pages/Orders'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { CurrencyProvider } from './contexts/CurrencyContext'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import AdminRoute from './components/auth/AdminRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProductForm from './pages/admin/ProductForm'
import Products from './pages/Products'
import ProductList from './pages/admin/ProductList'
import OrderList from './pages/admin/OrderList'
import Analytics from './pages/admin/Analytics'
import { supabase } from './lib/supabase'
import Register from './pages/Register'

function App() {
  useEffect(() => {
    // Initialize database tables with comprehensive function
    initDb().catch((err: Error) => {
      console.error('Failed to initialize database:', err);
    });
    
    // Ensure admin user exists - force creation of admin role for known admin
    const setupAdmin = async () => {
      try {
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user) {
          const userId = sessionData.session.user.id;
          console.log('Current user ID:', userId);
          
          // If this is our known admin, ensure they have the role
          if (userId === '336187fc-3f85-4de9-9df4-f5d42e5c0b92') {
            await createAdminRole(userId);
            console.log('Admin role enforced for current user');
          }
        }
      } catch (error) {
        console.error('Error setting up admin:', error);
      }
    };
    
    setupAdmin();
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <CurrencyProvider>
            <Router>
              <div className="flex flex-col min-h-screen bg-gray-50">
                <Toaster position="top-center" />
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route 
                      path="/checkout" 
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/account" 
                      element={
                        <ProtectedRoute>
                          <AccountPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/on-sale" element={<OnSale />} />
                    <Route path="/new-arrivals" element={<NewArrivals />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/faq" element={<FAQs />} />
                    <Route path="/shipping" element={<ShippingPolicy />} />
                    <Route path="/returns" element={<ReturnPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route 
                      path="/admin" 
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="/admin/products" 
                      element={
                        <AdminRoute>
                          <ProductList />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="/admin/products/new" 
                      element={
                        <AdminRoute>
                          <ProductForm />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="/admin/products/:id" 
                      element={
                        <AdminRoute>
                          <ProductForm />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="/admin/orders" 
                      element={
                        <AdminRoute>
                          <OrderList />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="/admin/analytics" 
                      element={
                        <AdminRoute>
                          <Analytics />
                        </AdminRoute>
                      } 
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </CurrencyProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App 