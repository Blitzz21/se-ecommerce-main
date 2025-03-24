import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiMenu, HiX, HiShoppingCart, HiUser, HiChevronDown, HiViewGrid } from 'react-icons/hi'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { SearchBar } from '../search/SearchBar'
import { getAIProducts, getGamingProducts, getMiningProducts, getWorkstationProducts } from '../../data/products'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { cartItems } = useCart()
  const { user, signOut, isAdmin, isInitialized } = useAuth()
  
  // Debug logging
  useEffect(() => {
    console.log('Navbar - User:', user?.email)
    console.log('Navbar - isAdmin:', isAdmin)
    console.log('Navbar - isInitialized:', isInitialized)
  }, [user, isAdmin, isInitialized])
  
  const products = [
    ...getGamingProducts(),
    ...getWorkstationProducts(),
    ...getMiningProducts(),
    ...getAIProducts()
  ]

  // Always render the navbar, but show loading indicators for dynamic content
  return (
    <nav className="bg-black border-b text-gray-400 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Always visible */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl font-bold hover:text-white transition-colors">
              SPARTAN PARTS
            </h1>
          </Link>

          {/* Desktop Navigation - Always visible */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button
                onClick={() => setIsShopOpen(!isShopOpen)}
                className="flex items-center hover:cursor-pointer hover:text-green-500 transition-colors"
              >
                <span>Shop</span>
                <HiChevronDown className={`ml-1 h-5 w-5 transition-transform duration-200 ${isShopOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Shop dropdown - Always visible */}
              <div
                className={`absolute left-0 mt-2 w-48 text-gray-600 bg-white rounded-lg shadow-lg ring-1 ring-gray-200 transition-all duration-200 ease-in-out
                  ${isShopOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}
              >
                <div className="py-1" role="menu">
                  <Link
                    to="/products"
                    className="block px-4 py-2 hover:text-black transition-colors"
                    role="menuitem"
                  >
                    All Products
                  </Link>
                  <Link
                    to="/products?category=Gaming"
                    className="block px-4 py-2 hover:text-black transition-colors"
                    role="menuitem"
                  >
                    Gaming GPUs
                  </Link>
                  <Link
                    to="/products?category=Workstation"
                    className="block px-4 py-2 hover:text-black transition-colors"
                    role="menuitem"
                  >
                    Workstation GPUs
                  </Link>
                  <Link
                    to="/products?category=Mining"
                    className="block px-4 py-2 hover:text-black transition-colors"
                    role="menuitem"
                  >
                    Mining GPUs
                  </Link>
                  <Link
                    to="/products?category=AI"
                    className="block px-4 py-2 hover:text-black transition-colors"
                    role="menuitem"
                  >
                    AI GPUs
                  </Link>
                </div>
              </div>
            </div>

            <Link to="/on-sale" className="hover:text-white transition-colors">
              On Sale
            </Link>
            <Link to="/new-arrivals" className="hover:text-white transition-colors">
              New Arrivals
            </Link>
          </div>

          {/* User Menu - Shows loading state while initializing */}
          <div className="flex items-center space-x-4">
            {!isInitialized ? (
              // Loading state for user menu
              <div className="flex items-center space-x-4">
                <div className="animate-pulse bg-gray-700 h-6 w-6 rounded"></div>
                <div className="animate-pulse bg-gray-700 h-6 w-6 rounded"></div>
              </div>
            ) : (
              // Actual user menu
              <>
                <Link to="/cart" className="relative">
                  <HiShoppingCart className="h-6 w-6 hover:text-green-500 transition-colors" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Link>

                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 hover:text-green-500 transition-colors"
                    >
                      <HiUser className="h-6 w-6" />
                      <span className="hidden md:inline">{user.email}</span>
                      <HiChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-gray-200">
                        <div className="py-1">
                          <Link
                            to="/account"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Profile
                          </Link>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              signOut()
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 hover:text-green-500 transition-colors"
                  >
                    <HiUser className="h-6 w-6" />
                    <span className="hidden md:inline">Sign In</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 text-green-500 hover:text-green-400 transition-colors"
                  >
                    <HiViewGrid className="h-6 w-6" />
                    <span className="hidden md:inline">Admin Panel</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hover:text-white transition-colors"
            >
              {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {/* Mobile Search */}
          <div className="relative mb-3">
            <SearchBar products={products} />
          </div>
          
          <Link
            to="/products"
            className="block px-3 py-2 rounded-md hover:bg-green-900 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            All Products
          </Link>
          <Link
            to="/on-sale"
            className="block px-3 py-2 rounded-md hover:bg-green-900 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            On Sale
          </Link>
          <Link
            to="/new-arrivals"
            className="block px-3 py-2 rounded-md hover:bg-green-900 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            New Arrivals
          </Link>
          
          {user ? (
            <>
              <div className="mt-4 border-t pt-2 text-sm text-gray-400">Your Account</div>
              <Link
                to="/account"
                className="block px-3 py-2 rounded-md hover:bg-green-900 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Account Settings
              </Link>
              <Link
                to="/orders"
                className="block px-3 py-2 rounded-md hover:bg-green-900 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Orders
              </Link>
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md hover:bg-green-900 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-md bg-green-900 bg-opacity-20 text-green-500 font-semibold hover:bg-green-900 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  setIsOpen(false)
                  signOut()
                }}
                className="block w-full text-left px-3 py-2 rounded-md hover:bg-green-900 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="mt-4 border-t pt-2 text-sm text-gray-400">Account</div>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md hover:bg-green-900 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md hover:bg-green-900 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 

export default Navbar;