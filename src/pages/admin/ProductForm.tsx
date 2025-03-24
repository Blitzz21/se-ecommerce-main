import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { HiArrowLeft, HiSave, HiTrash, HiUpload } from 'react-icons/hi';
import { Product } from '../../data/products';
import { initializeStorage } from '../../lib/dbInit';
import { GpuImage } from '../../utils/ImageHelper';

// GPU images from assets folder
const gpuImages: Array<{name: string, path: string}> = [
  { name: 'NVIDIA RTX 4090', path: '../assets/gpu/rtx-4090.png' },
  { name: 'NVIDIA RTX 4080', path: '../assets/gpu/rtx-4080.png' },
  { name: 'NVIDIA RTX 4080 Super', path: '../assets/gpu/rtx-4080-super.png' },
  { name: 'NVIDIA RTX 4070 Ti', path: '../assets/gpu/rtx-4070-ti.png' },
  { name: 'NVIDIA RTX 6000', path: '../assets/gpu/rtx-6000.png' },
  { name: 'NVIDIA RTX 6000 Ada', path: '../assets/gpu/rtx-6000-ada.png' },
  { name: 'NVIDIA RTX 5000', path: '../assets/gpu/rtx-5000.png' },
  { name: 'NVIDIA A100', path: '../assets/gpu/a100.png' },
  { name: 'NVIDIA H100', path: '../assets/gpu/h100.png' },
  { name: 'NVIDIA CMP 170HX', path: '../assets/gpu/cmp-170hx.png' },
  { name: 'NVIDIA CMP 50HX', path: '../assets/gpu/cmp-50hx.png' },
  { name: 'AMD Radeon RX 7900 XTX', path: '../assets/gpu/rx-7900-xtx.png' },
  { name: 'AMD Radeon RX 7800 XT', path: '../assets/gpu/rx-7800-xt.png' },
  { name: 'AMD Radeon RX 7600', path: '../assets/gpu/rx-7600.png' },
  { name: 'AMD Radeon PRO W7900', path: '../assets/gpu/radeon-pro-w7900.png' },
  { name: 'AMD Radeon PRO W7900X', path: '../assets/gpu/w7900x.png' },
  { name: 'AMD Instinct MI250X', path: '../assets/gpu/mi250x.png' },
  { name: 'Intel Arc A770', path: '../assets/gpu/arc-a770.png' },
  { name: 'Intel Arc A770 Limited Edition', path: '../assets/gpu/intel-arc-a770.png' }
];

