/**
 * Main Application Component
 * This is the root component that sets up the application structure and routing
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// Context Providers for global state management
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { CurrencyProvider } from './contexts/CurrencyContext'

// Page Components
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Products from './pages/Products'
import AccountPage from './pages/AccountPage'
import Orders from './pages/Orders'

// Admin Components
import AdminRoute from './components/auth/AdminRoute'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import ProductForm from './pages/admin/ProductForm'
import ProductList from './pages/admin/ProductList'
import OrderList from './pages/admin/OrderList'
import Analytics from './pages/admin/Analytics'

// Layout Components
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LandingPage } from './components/home/LandingPage'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'

// Feature Pages
import { OnSale } from './pages/OnSale'
import { NewArrivals } from './pages/NewArrivals'

// Info Pages
import AboutUs from './pages/info/AboutUs'
import ContactUs from './pages/info/ContactUs'
import FAQs from './pages/info/FAQs'
import ShippingPolicy from './pages/info/ShippingPolicy'
import ReturnPolicy from './pages/info/ReturnPolicy'
import TermsOfService from './pages/info/TermsOfService'

// Utilities and Helpers
import { useEffect } from 'react'
import { initDb } from './lib/dbInit'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { supabase } from './lib/supabase'

/**
 * AdminSetup Component
 * Handles the initialization of admin status when the application loads
 * This component doesn't render anything but performs admin verification
 */
function AdminSetup() {
  const { checkIsAdmin } = useAuth();
  
  useEffect(() => {
    const setupAdmin = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Setting up admin for user:', session.user.email);
          // Verify admin status
          await checkIsAdmin();
        }
      } catch (error) {
        console.error('Error setting up admin:', error);
      }
    };
    
    setupAdmin();
  }, [checkIsAdmin]);
  
  return null;
}

/**
 * Main App Component
 * Sets up the application structure including:
 * - Context Providers for global state management
 * - Routing configuration
 * - Layout structure
 * - Database initialization
 */
function App() {
  // Initialize database tables when the app starts
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await initDb();
        console.log('Database initialization completed');
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initializeDatabase();
  }, []);

  return (
    <HelmetProvider>
      {/* Authentication Provider - Manages user authentication state */}
      <AuthProvider>
        {/* Cart Provider - Manages shopping cart state */}
        <CartProvider>
          {/* Currency Provider - Manages currency conversion */}
          <CurrencyProvider>
            {/* Router - Handles application routing */}
            <Router>
              <div className="flex flex-col min-h-screen">
                {/* Navigation Bar */}
                <Navbar />
                {/* Admin Setup Component */}
                <AdminSetup />
                {/* Toast Notifications */}
                <Toaster position="top-center" />
                {/* Main Content Area */}
                <main className="flex-1 bg-gray-50">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/faq" element={<FAQs />} />
                    <Route path="/shipping" element={<ShippingPolicy />} />
                    <Route path="/returns" element={<ReturnPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/on-sale" element={<OnSale />} />
                    <Route path="/new-arrivals" element={<NewArrivals />} />
                    <Route path="/cart" element={<Cart />} />

                    {/* Protected Routes - Require Authentication */}
                    <Route
                      path="/account"
                      element={
                        <ProtectedRoute>
                          <AccountPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Routes - Require Admin Authentication */}
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
                    
                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                {/* Footer */}
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