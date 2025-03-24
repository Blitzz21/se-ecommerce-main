import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiRefresh, HiOutlineChevronLeft, HiOutlineChevronRight, HiPhotograph, HiDatabase } from 'react-icons/hi';
import { Product } from '../../data/products';
import { GpuImage } from '../../utils/ImageHelper';

// Product image mapping with proper type
const productImageMap: Record<string, string> = {
  // NVIDIA
  'NVIDIA GeForce RTX 4090': '../assets/gpu/rtx-4090.png',
  'RTX 4090': '../assets/gpu/rtx-4090.png',
  'NVIDIA GeForce RTX 4080 SUPER': '../assets/gpu/rtx-4080-super.png',
  'RTX 4080 SUPER': '../assets/gpu/rtx-4080-super.png',
  'NVIDIA GeForce RTX 4080': '../assets/gpu/rtx-4080.png',
  'RTX 4080': '../assets/gpu/rtx-4080.png',
  'NVIDIA GeForce RTX 4070 Ti SUPER': '../assets/gpu/rtx-4070-ti.png',
  'RTX 4070 Ti SUPER': '../assets/gpu/rtx-4070-ti.png',
  'NVIDIA RTX 6000 Ada Generation': '../assets/gpu/rtx-6000-ada.png',
  'RTX 6000 Ada': '../assets/gpu/rtx-6000-ada.png',
  'NVIDIA RTX 6000': '../assets/gpu/rtx-6000.png',
  'RTX 6000': '../assets/gpu/rtx-6000.png',
  'NVIDIA RTX 5000 Ada Generation': '../assets/gpu/rtx-5000.png',
  'RTX 5000': '../assets/gpu/rtx-5000.png',
  'NVIDIA A100': '../assets/gpu/a100.png',
  'A100': '../assets/gpu/a100.png',
  'NVIDIA H100': '../assets/gpu/h100.png',
  'H100': '../assets/gpu/h100.png',
  'NVIDIA CMP 170HX': '../assets/gpu/cmp-170hx.png',
  'CMP 170HX': '../assets/gpu/cmp-170hx.png',
  'NVIDIA CMP 50HX': '../assets/gpu/cmp-50hx.png',
  'CMP 50HX': '../assets/gpu/cmp-50hx.png',
  
  // AMD
  'AMD Radeon RX 7900 XTX': '../assets/gpu/rx-7900-xtx.png',
  'RX 7900 XTX': '../assets/gpu/rx-7900-xtx.png',
  'AMD Radeon RX 7800 XT': '../assets/gpu/rx-7800-xt.png',
  'RX 7800 XT': '../assets/gpu/rx-7800-xt.png',
  'AMD Radeon RX 7600': '../assets/gpu/rx-7600.png',
  'RX 7600': '../assets/gpu/rx-7600.png',
  'AMD Radeon PRO W7900': '../assets/gpu/radeon-pro-w7900.png',
  'Radeon PRO W7900': '../assets/gpu/radeon-pro-w7900.png',
  'AMD Radeon PRO W7900X': '../assets/gpu/w7900x.png',
  'W7900X': '../assets/gpu/w7900x.png',
  'AMD Instinct MI250X': '../assets/gpu/mi250x.png',
  'MI250X': '../assets/gpu/mi250x.png',
  
  // Intel
  'Intel Arc A770': '../assets/gpu/arc-a770.png',
  'Arc A770': '../assets/gpu/arc-a770.png',
  'Intel Arc A770 Limited Edition': '../assets/gpu/intel-arc-a770.png',
  'Arc A770 LE': '../assets/gpu/intel-arc-a770.png',
};

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [updatingImages, setUpdatingImages] = useState(false);
  const [updatingDatabaseImages, setUpdatingDatabaseImages] = useState(false);
  const productsPerPage = 10;

  // Fetch products with pagination
  const fetchProducts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      
      // Build query
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });
      
      // Add search if provided
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      // Add pagination
      const from = (page - 1) * productsPerPage;
      const to = from + productsPerPage - 1;
      
      const { data, error, count } = await query
        .order('name')
        .range(from, to);
      
      if (error) throw error;
      
      setProducts(data || []);
      setTotalProducts(count || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when search/page changes
  useEffect(() => {
    fetchProducts(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchProducts(1, searchTerm);
  };

  // Handle product deletion
  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this product? This action cannot be undone.');
    
    if (confirmed) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        
        if (error) throw error;
        
        // Remove from local state
        setProducts(products.filter(p => p.id !== productId));
        toast.success('Product deleted successfully');
        
        // Refresh list if we deleted the last item on a page
        if (products.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // Update all product images
  const updateAllProductImages = async () => {
    const confirmed = window.confirm('This will update all product images to use the local GPU assets. Continue?');
    
    if (!confirmed) return;
    
    try {
      setUpdatingImages(true);
      toast.loading('Updating product images...', { id: 'updating-images' });
      
      // Get all products
      const { data: allProducts, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      
      let updatedCount = 0;
      const updates = [];
      
      // Loop through products and find matching images
      for (const product of allProducts || []) {
        // Try to find a matching image based on product name or model
        let imagePath = null;
        
        // Check full product name first
        if (productImageMap[product.name]) {
          imagePath = productImageMap[product.name];
        } 
        // Then check model
        else if (productImageMap[product.model]) {
          imagePath = productImageMap[product.model];
        }
        // Fallback to brand + searching
        else {
          // Find any key in the map that contains this product's name
          const matchingKey = Object.keys(productImageMap).find(key => 
            product.name.includes(key) || key.includes(product.name)
          );
          
          if (matchingKey) {
            imagePath = productImageMap[matchingKey];
          }
        }
        
        if (imagePath && product.image !== imagePath) {
          updates.push(
            supabase
              .from('products')
              .update({ image: imagePath })
              .eq('id', product.id)
              .then(({ error }) => {
                if (!error) updatedCount++;
                return { id: product.id, success: !error };
              })
          );
        }
      }
      
      // Wait for all updates to complete
      await Promise.all(updates);
      
      // Update local state with new images
      fetchProducts(currentPage, searchTerm);
      
      toast.dismiss('updating-images');
      toast.success(`Successfully updated ${updatedCount} product images`);
    } catch (error) {
      console.error('Error updating product images:', error);
      toast.error('Failed to update product images');
    } finally {
      setUpdatingImages(false);
    }
  };

  // Update database with the SQL query to update image paths
  const updateDatabaseImages = async () => {
    const confirmed = window.confirm('This will update all product images in the database to use the local GPU assets path. Continue?');
    
    if (!confirmed) return;
    
    try {
      setUpdatingDatabaseImages(true);
      toast.loading('Updating database product images...', { id: 'updating-db-images' });
      
      // Get all products
      const { data: allProducts, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      
      console.log(`Found ${allProducts?.length || 0} products. Updating images...`);
      
      // Image mapping
      const imageMapping = {
        // NVIDIA
        'RTX 4090': '../assets/gpu/rtx-4090.png',
        'RTX 4080 SUPER': '../assets/gpu/rtx-4080-super.png',
        'RTX 4080': '../assets/gpu/rtx-4080.png',
        'RTX 4070': '../assets/gpu/rtx-4070-ti.png',
        'RTX 6000 Ada': '../assets/gpu/rtx-6000-ada.png',
        'RTX 6000': '../assets/gpu/rtx-6000.png',
        'RTX 5000': '../assets/gpu/rtx-5000.png',
        'A100': '../assets/gpu/a100.png',
        'H100': '../assets/gpu/h100.png',
        'CMP 170HX': '../assets/gpu/cmp-170hx.png',
        'CMP 50HX': '../assets/gpu/cmp-50hx.png',
        
        // AMD
        'RX 7900 XTX': '../assets/gpu/rx-7900-xtx.png',
        'RX 7800 XT': '../assets/gpu/rx-7800-xt.png',
        'RX 7600': '../assets/gpu/rx-7600.png',
        'Radeon PRO W7900': '../assets/gpu/radeon-pro-w7900.png',
        'W7900X': '../assets/gpu/w7900x.png',
        'MI250X': '../assets/gpu/mi250x.png',
        
        // Intel
        'Arc A770': '../assets/gpu/arc-a770.png',
        'Arc A770 LE': '../assets/gpu/intel-arc-a770.png'
      };
      
      // Process each product
      let updatedCount = 0;
      const updates = [];
      
      for (const product of allProducts || []) {
        let imagePath = null;
        
        // Find a matching image based on model or name
        for (const [key, path] of Object.entries(imageMapping)) {
          if (product.model?.includes(key) || product.name?.includes(key)) {
            imagePath = path;
            break;
          }
        }
        
        // Default to brand if no specific match
        if (!imagePath) {
          if (product.brand === 'NVIDIA') {
            imagePath = '../assets/gpu/rtx-4090.png';
          } else if (product.brand === 'AMD') {
            imagePath = '../assets/gpu/rx-7900-xtx.png';
          } else if (product.brand === 'Intel') {
            imagePath = '../assets/gpu/arc-a770.png';
          }
        }
        
        // Update if we found a matching image
        if (imagePath && product.image !== imagePath) {
          updates.push(
            supabase
              .from('products')
              .update({ image: imagePath })
              .eq('id', product.id)
              .then(({ error }) => {
                if (!error) {
                  updatedCount++;
                }
                return { id: product.id, success: !error };
              })
          );
        }
      }
      
      // Wait for all updates to complete
      await Promise.all(updates);
      
      // Update local state with new images
      fetchProducts(currentPage, searchTerm);
      
      toast.dismiss('updating-db-images');
      toast.success(`Successfully updated ${updatedCount} product images in the database`);
    } catch (error) {
      console.error('Error updating database product images:', error);
      toast.error('Failed to update database product images');
    } finally {
      setUpdatingDatabaseImages(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Manage Products | Admin</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
        <div className="flex space-x-2">
          <button
            onClick={updateDatabaseImages}
            disabled={updatingDatabaseImages}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiDatabase className="-ml-1 mr-2 h-5 w-5" />
            {updatingDatabaseImages ? 'Updating DB...' : 'Update DB Images'}
          </button>
          <button
            onClick={updateAllProductImages}
            disabled={updatingImages}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiPhotograph className="-ml-1 mr-2 h-5 w-5" />
            {updatingImages ? 'Updating...' : 'Update UI Images'}
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          >
            <HiPlus className="-ml-1 mr-2 h-5 w-5" />
            Add New Product
          </Link>
        </div>
      </div>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 flex">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <HiSearch className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setSearchTerm('');
            fetchProducts(1, '');
          }}
          className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <HiRefresh className="h-5 w-5" />
        </button>
      </form>
      
      {/* Products Table */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No products found. {searchTerm && 'Try a different search term.'}
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image ? (
                        <div className="flex-shrink-0 h-10 w-10">
                          <GpuImage 
                            className="h-10 w-10 rounded-sm object-cover" 
                            src={product.image} 
                            alt={product.name} 
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-sm"></div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category}</div>
                    <div className="text-sm text-gray-500">{product.brand}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                    {product.sale?.active && (
                      <div className="text-xs text-green-500">
                        Sale: {product.sale.percentage}% off
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.stock > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    {product.badge && (
                      <span className="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.badge}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/admin/products/${product.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <HiPencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * productsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * productsPerPage, totalProducts)}
                </span>{' '}
                of <span className="font-medium">{totalProducts}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <HiOutlineChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === i + 1
                        ? 'z-10 bg-green-600 text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-green-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <HiOutlineChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList; 