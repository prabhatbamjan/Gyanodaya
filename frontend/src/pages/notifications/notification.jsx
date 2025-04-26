import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  Bell,
  ArrowUpDown,
  Pin,
  Eye,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';


// Update these utility functions or remove if unused
const getTypeBadge = (type) => {
  switch (type) {
    case 'info':
      return 'bg-blue-100 text-blue-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'urgent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const response = await authAxios.get('notifications/');
        const allNotices = response.data.data;

        // Optional search filtering (local)
        const filtered = allNotices.filter(notice =>
          notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notice.message.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setNotices(filtered);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch notices');
        setLoading(false);
      }
    };

    fetchNotices();
  }, [searchQuery, currentPage]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      setLoading(true);
      try {
        // await authAxios.delete(`notifications/${id}`);
        setTimeout(() => {
          setNotices(prev => prev.filter(n => n._id !== id));
          setLoading(false);
        }, 500);
      } catch (error) {
        setError('Failed to delete notice');
        setLoading(false);
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notices</h1>
          <Link
            to="/notifications-add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Notice
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            <AlertTriangle className="inline h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by title or message"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-1/3 border p-2 rounded-lg"
          />
        </div>

        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Related To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Global</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Creator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center px-6 py-4">
                    Loading...
                  </td>
                </tr>
              ) : notices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center px-6 py-4 text-gray-500">
                    No notices found.
                  </td>
                </tr>
              ) : (
                notices.map((notice) => (
                  <tr key={notice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 flex items-center">
                        {notice.title}
                        {notice.link && <FileText className="h-4 w-4 text-gray-400 ml-2" />}
                      </div>
                      <div className="text-xs text-gray-500">{notice.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(notice.type)}`}>
                        {notice.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {notice.relatedTo?.model || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {notice.isGlobal ? (
                        <span className="text-green-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {notice.createdBy?.firstName} {notice.createdBy?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(notice.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Link to={`/admin/notices/${notice._id}`} className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link to={`/admin/notices/edit/${notice._id}`} className="text-yellow-600 hover:text-yellow-900">
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(notice._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};


export default Notices; 