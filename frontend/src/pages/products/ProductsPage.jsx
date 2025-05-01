import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Eye, Trash2, ImageOff } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await authAxios.get('products');
      if (response.status === 200) {
        console.log('Products response:', response.data.data);
        setProducts(response.data.data);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await authAxios.delete(`products/${id}`);
        if (response.data.success) {
          setProducts(products.filter(product => product._id !== id));
        } else {
          setError('Failed to delete product');
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesStatus = !selectedStatus || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'out-of-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    return image.secure_url || image;
  };

  return (
    <Layout>
      <div className="w-full p-6 bg-gray-50">
        <header className="mb-6 bg-white p-5 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl font-semibold text-gray-800">School Products</h1>
              <p className="text-sm text-gray-500">Manage all school shop products</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-auto">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Link
                to="/addProduct"
                className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </Link>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="books">Books</option>
              <option value="uniforms">Uniforms</option>
              <option value="stationery">Stationery</option>
              <option value="electronics">Electronics</option>
              <option value="other">Other</option>
            </select>

            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </header>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="w-full bg-white rounded-lg shadow-sm p-6 flex justify-center">
            <Loader size="large" text="Loading products..." />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="w-full bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
            No products found matching your criteria.
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-lg shadow-sm bg-white">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Image</th>
                  <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Name</th>
                  <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Price</th>
                  <th scope="col" className="hidden md:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Stock</th>
                  <th scope="col" className="hidden md:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Category</th>
                  <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Status</th>
                  <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4">
                      <div className="w-16 h-16 rounded border overflow-hidden flex items-center justify-center bg-gray-100">
                        {getImageUrl(product.image) ? (
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                            <ImageOff size={18} />
                            <span className="text-xs mt-1">No image</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">{product.description}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="text-sm text-gray-700">NRS {product.sellingPrice?.toFixed(2) || "0.00"}</div>
                      <div className="text-xs text-gray-500">Cost: NRS {product.costPrice?.toFixed(2) || "0.00"}</div>
                    </td>
                    <td className="hidden md:table-cell px-4 md:px-6 py-4 text-sm text-gray-700">{product.stock}</td>
                    <td className="hidden md:table-cell px-4 md:px-6 py-4">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm font-medium flex space-x-2">
                      <Link 
                        to={`/editeProduct/${product._id}`} 
                        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md border border-blue-200 hover:border-transparent transition-colors"
                        title="Edit product"
                      >
                        <Pencil size={16} />
                      </Link>
                      <Link 
                        to={`/viewProduct/${product._id}`} 
                        className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-white hover:bg-green-600 rounded-md border border-green-200 hover:border-transparent transition-colors"
                        title="View product"
                      >
                        <Eye size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(product._id)} 
                        className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-white hover:bg-red-600 rounded-md border border-red-200 hover:border-transparent transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage;
