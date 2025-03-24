import { Link, useNavigate } from 'react-router-dom'
import { HiArrowRight, HiShoppingCart } from 'react-icons/hi'
import { Product, getTopSellingProducts, getFeaturedProducts, getSaleProducts } from '../../data/products'
import { useState, useEffect, useRef } from 'react'
import { useCart } from '../../contexts/CartContext'
import { nvidiaLogo, amdLogo, msiLogo, intelLogo, asusLogo, rogLogo, gigabyteLogo } from '../../assets/brandLogos/index'
import { hero1, hero2, hero3 } from '../../assets/heroSlides/index'
import { ai, gaming, mining, workstation } from '../../assets/workloads/index'
import { motion, useInView } from 'framer-motion'
import { useCurrency } from '../../contexts/CurrencyContext'

const workloads = [
  {
    name: 'Gaming',
    href: '/products?category=Gaming',
    image: gaming,
    description: 'High-performance GPUs for ultimate gaming experience'
  },
  {
    name: 'Workstation',
    href: '/products?category=Workstation',
    image: workstation,
    description: 'Professional graphics cards for demanding workflows'
  },
  {
    name: 'Mining',
    href: '/products?category=Mining',
    image: mining,
    description: 'Specialized GPUs for cryptocurrency mining'
  },
  {
    name: 'AI',
    href: '/products?category=AI',
    image: ai,
    description: 'Advanced processors for AI and machine learning'
  }
] as const

const heroSlides = [
  {
    image: hero1,
    alt: 'Gaming GPU Setup'
  },
  {
    image: hero2,
    alt: 'Workstation Setup'
  },
  {
    image: hero3,
    alt: 'Mining Rig'
  }
] as const

const brandLogos = [
  { src: nvidiaLogo, alt: 'Nvidia' },
  { src: amdLogo, alt: 'AMD' },
  { src: msiLogo, alt: 'MSI' },
  { src: intelLogo, alt: 'Intel' },
  { src: asusLogo, alt: 'ASUS' },
  { src: rogLogo, alt: 'ROG' },
  { src: gigabyteLogo, alt: 'Gigabyte' }
] as const

