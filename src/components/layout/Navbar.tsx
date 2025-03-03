import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiMenu, HiX, HiShoppingCart, HiUser, HiSearch, HiChevronDown } from 'react-icons/hi'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isShopOpen, setIsShopOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">
              SPARTAN PARTS
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button
                onClick={() => setIsShopOpen(!isShopOpen)}
                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span>Shop</span>
                <HiChevronDown className={`ml-1 h-5 w-5 transition-transform duration-200 ${isShopOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div
                className={`absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-gray-200 transition-all duration-200 ease-in-out
                  ${isShopOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}
              >
                <div className="py-1" role="menu">
                  <Link
                    to="/products"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    role="menuitem"
                  >
                    All Products
                  </Link>
                  <Link
                    to="/products?category=Gaming"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    role="menuitem"
                  >
                    Gaming GPUs
                  </Link>
                  <Link
                    to="/products?category=Workstation"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    role="menuitem"
                  >
                    Workstation GPUs
                  </Link>
                  <Link
                    to="/products?category=Mining"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    role="menuitem"
                  >
                    Mining GPUs
                  </Link>
                  <Link
                    to="/products?category=AI"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    role="menuitem"
                  >
                    AI GPUs
                  </Link>
                </div>
              </div>
            </div>

            <Link to="/on-sale" className="text-gray-700 hover:text-blue-600 transition-colors">
              On Sale
            </Link>
            <Link to="/new-arrivals" className="text-gray-700 hover:text-blue-600 transition-colors">
              New Arrivals
            </Link>
          </div>

          {/* Search and Cart */}
          <div className="flex items-center space-x-6">
            <div className="hidden relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-64 pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            
            <Link to="/cart" className="text-gray-700 hover:text-blue-600 transition-colors relative">
              <HiShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium">
                0
              </span>
            </Link>
            
            <Link to="/account" className="text-gray-700 hover:text-blue-600 transition-colors">
              <HiUser className="h-6 w-6" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Search */}
            <div className="p-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
            
            {/* Mobile Navigation Links */}
            <Link
              to="/products"
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              All Products
            </Link>
            <Link
              to="/on-sale"
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              On Sale
            </Link>
            <Link
              to="/new-arrivals"
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
} 