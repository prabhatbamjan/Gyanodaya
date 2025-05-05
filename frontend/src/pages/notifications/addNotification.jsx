import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';

const AddNotification = () => {
  const navigate = useNavigate();
  const [teachers, setteachers] = useState([]);
  const [students, setstudents] = useState([]);
  const [parents, setparents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    recipients: {
      users: [],
      roles: []
    },
    isGlobal: false,
    relatedTo: {
      model: '',
    },
    link: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const roles = ['admin', 'teacher', 'student', 'parent', 'all'];
  const relatedModels = ['Class', 'AcademicCalendar', 'Subject', 'User', 'Teacher', 'Student', 'Timetable'];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await authAxios.get('/teachers');
        const res2 = await authAxios.get('/students'); 
       


        setteachers(Array.isArray(res.data.data) ? res.data.data : []);
        setstudents(Array.isArray(res2.data.data) ? res2.data.data : []);
        const extractedParents = res2.data.data.map(student => student.parent);
        setparents(Array.isArray(extractedParents) ? extractedParents : []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.title || !formData.message) {
      setError('Title and message are required');
      setIsLoading(false);
      return;
    }

    try {
      const res = await authAxios.post('/notifications', {
        ...formData,
      });

      if (!res.data.success) throw new Error(res.data.message);
      toast.success('Notification sent successfully');
      navigate('/notifications');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSelectAllTeachers = () => {
    const teacherIds = teachers.map(teacher => teacher._id);
    const allSelected = teacherIds.every(id => 
      formData.recipients.users.includes(id)
    );

    setFormData(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        users: allSelected
          ? prev.recipients.users.filter(id => !teacherIds.includes(id))
          : [...new Set([...prev.recipients.users, ...teacherIds])]
      }
    }));
  };

  const handleSelectAllStudents = () => {
    const studentIds = students.map(student => student._id);
    const allSelected = studentIds.every(id => 
      formData.recipients.users.includes(id)
    );

    setFormData(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        users: allSelected
          ? prev.recipients.users.filter(id => !studentIds.includes(id))
          : [...new Set([...prev.recipients.users, ...studentIds])]
      }
    }));
  };

  const handleSelectAllParents = () => {
    const parentIds = parents.filter(p => p).map(parent => parent._id);
    const allSelected = parentIds.every(id => 
      formData.recipients.users.includes(id)
    );

    setFormData(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        users: allSelected
          ? prev.recipients.users.filter(id => !parentIds.includes(id))
          : [...new Set([...prev.recipients.users, ...parentIds])]
      }
    }));
  };

  return (
    <Layout>
      <div className="p-6">
        <Link to="/notifications" className="flex items-center text-blue-600 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Notifications
        </Link>
        <h1 className="text-2xl font-bold mb-4">Add Notification</h1>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Message</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Type</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {['info', 'success', 'warning', 'error', 'announcement'].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

         

          <div>
          <label className="block font-medium mb-1">Recipient Users</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Teachers Column */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={teachers.every(teacher => 
                    formData.recipients.users.includes(teacher._id)
                  )}
                  onChange={handleSelectAllTeachers}
                />
                <span className="font-medium">Select All Teachers</span>
              </div>
              <div className="flex flex-col gap-2">
                {teachers.map(teacher => (
                  <label key={teacher._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.recipients.users.includes(teacher._id)}
                      onChange={(e) => handleUserCheck(teacher._id, e.target.checked)}
                    />
                    <span>{teacher.name || `${teacher.firstName} ${teacher.lastName}`}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Students Column */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={students.every(student => 
                    formData.recipients.users.includes(student._id)
                  )}
                  onChange={handleSelectAllStudents}
                />
                <span className="font-medium">Select All Students</span>
              </div>
              <div className="flex flex-col gap-2">
                {students.map(student => (
                  <label key={student._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.recipients.users.includes(student._id)}
                      onChange={(e) => handleUserCheck(student._id, e.target.checked)}
                    />
                    <span>{student.name || `${student.firstName} ${student.lastName}`}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Parents Column */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={parents.filter(p => p).every(parent => 
                    formData.recipients.users.includes(parent._id)
                  )}
                  onChange={handleSelectAllParents}
                />
                <span className="font-medium">Select All Parents</span>
              </div>
              <div className="flex flex-col gap-2">
                {parents.filter(parent => parent).map(parent => (
                  <label key={parent._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.recipients.users.includes(parent._id)}
                      onChange={(e) => handleUserCheck(parent._id, e.target.checked)}
                    />
                    <span>{`${parent.firstName || ''} ${parent.lastName || ''}`.trim()}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isGlobal}
              onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
            />
            <span>Global Notification</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Related Model</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={formData.relatedTo.model}
                onChange={(e) =>
                  setFormData({ ...formData, relatedTo: { ...formData.relatedTo, model: e.target.value } })
                }
              >
                <option value="">-- Select Model --</option>
                {relatedModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Optional Link</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {isLoading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddNotification;
