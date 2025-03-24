export interface Product {
  id: string
  name: string
  brand: 'NVIDIA' | 'AMD' | 'Intel'
  model: string
  price: number
  category: 'Gaming' | 'Workstation' | 'Mining' | 'AI'
  image: string
  description: string
  specs: {
    memory: string
    memoryType: string
    coreClock: string
    boostClock: string
    tdp: string
  }
  stock: number
  rating: number
  reviews: number
  badge?: 'NEW' | 'SALE' | 'LIMITED' | 'BEST SELLER'
  sale?: {
    active: boolean
    percentage: number
    oldPrice: number
  }
}

export const products: Product[] = [
  // NVIDIA Gaming GPUs
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'NVIDIA GeForce RTX 4090',
    brand: 'NVIDIA',
    model: 'RTX 4090',
    price: 1599.99,
    category: 'Gaming',
    image: '/images/gpus/rtx-4090.png',
    description: 'The ultimate GeForce GPU. A huge leap in performance, efficiency, and AI-powered graphics.',
    specs: {
      memory: '24GB',
      memoryType: 'GDDR6X',
      coreClock: '2.23 GHz',
      boostClock: '2.52 GHz',
      tdp: '450W'
    },
    stock: 5,
    rating: 4.9,
    reviews: 128,
    badge: 'BEST SELLER'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'NVIDIA GeForce RTX 4080 SUPER',
    brand: 'NVIDIA',
    model: 'RTX 4080 SUPER',
    price: 999.99,
    category: 'Gaming',
    image: '/images/gpus/rtx-4080.png',
    description: 'Beyond fast for gamers and creators.',
    specs: {
      memory: '16GB',
      memoryType: 'GDDR6X',
      coreClock: '2.21 GHz',
      boostClock: '2.51 GHz',
      tdp: '320W'
    },
    stock: 12,
    rating: 4.8,
    reviews: 95,
    badge: 'NEW'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'NVIDIA GeForce RTX 4070 Ti SUPER',
    brand: 'NVIDIA',
    model: 'RTX 4070 Ti SUPER',
    price: 799.99,
    category: 'Gaming',
    image: '/images/gpus/rtx-4070-ti.png',
    description: 'The perfect balance of performance and efficiency.',
    specs: {
      memory: '16GB',
      memoryType: 'GDDR6X',
      coreClock: '2.34 GHz',
      boostClock: '2.61 GHz',
      tdp: '285W'
    },
    stock: 20,
    rating: 4.7,
    reviews: 83,
    badge: 'NEW'
  },

  // AMD Gaming GPUs
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'AMD Radeon RX 7900 XTX',
    brand: 'AMD',
    model: 'RX 7900 XTX',
    price: 949.99,
    category: 'Gaming',
    image: '/images/gpus/rx-7900-xtx.png',
    description: 'Ultimate 4K gaming performance with AMD RDNA 3 architecture.',
    specs: {
      memory: '24GB',
      memoryType: 'GDDR6',
      coreClock: '1.9 GHz',
      boostClock: '2.5 GHz',
      tdp: '355W'
    },
    stock: 8,
    rating: 4.7,
    reviews: 82,
    badge: 'BEST SELLER'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'AMD Radeon RX 7800 XT',
    brand: 'AMD',
    model: 'RX 7800 XT',
    price: 499.99,
    category: 'Gaming',
    image: '/images/gpus/rx-7800-xt.png',
    description: 'Exceptional 1440p gaming performance.',
    specs: {
      memory: '16GB',
      memoryType: 'GDDR6',
      coreClock: '1.7 GHz',
      boostClock: '2.4 GHz',
      tdp: '263W'
    },
    stock: 15,
    rating: 4.6,
    reviews: 64,
    badge: 'SALE',
    sale: {
      active: true,
      percentage: 20,
      oldPrice: 599.99
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'AMD Radeon RX 7600',
    brand: 'AMD',
    model: 'RX 7600',
    price: 269.99,
    category: 'Gaming',
    image: '/images/gpus/rx-7600.png',
    description: 'Smart choice for 1080p gaming.',
    specs: {
      memory: '8GB',
      memoryType: 'GDDR6',
      coreClock: '1.72 GHz',
      boostClock: '2.25 GHz',
      tdp: '165W'
    },
    stock: 30,
    rating: 4.5,
    reviews: 42,
    sale: {
      active: true,
      percentage: 15,
      oldPrice: 319.99
    }
  },

  // Workstation GPUs
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'NVIDIA RTX 6000 Ada Generation',
    brand: 'NVIDIA',
    model: 'RTX 6000',
    price: 6800.99,
    category: 'Workstation',
    image: '/images/gpus/rtx-6000.png',
    description: 'Ultimate professional visualization powerhouse.',
    specs: {
      memory: '48GB',
      memoryType: 'GDDR6',
      coreClock: '2.1 GHz',
      boostClock: '2.4 GHz',
      tdp: '300W'
    },
    stock: 3,
    rating: 4.9,
    reviews: 28,
    badge: 'BEST SELLER'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'NVIDIA RTX 5000 Ada Generation',
    brand: 'NVIDIA',
    model: 'RTX 5000',
    price: 4200.99,
    category: 'Workstation',
    image: '/images/gpus/rtx-5000.png',
    description: 'Professional visualization and rendering solution.',
    specs: {
      memory: '32GB',
      memoryType: 'GDDR6',
      coreClock: '2.0 GHz',
      boostClock: '2.3 GHz',
      tdp: '250W'
    },
    stock: 6,
    rating: 4.8,
    reviews: 19
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'AMD Radeon PRO W7900X',
    brand: 'AMD',
    model: 'W7900X',
    price: 3999.99,
    category: 'Workstation',
    image: '/images/gpus/w7900x.png',
    description: 'Professional graphics solution for demanding workflows.',
    specs: {
      memory: '32GB',
      memoryType: 'GDDR6',
      coreClock: '1.8 GHz',
      boostClock: '2.3 GHz',
      tdp: '295W'
    },
    stock: 4,
    rating: 4.7,
    reviews: 15
  },

  // Mining GPUs
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'NVIDIA CMP 170HX',
    brand: 'NVIDIA',
    model: 'CMP 170HX',
    price: 2299.99,
    category: 'Mining',
    image: '/images/gpus/cmp-170hx.png',
    description: 'Dedicated cryptocurrency mining processor.',
    specs: {
      memory: '8GB',
      memoryType: 'HBM2e',
      coreClock: '1.4 GHz',
      boostClock: '1.6 GHz',
      tdp: '250W'
    },
    stock: 20,
    rating: 4.5,
    reviews: 45,
    badge: 'BEST SELLER'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'NVIDIA CMP 50HX',
    brand: 'NVIDIA',
    model: 'CMP 50HX',
    price: 999.99,
    category: 'Mining',
    image: '/images/gpus/cmp-50hx.png',
    description: 'Efficient mining solution for smaller operations.',
    specs: {
      memory: '4GB',
      memoryType: 'GDDR6',
      coreClock: '1.3 GHz',
      boostClock: '1.5 GHz',
      tdp: '180W'
    },
    stock: 15,
    rating: 4.3,
    reviews: 28,
    sale: {
      active: true,
      percentage: 25,
      oldPrice: 1299.99
    }
  },

  // AI and Machine Learning
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'NVIDIA A100 80GB',
    brand: 'NVIDIA',
    model: 'A100 80GB',
    price: 10999.99,
    category: 'AI',
    image: '/images/gpus/a100.png',
    description: 'Ultimate performance for AI training and inference.',
    specs: {
      memory: '80GB',
      memoryType: 'HBM2e',
      coreClock: '1.41 GHz',
      boostClock: '1.59 GHz',
      tdp: '400W'
    },
    stock: 2,
    rating: 5.0,
    reviews: 15,
    badge: 'BEST SELLER'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    name: 'NVIDIA H100 PCIe',
    brand: 'NVIDIA',
    model: 'H100 PCIe',
    price: 16999.99,
    category: 'AI',
    image: '/images/gpus/h100.png',
    description: 'Next-generation AI compute platform.',
    specs: {
      memory: '80GB',
      memoryType: 'HBM3',
      coreClock: '1.5 GHz',
      boostClock: '1.7 GHz',
      tdp: '350W'
    },
    stock: 1,
    rating: 5.0,
    reviews: 8,
    badge: 'NEW'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    name: 'AMD Instinct MI250X',
    brand: 'AMD',
    model: 'MI250X',
    price: 12499.99,
    category: 'AI',
    image: '/images/gpus/mi250x.png',
    description: 'High-performance compute accelerator for AI and HPC.',
    specs: {
      memory: '128GB',
      memoryType: 'HBM2e',
      coreClock: '1.7 GHz',
      boostClock: '1.9 GHz',
      tdp: '500W'
    },
    stock: 3,
    rating: 4.8,
    reviews: 12
  },

  // Intel Gaming GPUs
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    name: 'Intel Arc A770',
    brand: 'Intel',
    model: 'Arc A770',
    price: 349.99,
    category: 'Gaming',
    image: '/images/gpus/arc-a770.png',
    description: 'Intel\'s flagship gaming GPU with ray tracing support.',
    specs: {
      memory: '16GB',
      memoryType: 'GDDR6',
      coreClock: '2.1 GHz',
      boostClock: '2.4 GHz',
      tdp: '225W'
    },
    stock: 25,
    rating: 4.3,
    reviews: 37,
    badge: 'NEW'
  },

  // New products to add
  {
    id: '550e8400-e29b-41d4-a716-446655440101',
    name: 'NVIDIA RTX 4080 Super',
    brand: 'NVIDIA',
    model: 'RTX 4080 Super',
    price: 999.99,
    category: 'Gaming',
    image: '/images/gpus/rtx-4080-super.png',
    description: 'The newest addition to the RTX 40 series, featuring enhanced ray tracing and DLSS 3.5 technology.',
    specs: {
      memory: '16GB',
      memoryType: 'GDDR6X',
      coreClock: '2.21 GHz',
      boostClock: '2.51 GHz',
      tdp: '320W'
    },
    stock: 12,
    rating: 4.8,
    reviews: 42,
    badge: 'NEW'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440102',
    name: 'AMD Radeon RX 7900 XTX OC',
    brand: 'AMD',
    model: 'RX 7900 XTX OC',
    price: 1199.99,
    category: 'Gaming',
    image: '/images/gpus/rx-7900-xtx.png',
    description: 'Factory overclocked RX 7900 XTX with advanced cooling for extreme gaming performance and content creation.',
    specs: {
      memory: '24GB',
      memoryType: 'GDDR6',
      coreClock: '2.3 GHz',
      boostClock: '2.6 GHz',
      tdp: '355W'
    },
    stock: 8,
    rating: 4.7,
    reviews: 35,
    badge: 'NEW'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440103',
    name: 'NVIDIA RTX 6000 Ada Generation',
    brand: 'NVIDIA',
    model: 'RTX 6000 Ada',
    price: 6799.99,
    category: 'Workstation',
    image: '/images/gpus/rtx-6000-ada.png',
    description: 'Professional visualization workstation GPU with unprecedented performance for AI-enhanced workflows.',
    specs: {
      memory: '48GB',
      memoryType: 'GDDR6 ECC',
      coreClock: '2.1 GHz',
      boostClock: '2.5 GHz',
      tdp: '300W'
    },
    stock: 3,
    rating: 4.9,
    reviews: 12,
    badge: 'NEW'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440104',
    name: 'AMD Radeon PRO W7900',
    brand: 'AMD',
    model: 'Radeon PRO W7900',
    price: 3999.99,
    category: 'Workstation',
    image: '/images/gpus/radeon-pro-w7900.png',
    description: 'Professional graphics card for demanding visualization workloads with industry-leading memory capacity.',
    specs: {
      memory: '32GB',
      memoryType: 'GDDR6 ECC',
      coreClock: '1.9 GHz',
      boostClock: '2.3 GHz',
      tdp: '295W'
    },
    stock: 6,
    rating: 4.6,
    reviews: 18,
    badge: 'NEW'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440105',
    name: 'Intel Arc A770 Limited Edition',
    brand: 'Intel',
    model: 'Arc A770 LE',
    price: 349.99,
    category: 'Gaming',
    image: '/images/gpus/intel-arc-a770.png',
    description: 'Intel\'s flagship gaming GPU with XeSS upscaling technology and ray tracing capabilities.',
    specs: {
      memory: '16GB',
      memoryType: 'GDDR6',
      coreClock: '2.1 GHz',
      boostClock: '2.4 GHz',
      tdp: '225W'
    },
    stock: 15,
    rating: 4.2,
    reviews: 47,
    badge: 'NEW'
  }
];

// Helper function to get products by category
export const getProductsByCategory = (category: Product['category']) => {
  return products.filter(product => product.category === category)
}

// Helper function to get products by brand
export const getProductsByBrand = (brand: Product['brand']) => {
  return products.filter(product => product.brand === brand)
}

// Helper function to get featured products (best sellers or new arrivals)
export const getFeaturedProducts = () => {
  return products.filter(product => product.badge === 'BEST SELLER' || product.badge === 'NEW')
}

// Add helper function to get sale products
export const getSaleProducts = () => {
  return products.filter(product => product.sale?.active)
}

// Add this helper function
export const getTopSellingProducts = () => {
  return products.filter(product => product.reviews > 100).sort((a, b) => b.rating - a.rating).slice(0, 8)
}

// Add these helper functions
export const getGamingProducts = () => {
  return getProductsByCategory('Gaming')
}

export const getWorkstationProducts = () => {
  return getProductsByCategory('Workstation')
}

export const getMiningProducts = () => {
  return getProductsByCategory('Mining')
}

export const getAIProducts = () => {
  return getProductsByCategory('AI')
} 