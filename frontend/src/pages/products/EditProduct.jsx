import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setIsDataLoading(true);
    setError(null);
    try {
      const response = await authAxios.get(`products/${id}`);
      if (!response.data.success) {
        throw new Error('Failed to fetch product');
      }

      const product = response.data.data;
      setFormData({
        name: product.name,
        description: product.description,
        sellingprice: product.sellingPrice?.toString() || '',
        costprice: product.costPrice?.toString() || '',
        category: product.category,
        stock: product.stock?.toString() || '',
        status: product.status
      });

      if (product.image) {
        setImagePreview(product.image.secure_url || product.image);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to load product data');
    } finally {
      setIsDataLoading(false);
    }
  };

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

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.sellingprice || !formData.costprice || !formData.stock) {
        throw new Error('Please fill in all required fields');
      }

      // Validate price and stock
      if (parseFloat(formData.sellingprice) < 0 || parseFloat(formData.costprice) < 0 || parseInt(formData.stock) < 0) {
        throw new Error('Prices and stock cannot be negative');
      }

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

      console.log('Updating product with data:', Object.fromEntries(formDataToSend));

      const response = await authAxios.put(`products/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update product');
      }

      alert('Product updated successfully!');
      navigate('/product');
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center h-full">
          <Loader size="large" text="Loading product data..." />
        </div>
      </Layout>
    );
  }

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

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Product</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-6">
          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
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
                  <span>Change Image</span>
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
                  Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditProduct; 