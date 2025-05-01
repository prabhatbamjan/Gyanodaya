import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sellingprice: '',
    costprice: '',
    category: 'other',
    stock: '',
    status: 'available'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPG, PNG, WEBP)');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      // Store the file for upload
      setProductImage(file);
      // Create preview URL
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    if (!validateProductForm()) {
      setLoading(false);
      return;
    }
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('sellingprice', formData.sellingprice);
      formDataToSend.append('costprice', formData.costprice);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('status', formData.status);
      
      if (productImage) {
        formDataToSend.append('image', productImage);
      }
  
      console.log('Sending form data:', Object.fromEntries(formDataToSend));
      
      const response = await authAxios.post('/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create product');
      }
  
      alert('Product created successfully!');
      navigate('/product');
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };
  
  const validateProductForm = () => {
    if (!productImage) {
      setError('Please upload a product image');
      return false;
    }
  
    if (!formData.name.trim()) {
      setError('Product name is required');
      return false;
    }
  
    if (!formData.name.trim().match(/^[A-Za-z0-9\s\-']{2,}$/)) {
      setError('Product name must be at least 2 characters and contain only letters, numbers, spaces, hyphens or apostrophes');
      return false;
    }
  
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
  
    if (formData.description.trim().length < 5) {
      setError('Description must be at least 5 characters');
      return false;
    }
  
    if (!formData.sellingprice || parseFloat(formData.sellingprice) <= 0) {
      setError('Selling price must be greater than 0');
      return false;
    }
  
    if (!formData.costprice || parseFloat(formData.costprice) <= 0) {
      setError('Cost price must be greater than 0');
      return false;
    }
  
    if (parseFloat(formData.costprice) > parseFloat(formData.sellingprice)) {
      setError('Cost price cannot be greater than selling price');
      return false;
    }
  
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError('Stock must be a non-negative number');
      return false;
    }
  
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
  
    if (!formData.status) {
      setError('Status is required');
      return false;
    }
  
    setError('');
    return true;
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/product')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-6">
          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image *
            </label>
            <div className="flex items-center space-x-6">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center overflow-hidden relative">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Product preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 flex flex-col items-center">
                    <Image className="h-10 w-10 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Upload a product image (JPG, PNG, WEBP). Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="books">Books</option>
                <option value="uniforms">Uniforms</option>
                <option value="stationery">Stationery</option>
                <option value="electronics">Electronics</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price *
              </label>
              <input
                type="number"
                name="sellingprice"
                value={formData.sellingprice}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price *
              </label>
              <input
                type="number"
                name="costprice"
                value={formData.costprice}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="available">Available</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/product')}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddProduct; 