export const LandingPage = () => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const topSellers = getTopSellingProducts()
  const newArrivalsProducts = getFeaturedProducts().filter(product => product.badge === 'NEW')
  const onSaleProducts = getSaleProducts()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const featuresRef = useRef<HTMLDivElement>(null)
  const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.1 })
  const { format } = useCurrency()

  // Handle automatic slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(timer)
  }, [])

  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ 
        x: e.clientX / window.innerWidth, 
        y: e.clientY / window.innerHeight 
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleWorkloadClick = (category: Product['category']) => {
    navigate(`/products?category=${category}`)
  }

  // Scroll to features section
  const scrollToFeatures = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const ProductSection = ({ title, products, link }: { 
    title: string, 
    products: Product[], 
    link: string 
  }) => {
    const handleAddToCart = async (product: Product) => {
      try {
        await addToCart({
          ...product,
          badge: product.badge,
          sale: product.sale
        });
      } catch (error: any) {
        if (error.message === 'AUTH_REQUIRED') {
          // Redirect to login page with return path
          navigate('/login', { 
            state: { from: window.location.pathname }
          });
        }
      }
    };

    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <Link to={link} className="text-green-600 hover:text-green-800">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <Link 
                  to={`/products/${product.id}`}
                  className="block h-full"
                >
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-lg shadow-md h-full flex flex-col transition-all duration-300 hover:shadow-xl group"
                  >
                    <div className="relative">
                      {product.badge && (
                        <span className="absolute top-2 left-2 z-10 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {product.badge}
                        </span>
                      )}
                      {product.sale?.active && (
                        <span className="absolute top-2 right-2 z-10 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {product.sale.percentage}% OFF
                        </span>
                      )}
                      <img
                        src={product.image || "https://placehold.co/300x200?text=GPU"}
                        alt={product.name}
                        className="w-full h-48 object-contain p-4"
                      />
                    </div>
                    
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">
                        {product.description}
                      </p>
                      
                      {/* Price and Stock */}
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex flex-col">
                            {product.sale?.active ? (
                              <>
                                <span className="text-xl font-bold">{format(product.price)}</span>
                                <span className="text-sm text-gray-500 line-through">
                                  {format(product.sale.oldPrice)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xl font-bold">{format(product.price)}</span>
                            )}
                          </div>
                          <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? `In Stock` : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
                
                {product.stock > 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg transform transition-transform hover:scale-110 z-10"
                    aria-label="Add to cart"
                  >
                    <HiShoppingCart className="w-6 h-6" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section with dynamic effects */}
      <section className="relative h-[90dvh] bg-gray-100 overflow-hidden">
        {/* Dynamic Background Gradients */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-green-900 opacity-40"
          style={{ 
            backgroundPosition: `${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%`,
            transition: 'background-position 0.5s ease-out'
          }}
        />
        
        {/* Radial glow effects */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 opacity-10 rounded-full blur-3xl"
          style={{ 
            transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)` 
          }}
        />
        
        {/* Slideshow with enhanced transition */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.image}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentSlide 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-green-500 w-6' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="flex flex-col md:w-2/3">
            <div className="inline-block px-3 py-1 bg-green-500 bg-opacity-20 backdrop-blur-sm rounded-full mb-4 w-fit">
              <span className="text-green-500 font-medium text-sm">Premium Performance</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
              YOUR PERFECT<br />
              GPU MATCH IS<br />
              <span className="text-green-500">JUST A CLICK AWAY</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl">
              Unleash next-level performance with our premium GPU collection.
              From gaming powerhouse to professional workstation cards,
              each engineered for uncompromising speed and visual excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative group w-fit">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-green-600 rounded opacity-75 group-hover:opacity-100 blur-sm group-hover:blur-md transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
                <Link
                  to="/products"
                  className={`
                    relative flex items-center px-6 py-3 bg-green-500 text-black font-bold rounded-md
                    transform transition-all duration-300 ${isHovered ? 'scale-105' : ''}
                    hover:bg-green-400 shadow-lg hover:shadow-green-500/50
                  `}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <span>Shop Now</span>
                  <HiArrowRight className={`ml-2 h-5 w-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                </Link>
              </div>
              <button 
                className="flex items-center justify-center border border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-medium py-3 px-6 rounded-md transition-colors duration-300"
                onClick={scrollToFeatures}
              >
                <span>Explore Features</span>
                <HiArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Brand Logos with improved styling */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden bg-black/80 backdrop-blur-sm">
          <div 
            className="flex whitespace-nowrap py-6 animate-marquee"
          >
            {[...Array(4)].map((_, i) => (
              <div key={`logo-group-${i}`} className="flex shrink-0">
                {brandLogos.map((logo, index) => (
                  <div 
                    key={`${i}-${index}`}
                    className="mx-12 opacity-70 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div 
        ref={featuresRef}
        className="relative flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900 py-8 md:py-12 lg:py-16 min-h-screen transition-opacity duration-700 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: -50 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600"
            >
              Why Choose Our GPUs?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={isFeaturesInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gray-300 max-w-3xl mx-auto text-base md:text-lg leading-relaxed px-4 sm:px-0"
            >
              Unleash the pinnacle of computational power with cutting-edge GPU technology designed for professionals and gaming enthusiasts.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[
              {
                icon: (
                  <svg className="text-green-400 h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Extreme Performance",
                description: "Breakthrough frame rates and ray tracing that redefine visual computing and gaming experiences."
              },
              {
                icon: (
                  <svg className="text-green-400 h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                ),
                title: "Advanced Architecture",
                description: "AI-powered acceleration and next-gen processes for unparalleled computational efficiency."
              },
              {
                icon: (
                  <svg className="text-green-400 h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Quality Guarantee",
                description: "Comprehensive 3-year warranty with premium 24/7 support, ensuring your investment is protected."
              },
              {
                icon: (
                  <svg className="text-green-400 h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Competitive Pricing",
                description: "Premium performance meets affordability with flexible financing and unbeatable value."
              }
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isFeaturesInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.5, 
                  delay: isFeaturesInView ? index * 0.1 + 0.2 : 0,
                  type: "spring",
                  stiffness: 100
                }}
                className="bg-gray-800 bg-opacity-30 rounded-xl md:rounded-2xl p-4 md:p-6 border border-green-500/20 backdrop-blur-sm 
                          transform transition-all duration-300 
                          hover:bg-opacity-50 hover:scale-[1.02] md:hover:scale-[1.03] 
                          hover:shadow-lg md:hover:shadow-2xl hover:shadow-green-500/20 md:hover:shadow-green-500/30 
                          group cursor-default"
              >
                <div className="mb-4 md:mb-6 flex items-center justify-between">
                  <div className="bg-gradient-to-br from-green-400/20 to-green-500/20 p-2 md:p-3 rounded-lg md:rounded-xl w-12 h-12 md:w-16 md:h-16 
                                  flex items-center justify-center 
                                  transition-transform duration-300 
                                  group-hover:rotate-12">
                    {feature.icon}
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <svg className="h-5 w-5 md:h-6 md:w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 12l.01.01M12 5l.01.01M7 16l-2-2m0 0l-2-2m2 2H3m2 2v3a2 2 0 002 2h12a2 2 0 002-2v-3m-4-4l-2 2m0 0l-2-2m2 2V7" />
                    </svg>
                  </motion.div>
                </div>
                <h3 className="text-xl sm:text-xl md:text-2xl font-bold mb-2 md:mb-4 text-white transition-colors duration-300 group-hover:text-green-400">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* GPU Marketplace Section with enhanced design */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 relative inline-block">
              GPU MARKETPLACE
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-green-500"></div>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-4">
              Find the perfect graphics card for your needs, from gaming to professional workstations
            </p>
          </div>
          
          {/* Top Sellers Section */}
          <ProductSection 
            title="TOP SELLERS" 
            products={topSellers} 
            link="/products?sort=best-selling" 
          />

          {/* New Arrivals */}
          <ProductSection 
            title="NEW ARRIVALS" 
            products={newArrivalsProducts} 
            link="/new-arrivals" 
          />

          {/* On Sale */}
          <ProductSection 
            title="ON SALE" 
            products={onSaleProducts} 
            link="/on-sale" 
          />

          {/* Browse by Workload with enhanced visuals */}
          <div className="mt-24 mb-16">
            <div className="relative mb-12">
              <h3 className="text-2xl font-bold mb-2 text-gray-900">BROWSE BY WORKLOAD</h3>
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-green-500"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {workloads.map((workload) => (
                <button
                  key={workload.name}
                  onClick={() => handleWorkloadClick(workload.name as Product['category'])}
                  className="relative group overflow-hidden rounded-lg aspect-square focus:outline-none"
                >
                  <img
                    src={workload.image}
                    alt={workload.name}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Enhanced overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-6 transform transition-transform duration-300 group-hover:translate-y-0">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{workload.name}</h3>
                    <p className="text-gray-300 text-sm mb-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">{workload.description}</p>
                    <div className="flex items-center text-green-500 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="text-sm font-bold">Explore</span>
                      <HiArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Added CSS animations */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 20s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}