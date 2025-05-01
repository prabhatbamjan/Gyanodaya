import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash, Tag, Package, DollarSign, Calendar, User, Truck, ImageOff } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';

const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await authAxios.get(`products/${id}`);
        if (!response.data.success) {
          throw new Error('Failed to fetch product details');
        }
        console.log('Product data:', response.data.data);
        setProduct(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        const response = await authAxios.delete(`products/${id}`);
        if (response.data.success) {
          alert('Product deleted successfully');
          navigate('/product');
        } else {
          throw new Error('Failed to delete product');
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        setError(err.message || 'Failed to delete product');
      }
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    return image.secure_url || image;
  };

  if (loading) {
    return (
      <Layout>
        <div className="w-full p-6 bg-gray-50">
          <div className="w-full bg-white rounded-lg shadow-sm p-6 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading product details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="w-full p-6 bg-gray-50">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
          <Link to="/product" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Products
          </Link>
        </div>
      </Layout>
    );
  }
  
  if (!product) {
    return (
      <Layout>
        <div className="w-full p-6 bg-gray-50">
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-6">
            Product not found
          </div>
          <Link to="/product" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Products
          </Link>
        </div>
      </Layout>
    );
  }

  // Calculate profit and margin
  const hasProfit = product.sellingPrice > 0 && product.costPrice > 0;
  const profit = hasProfit ? product.sellingPrice - product.costPrice : 0;
  const margin = hasProfit ? ((profit / product.sellingPrice) * 100).toFixed(0) : 0;
  
  // Calculate discount if applicable
  const hasDiscount = product.costPrice > product.sellingPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.costPrice - product.sellingPrice) / product.costPrice) * 100)
    : 0;

  return (
    <Layout>
      <div className="w-full p-6 bg-gray-50">
        {/* Header with actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/product" className="text-blue-600 hover:text-blue-800 flex items-center mr-4">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Products
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              {product.name}
            </h1>
          </div>
          
          <div className="flex space-x-2">
            <Link 
              to={`/editeProduct/${product._id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
        
        {/* Product Profile Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row">
              <div className="w-48 h-48 rounded-lg overflow-hidden border border-gray-200 mb-4 md:mb-0 md:mr-6 flex-shrink-0">
                {getImageUrl(product.image) ? (
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <ImageOff className="h-16 w-16" />
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      {product.name}
                    </h2>
                    <p className="text-gray-600 mb-2">Stock: {product.stock} units</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {product.category}
                      </span>
                      <span className={`bg-${product.stock > 0 ? 'green' : 'red'}-100 text-${product.stock > 0 ? 'green' : 'red'}-800 text-xs font-medium px-2.5 py-0.5 rounded`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <div className="text-3xl font-bold text-gray-800">NRS {product.sellingPrice?.toFixed(2) || '0.00'}</div>
                    {product.costPrice > product.sellingPrice && (
                      <div className="text-lg line-through text-gray-400">NRS {product.costPrice?.toFixed(2) || '0.00'}</div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700">{product.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="inline-block h-5 w-5 mr-2" />
                Product Details
              </button>
              
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'inventory'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Truck className="inline-block h-5 w-5 mr-2" />
                Inventory
              </button>
              
              <button
                onClick={() => setActiveTab('pricing')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'pricing'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DollarSign className="inline-block h-5 w-5 mr-2" />
                Pricing & Costs
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Product Details Tab */}
            {activeTab === 'details' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Basic Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500">Product Name</label>
                          <div className="text-sm font-medium text-gray-800">{product.name}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Description</label>
                          <div className="text-sm text-gray-800">{product.description}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Category</label>
                          <div className="text-sm font-medium text-gray-800">{product.category}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Status</label>
                          <div className="text-sm font-medium text-gray-800">{product.status}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Image Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 gap-4">
                        {product.image && (
                          <>
                            <div>
                              <label className="block text-xs text-gray-500">Image Format</label>
                              <div className="text-sm font-medium text-gray-800">
                                {product.image.format || 'Unknown'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500">Dimensions</label>
                              <div className="text-sm font-medium text-gray-800">
                                {product.image.width && product.image.height ? 
                                  `${product.image.width} × ${product.image.height}` : 
                                  'Unknown'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500">Cloudinary ID</label>
                              <div className="text-sm font-medium text-gray-800 truncate">
                                {product.image.public_id || 'N/A'}
                              </div>
                            </div>
                          </>
                        )}
                        {!product.image && (
                          <div className="text-sm text-gray-500 italic">No image information available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Created By</label>
                        <div className="text-sm font-medium text-gray-800">
                          {product.createdBy ? `${product.createdBy.firstName} ${product.createdBy.lastName}` : 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Created At</label>
                        <div className="text-sm font-medium text-gray-800">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Last Updated</label>
                        <div className="text-sm font-medium text-gray-800">
                          {new Date(product.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className={`bg-${product.stock > 0 ? 'green' : 'red'}-50 p-4 rounded-lg`}>
                    <h4 className={`text-sm font-medium text-${product.stock > 0 ? 'green' : 'red'}-700 mb-1`}>Status</h4>
                    <p className={`text-2xl font-bold text-${product.stock > 0 ? 'green' : 'red'}-800`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-700 mb-1">Quantity</h4>
                    <p className="text-2xl font-bold text-blue-800">{product.stock || 0}</p>
                    <p className="text-sm text-blue-600">
                      {product.stock <= 5 ? 'Low stock alert!' : 'Stock level normal'}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-700 mb-1">Status</h4>
                    <p className="text-2xl font-bold text-purple-800">
                      {product.status || 'available'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing & Cost Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-700 mb-1">Selling Price</h4>
                    <p className="text-2xl font-bold text-green-800">NRS {product.sellingPrice?.toFixed(2) || '0.00'}</p>
                    {hasDiscount && (
                      <p className="text-sm text-green-600 line-through">
                        ${product.costPrice?.toFixed(2) || '0.00'}
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-700 mb-1">Cost Price</h4>
                    <p className="text-2xl font-bold text-blue-800">
                    NRS {product.costPrice?.toFixed(2) || '0.00'}
                    </p>
                    {hasProfit && (
                      <p className="text-sm text-blue-600">
                        Margin: {margin}%
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-700 mb-1">Profit</h4>
                    <p className="text-2xl font-bold text-purple-800">
                    NRS {profit.toFixed(2)}
                    </p>
                    <p className="text-sm text-purple-600">Per unit</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewProduct;