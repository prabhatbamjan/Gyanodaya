import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ShoppingCart, Heart, Info, Star, Truck, Clock } from 'lucide-react';
import authAxios from '../../utils/auth';

const CustomerProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await authAxios.get(`products/${id}`);
        if (!response.data.success) {
          throw new Error('Failed to fetch product details');
        }
        console.log(response.data.data);
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

  const handleAddToCart = () => {
    // Implement add to cart functionality
    alert(`Added ${quantity} ${product.name} to cart`);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product.quantity || 10)) {
      setQuantity(value);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full bg-white rounded-lg shadow-sm p-6 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
        <Link to="/shop" className="text-blue-600 hover:text-blue-800 flex items-center">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Shop
        </Link>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-6">
          Product not found
        </div>
        <Link to="/shop" className="text-blue-600 hover:text-blue-800 flex items-center">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm">
          <Link to="/" className="text-gray-500 hover:text-blue-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/shop" className="text-gray-500 hover:text-blue-600">Shop</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to={`/shop/category/${product.category}`} className="text-gray-500 hover:text-blue-600">{product.category}</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>
        
        {/* Product Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="flex justify-center items-center bg-gray-50 rounded-lg p-4">
              {product.image ? (
                <img
                  src={product.image.secure_url || product.image}
                  alt={product.name}
                  className="max-h-96 object-contain"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-400">
                  <Package className="h-20 w-20" />
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-5 w-5 ${star <= (product.rating || 5) ? 'fill-current' : ''}`} 
                    />
                  ))}
                </div>
                <span className="text-gray-500 ml-2">{product.numReviews || 0} reviews</span>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  {product.compareAtPrice && (
                    <span className="ml-3 text-lg text-gray-500 line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                  {product.compareAtPrice && (
                    <span className="ml-3 px-2 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-md">
                      {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
                
                <div className="mt-1 text-sm text-gray-500">
                  {product.inStock ? (
                    <span className="text-green-600 font-medium">In Stock</span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  )}
                </div>
              </div>
              
              <div className="border-t border-b border-gray-200 py-4 mb-6">
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              {/* Add to Cart Section */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <label htmlFor="quantity" className="mr-4 text-gray-700 font-medium">Quantity:</label>
                  <div className="flex items-center">
                    <button 
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      className="px-3 py-1 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={product.quantity || 10}
                      className="w-16 border-t border-b border-gray-300 py-1 text-center"
                    />
                    <button 
                      onClick={() => quantity < (product.quantity || 10) && setQuantity(quantity + 1)}
                      className="px-3 py-1 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`px-6 py-3 rounded-md flex items-center font-medium text-white ${
                      product.inStock 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </button>
                  
                  <button
                    className="px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Heart className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* Delivery Info */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <Truck className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Free shipping</p>
                    <p className="text-xs text-gray-500">For orders over $50</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Delivery time</p>
                    <p className="text-xs text-gray-500">3-5 business days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('description')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'description'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Description
              </button>
              
              <button
                onClick={() => setActiveTab('features')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'features'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Features
              </button>
              
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Product Details
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}
            
            {activeTab === 'features' && (
              <div>
                {product.features && product.features.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="text-gray-700">{feature}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No features specified for this product.</p>
                )}
              </div>
            )}
            
            {activeTab === 'details' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Product Information</h3>
                    <table className="min-w-full">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 text-sm font-medium text-gray-500">SKU</td>
                          <td className="py-2 text-sm text-gray-700">{product.sku || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm font-medium text-gray-500">Brand</td>
                          <td className="py-2 text-sm text-gray-700">{product.brand || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm font-medium text-gray-500">Category</td>
                          <td className="py-2 text-sm text-gray-700">{product.category}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm font-medium text-gray-500">Weight</td>
                          <td className="py-2 text-sm text-gray-700">
                            {product.weight ? `${product.weight} ${product.weightUnit || 'kg'}` : 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm font-medium text-gray-500">Dimensions</td>
                          <td className="py-2 text-sm text-gray-700">{product.dimensions || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Shipping & Returns</h3>
                    <div className="space-y-4 text-sm text-gray-700">
                      <p>
                        <span className="font-medium">Shipping:</span> Free standard shipping on all orders over $50. 
                        Expedited and international shipping options available at checkout.
                      </p>
                      <p>
                        <span className="font-medium">Returns:</span> We accept returns within 30 days of delivery. 
                        Items must be unused and in original packaging.
                      </p>
                      <p>
                        <span className="font-medium">Warranty:</span> This product includes a 1-year limited warranty.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">You May Also Like</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* This would typically be populated with related products from an API call */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4">
                <p className="text-center text-gray-500">Related products would appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProductView; 