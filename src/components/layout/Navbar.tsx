import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiMenu, HiX, HiShoppingCart, HiUser, HiChevronDown } from 'react-icons/hi'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { SearchBar } from '../search/SearchBar'
import { getAIProducts, getGamingProducts, getMiningProducts, getWorkstationProducts } from '../../data/products'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { cartItems } = useCart()
  const { user, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const products = [
    ...getGamingProducts(),
    ...getWorkstationProducts(),
    ...getMiningProducts(),
    ...getAIProducts()
  ]

  console.log('Navbar rendered - User:', user?.id, 'isAdmin:', isAdmin);

  return (
    <nav className="bg-black border-b text-gray-400 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl font-bold hover:text-white transition-colors">
              SPARTAN PARTS
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button
                onClick={() => setIsShopOpen(!isShopOpen)}
                className="flex items-center hover:cursor-pointer hover:text-green-500 transition-colors"
              >
                <span>Shop</span>
                <HiChevronDown className={`ml-1 h-5 w-5 transition-transform duration-200 ${isShopOpen ? 'rotate-180' : ''}`} />
              </button>
              
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

          {/* Search and Cart */}
          <div className="flex items-center gap-4">
            {/* Desktop Search */}
            <div className="hidden md:block w-96">
              <SearchBar products={products} />
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <HiShoppingCart className="h-6 w-6 text-gray-700" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="hover:text-green-500 transition-colors flex items-center"
                >
                  <HiUser className="h-6 w-6" />
                  <HiChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div
                  className={`absolute right-0 mt-2 w-48 text-gray-600 bg-white rounded-lg shadow-lg ring-1 ring-gray-200 transition-all duration-200 ease-in-out
                    ${isUserMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}
                >
                  <div className="py-1" role="menu">
                    <Link
                      to="/account"
                      className="block px-4 py-2 hover:text-black transition-colors"
                      role="menuitem"
                    >
                      Account
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 hover:text-black transition-colors"
                      role="menuitem"
                    >
                      Orders
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 hover:text-black transition-colors"
                      role="menuitem"
                    >
                      Dashboard
                    </Link>
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-green-600 font-medium hover:text-green-800 transition-colors"
                        role="menuitem"
                      >
                        Admin Panel
                      </Link>
                    ) : (
                      <div className="block px-4 py-2 text-gray-400 cursor-not-allowed">
                        Admin Panel (No Access)
                      </div>
                    )}
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 hover:text-black transition-colors"
                      role="menuitem"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="hover:text-green-500 transition-colors flex items-center"
                >
                  <HiUser className="h-6 w-6" />
                  <HiChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div
                  className={`absolute right-0 mt-2 w-48 text-gray-600 bg-white rounded-lg shadow-lg ring-1 ring-gray-200 transition-all duration-200 ease-in-out
                    ${isUserMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}
                >
                  <div className="py-1" role="menu">
                    <Link
                      to="/login"
                      className="block px-4 py-2 hover:text-black transition-colors"
                      role="menuitem"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 hover:text-black transition-colors"
                      role="menuitem"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              </div>
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
                  className="block px-3 py-2 rounded-md text-green-500 hover:bg-green-900 hover:text-white transition-colors"
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