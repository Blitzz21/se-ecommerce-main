import { Link, useNavigate } from 'react-router-dom'
import { HiArrowRight } from 'react-icons/hi'
import { Product, getTopSellingProducts, getGamingProducts, getWorkstationProducts, getMiningProducts, getAIProducts } from '../../data/products'
import { useState, useEffect } from 'react'
import { useCart } from '../../contexts/CartContext'

import { nvidiaLogo, amdLogo, msiLogo, intelLogo, asusLogo, rogLogo, gigabyteLogo } from '../../assets/brandLogos/index'
import { hero1, hero2, hero3 } from '../../assets/heroSlides/index'
import { ai, gaming, mining, workstation } from '../../assets/workloads/index'

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
  const gamingProducts = getGamingProducts()
  const workstationProducts = getWorkstationProducts()
  const miningProducts = getMiningProducts()
  const aiProducts = getAIProducts()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(timer)
  }, [])

  const handleWorkloadClick = (category: Product['category']) => {
    navigate(`/products?category=${category}`)
  }

  const ProductSection = ({ title, products, link }: { 
    title: string, 
    products: Product[], 
    link: string 
  }) => (
    <div className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <Link to={link} className="text-blue-600 hover:text-blue-700">
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]">
            <img
              src="https://placehold.co/400x300?text=GPU"
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <div className="flex flex-col flex-grow">
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4 flex-grow">{product.description}</p>
              <div className="mt-auto">
                <p className="text-xl font-bold mb-2">${product.price}</p>
                <button
                  onClick={() => addToCart({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category_id: product.category,
                    image_url: 'https://placehold.co/400x300?text=GPU',
                    stock: 1,
                    created_at: new Date().toISOString()
                  })}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gray-100 overflow-hidden">
        {/* Slideshow */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.image}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="md:w-2/3">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              YOUR PERFECT<br />
              GPU MATCH IS<br />
              JUST A CLICK AWAY
            </h1>
            <p className="text-lg text-gray-200 mb-8">
              Unleash next-level performance with our premium GPU collection.<br />
              From gaming powerhouse to professional workstation cards,<br />
              each engineered for uncompromising speed and visual excellence.
            </p>
            <div className="relative group w-fit">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-blue-600 to-green-600 rounded opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
              <Link
                to="/products"
                className="relative inline-flex items-center px-6 py-3 bg-green-500 text-white font-medium rounded hover:bg-black hover:text-white duration-400 transition-colors"
              >
                Shop Now
                <HiArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Brand Logos */}
        <>
          <style>
            {`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }

              @keyframes gradient-xy {
                0% {
                  background-position: 0% 50%;
                }
                50% {
                  background-position: 100% 50%;
                }
                100% {
                  background-position: 0% 50%;
                }
              }

              .animate-gradient-xy {
                background-size: 400% 400%;
                animation: gradient-xy 1.5s ease infinite;
              }
            `}
          </style>
          <div className="relative w-full overflow-hidden bg-black">
            <div 
              className="flex whitespace-nowrap py-8"
              style={{
                animation: 'marquee 25s linear infinite'
              }}
            >
              {[...Array(2)].map((_, i) => (
                <div key={`logo-group-${i}`} className="flex shrink-0">
                  {brandLogos.map((logo, index) => (
                    <img
                      key={`${i}-${index}`}
                      src={logo.src}
                      alt={logo.alt}
                      className="h-16 w-auto object-contain mx-16"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      </section>

      {/* GPU Marketplace Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            GPU MARKETPLACE
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Find the perfect graphics card for your needs, from gaming to professional workstations
          </p>
          
          {/* Top Sellers Section */}
          <ProductSection 
            title="TOP SELLERS" 
            products={topSellers} 
            link="/products?sort=best-selling" 
          />

          {/* Gaming GPUs */}
          <ProductSection 
            title="GAMING GPUs" 
            products={gamingProducts} 
            link="/products?category=Gaming" 
          />

          {/* Workstation Cards */}
          <ProductSection 
            title="WORKSTATION CARDS" 
            products={workstationProducts} 
            link="/products?category=Workstation" 
          />

          {/* Mining Solutions */}
          <ProductSection 
            title="MINING SOLUTIONS" 
            products={miningProducts} 
            link="/products?category=Mining" 
          />

          {/* AI Accelerators */}
          <ProductSection 
            title="AI ACCELERATORS" 
            products={aiProducts} 
            link="/products?category=AI" 
          />

          {/* Browse by Workload */}
          <div>
            <h3 className="text-2xl font-bold mb-8 text-gray-900">BROWSE BY WORKLOAD</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {workloads.map((workload) => (
                <button
                  key={workload.name}
                  onClick={() => handleWorkloadClick(workload.name as Product['category'])}
                  className="relative group overflow-hidden rounded-lg aspect-square focus:outline-none"
                >
                  <img
                    src={workload.image}
                    alt={workload.name}
                    className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{workload.name}</h3>
                    <p className="text-gray-200 text-sm">{workload.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 