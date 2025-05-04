import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import Layout from '../../../components/layoutes/adminlayout';
import authAxios from '../../../utils/auth';

function ExamList() {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      setIsLoading(true);
      try {
        const response = await authAxios.get('/exams');
        setExams(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Failed to fetch exams.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;

    try {
      setIsLoading(true);
      await authAxios.delete(`/exams/${examId}`);
      setExams(exams.filter((exam) => exam._id !== examId));
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Failed to delete exam.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6 md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Exams</h1>
            <p className="text-gray-600">Manage all scheduled exams</p>
          </div>
          <Link
            to="/admin/exams/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Exam
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center px-6 py-4">
                      <div className="flex justify-center">
                        <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading exams...</p>
                    </td>
                  </tr>
                ) : exams.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 px-6 py-4">
                      No exams available.
                    </td>
                  </tr>
                ) : (
                  exams.map((exam) => (
                    <tr key={exam._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{exam.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(exam.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {exam.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {exam.totalMarks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/admin/exams/edit/${exam._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Exam"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(exam._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Exam"
                          >
                            <Trash2 size={18} />
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
      </div>
    </Layout>
  );
}

export default ExamList;
