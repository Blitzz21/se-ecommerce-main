import { Link } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'

export const Footer = () => {
  return (
    <footer className="bg-black text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h2 className="text-white text-xl font-bold mb-4">SPARTAN PARTS</h2>
            <p className="mb-4">
              Your trusted source for premium GPU solutions and gaming hardware.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="mr-2">📞</span>
                <span>1-800-SPARTAN</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">✉️</span>
                <a href="mailto:support@spartanparts.com" className="hover:text-white transition-colors">
                  support@spartanparts.com
                </a>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📍</span>
                <span>123 Tech Street, Silicon Valley, CA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">QUICK LINKS</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">FAQs</Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white transition-colors">Return Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">CATEGORIES</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=Gaming" className="hover:text-white transition-colors">
                  Gaming GPUs
                </Link>
              </li>
              <li>
                <Link to="/products?category=Workstation" className="hover:text-white transition-colors">
                  Workstation Cards
                </Link>
              </li>
              <li>
                <Link to="/products?category=Mining" className="hover:text-white transition-colors">
                  Mining Solutions
                </Link>
              </li>
              <li>
                <Link to="/products?category=AI" className="hover:text-white transition-colors">
                  AI Accelerators
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">NEWSLETTER</h3>
            <p className="mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-white text-black font-semibold rounded hover:bg-gray-200 transition-colors"
              >
                SUBSCRIBE
              </button>
            </form>
            <div className="mt-6">
              <h4 className="text-white text-sm font-semibold mb-2">FOLLOW US</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaFacebookF className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaTwitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaInstagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaYoutube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p>© 2025 Spartan Parts. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 