const categories = ['Gaming', 'Workstation', 'Mining', 'AI'];
const badges = ['NEW', 'SALE', 'LIMITED', 'BEST SELLER'];

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedAssetImage, setSelectedAssetImage] = useState<string>('');
  const [useAssetImage, setUseAssetImage] = useState<boolean>(false);
  
  // Form fields
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    brand: undefined,
    model: '',
    price: 0,
    category: 'Gaming' as 'Gaming' | 'Workstation' | 'Mining' | 'AI',
    description: '',
    specs: {
      memory: '',
      memoryType: '',
      coreClock: '',
      boostClock: '',
      tdp: ''
    },
    stock: 0,
    rating: 0,
    reviews: 0,
    badge: undefined,
    sale: {
      active: false,
      percentage: 0,
      oldPrice: 0
    }
  });
  
  // Sales toggle
  const [hasSale, setHasSale] = useState(false);
  
  useEffect(() => {
    // If we're in edit mode, fetch the product
    if (isEditMode && id) {
      fetchProduct(id);
    } else {
      setLoading(false);
    }
  }, [id, isEditMode]);
  
  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProduct(data);
        setHasSale(data.sale?.active || false);
        if (data.image) {
          setImagePreview(data.image);
          
          // If the image is from our assets, mark it as an asset image
          if (data.image.includes('assets/gpu/')) {
            const matchingImage = gpuImages.find(img => data.image.includes(img.path.split('/').pop() || ''));
            if (matchingImage) {
              setSelectedAssetImage(matchingImage.path);
              setUseAssetImage(true);
            }
          }
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/admin/products');
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., specs.memory)
      const [parent, child] = name.split('.');
      setProduct(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Product] as object),
          [child]: value
        }
      }));
    } else if (name === 'brand') {
      // Handle brand field specifically to ensure correct typing
      if (value === 'NVIDIA' || value === 'AMD' || value === 'Intel') {
        setProduct(prev => ({
          ...prev,
          brand: value
        }));
      }
    } else {
      // Handle regular properties
      setProduct(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'stock' || name === 'rating' || name === 'reviews' 
          ? parseFloat(value) 
          : value
      }));
    }
  };
  
  const handleSaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      sale: {
        ...prev.sale!,
        [name]: name === 'active' 
          ? e.target.checked 
          : parseFloat(value)
      }
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setUseAssetImage(false);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAssetImageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPath = e.target.value;
    if (selectedPath) {
      setSelectedAssetImage(selectedPath);
      setUseAssetImage(true);
      setImageFile(null);
      setImagePreview(selectedPath);
    }
  };
  
  const uploadImage = async (productId: string): Promise<string | null> => {
    // If using an asset image, return its path
    if (useAssetImage && selectedAssetImage) {
      return selectedAssetImage;
    }
    
    if (!imageFile) return product.image || null;
    
    try {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `products/${productId}.${fileExt}`;
      
      // Try to upload the image
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, { upsert: true });
      
      // If bucket doesn't exist, create it and try again
      if (uploadError && 
          (uploadError.message.includes('Bucket not found') || 
           uploadError.message.includes('404'))) {
        
        console.log('Bucket not found, trying to create it...');
        
        // Show an alert with instructions for creating the bucket
        toast.error(
          'Storage bucket "product-images" not found. Please create it in the Supabase dashboard: Storage → New Bucket → Name: "product-images" → Enable public access: true', 
          { duration: 10000 }
        );
        
        // Try to create the bucket anyway, might work if permissions are set correctly
        const initResult = await initializeStorage();
        
        if (initResult.success) {
          // Try upload again after creating the bucket
          const { error: retryError } = await supabase.storage
            .from('product-images')
            .upload(filePath, imageFile, { upsert: true });
          
          if (retryError) {
            console.error('Error uploading image after bucket creation:', retryError);
            toast.error('Failed to upload product image');
            return null;
          }
        } else {
          console.error('Failed to create storage bucket:', initResult.error);
          toast.error('Failed to create storage for images', { duration: 5000 });
          return null;
        }
      } else if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL for the uploaded image
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload product image. Please try again.');
      return null;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!product.name || !product.brand || !product.price) {
        toast.error('Please fill in all required fields');
        setSubmitting(false);
        return;
      }
      
      // Ensure specs object is complete
      const specs = {
        memory: product.specs?.memory || '',
        memoryType: product.specs?.memoryType || '',
        coreClock: product.specs?.coreClock || '',
        boostClock: product.specs?.boostClock || '',
        tdp: product.specs?.tdp || ''
      };
      
      // Prepare product data
      const productData = {
        ...product,
        specs,
        sale: hasSale ? product.sale : { active: false, percentage: 0, oldPrice: 0 }
      };
      
      let savedProductId: string;
      
      if (isEditMode) {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id!)
          .select('id')
          .single();
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        savedProductId = data.id;
        
      } else {
        // Create new product with a generated UUID
        const newId = crypto.randomUUID();
        const newProduct = {
          ...productData,
          id: newId,  // Add explicit ID
          rating: 0,  // Default rating
          reviews: 0  // Default reviews count
        };
        
        const { data, error } = await supabase
          .from('products')
          .insert(newProduct)
          .select('id')
          .single();
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        savedProductId = data.id;
      }
      
      // Upload image if one was selected
      if (imageFile || useAssetImage) {
        try {
          const imageUrl = await uploadImage(savedProductId);
          
          if (imageUrl) {
            // Update the product with the image URL
            await supabase
              .from('products')
              .update({ image: imageUrl })
              .eq('id', savedProductId);
          } else {
            // Image upload failed but product was saved
            toast.error(
              'Product saved without image. To add an image later, please create a "product-images" bucket in your Supabase dashboard.',
              { duration: 8000 }
            );
          }
        } catch (imageError) {
          console.error('Error handling product image:', imageError);
          toast.error('Product saved without image due to an error during upload.', { duration: 5000 });
        }
      }
      
      toast.success(`Product ${isEditMode ? 'updated' : 'created'} successfully`);
      navigate('/admin/products');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!isEditMode) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this product? This action cannot be undone.');
    
    if (confirmed) {
      try {
        setSubmitting(true);
        
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id!);
        
        if (error) throw error;
        
        toast.success('Product deleted successfully');
        navigate('/admin/products');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      } finally {
        setSubmitting(false);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>{isEditMode ? 'Edit Product' : 'Add New Product'} | Admin</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/products')}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <HiArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
        
        {isEditMode && (
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
            disabled={submitting}
          >
            <HiTrash className="mr-2 h-5 w-5" />
            Delete Product
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Basic Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <select
                  id="brand"
                  name="brand"
                  value={product.brand || ''}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="" disabled>Select a brand</option>
                  <option value="NVIDIA">NVIDIA</option>
                  <option value="AMD">AMD</option>
                  <option value="Intel">Intel</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={product.model}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={product.stock}
                  onChange={handleChange}
                  min="0"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="badge" className="block text-sm font-medium text-gray-700 mb-1">
                  Badge
                </label>
                <select
                  id="badge"
                  name="badge"
                  value={product.badge || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">None</option>
                  {badges.map((badge) => (
                    <option key={badge} value={badge}>
                      {badge}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
          
          {/* Product Image */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Product Image</h2>
            
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-full md:w-1/3">
                <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <GpuImage
                      src={imagePreview}
                      alt="Product preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No image selected</span>
                  )}
                </div>
              </div>
              
              <div className="w-full md:w-2/3">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select from GPU assets
                  </label>
                  <select
                    value={selectedAssetImage}
                    onChange={handleAssetImageSelect}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="">Select a GPU image</option>
                    {gpuImages.map((image) => (
                      <option key={image.path} value={image.path}>
                        {image.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Choose from the pre-loaded GPU images in the assets folder
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Or</span>
                    <div className="flex-grow border-t border-gray-200 mx-4"></div>
                  </div>
                </div>
                
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload custom image
                </label>
                <div className="mt-1 flex items-center">
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <HiUpload className="mr-2 h-5 w-5 text-gray-500" />
                    Browse...
                  </label>
                  <input
                    id="image-upload"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  <span className="ml-2 text-sm text-gray-500">
                    {imageFile ? imageFile.name : 'No file selected'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Recommended size: 800x600 pixels. Maximum file size: 2MB.
                </p>
              </div>
            </div>
          </div>
          
          {/* Technical Specifications */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Technical Specifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="specs.memory" className="block text-sm font-medium text-gray-700 mb-1">
                  Memory
                </label>
                <input
                  type="text"
                  id="specs.memory"
                  name="specs.memory"
                  value={product.specs?.memory || ''}
                  onChange={handleChange}
                  placeholder="e.g., 12GB"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="specs.memoryType" className="block text-sm font-medium text-gray-700 mb-1">
                  Memory Type
                </label>
                <input
                  type="text"
                  id="specs.memoryType"
                  name="specs.memoryType"
                  value={product.specs?.memoryType || ''}
                  onChange={handleChange}
                  placeholder="e.g., GDDR6X"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="specs.coreClock" className="block text-sm font-medium text-gray-700 mb-1">
                  Core Clock
                </label>
                <input
                  type="text"
                  id="specs.coreClock"
                  name="specs.coreClock"
                  value={product.specs?.coreClock || ''}
                  onChange={handleChange}
                  placeholder="e.g., 1500 MHz"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="specs.boostClock" className="block text-sm font-medium text-gray-700 mb-1">
                  Boost Clock
                </label>
                <input
                  type="text"
                  id="specs.boostClock"
                  name="specs.boostClock"
                  value={product.specs?.boostClock || ''}
                  onChange={handleChange}
                  placeholder="e.g., 1800 MHz"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="specs.tdp" className="block text-sm font-medium text-gray-700 mb-1">
                  TDP
                </label>
                <input
                  type="text"
                  id="specs.tdp"
                  name="specs.tdp"
                  value={product.specs?.tdp || ''}
                  onChange={handleChange}
                  placeholder="e.g., 320W"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
          
          {/* Sale Information */}
          <div className="p-6">
            <div className="flex items-center mb-4">
              <input
                id="has-sale"
                name="has-sale"
                type="checkbox"
                checked={hasSale}
                onChange={(e) => setHasSale(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="has-sale" className="ml-2 text-lg font-medium text-gray-900">
                On Sale
              </label>
            </div>
            
            {hasSale && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage *
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      id="percentage"
                      name="percentage"
                      value={product.sale?.percentage || 0}
                      onChange={handleSaleChange}
                      min="1"
                      max="99"
                      required={hasSale}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                      %
                    </span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="oldPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price ($) *
                  </label>
                  <input
                    type="number"
                    id="oldPrice"
                    name="oldPrice"
                    value={product.sale?.oldPrice || 0}
                    onChange={handleSaleChange}
                    min="0"
                    step="0.01"
                    required={hasSale}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          >
            <HiSave className="mr-2 h-5 w-5" />
            {submitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;