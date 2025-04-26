import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Info, Trash2, Plus } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    dob: '',
    joinDate: '',
    qualification: '',
    salary: '',
    experience: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Nepal',
    },
    subjects: [] // Array of subject IDs
  });

  const [currentSubject, setCurrentSubject] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const subjectResponse = await authAxios.get('subjects/');
        setSubjects(subjectResponse.data.data);

        // Fetch teacher data
        const teacherResponse = await authAxios.get(`teachers/${id}`);
        const teacherData = teacherResponse.data.data;
        
        // Format the data to match our form structure
        setFormData({
          firstName: teacherData.firstName,
          lastName: teacherData.lastName,
          email: teacherData.email,
          gender: teacherData.gender,
          dob: teacherData.dob,
          joinDate: teacherData.joinDate,
          qualification: teacherData.qualification,
          salary: teacherData.salary,
          experience: teacherData.experience,
          phone: teacherData.phone,
          address: {
            street: teacherData.address?.street || '',
            city: teacherData.address?.city || '',
            state: teacherData.address?.state || '',
            zipCode: teacherData.address?.zipCode || '',
            country: teacherData.address?.country || 'Nepal',
          },
          subjects: teacherData.subjects || []
        });

        if (teacherData.profileImage) {
          setImagePreview(`http://localhost:5000/uploads/${teacherData.profileImage}`);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };

  const handleSubjectChange = (e) => {
    setCurrentSubject(e.target.value);
  };

  const handleAddSubject = () => {
    if (!currentSubject) {
      setValidationErrors({
        ...validationErrors,
        subjects: 'Please select a subject'
      });
      return;
    }

    // Check if this subject already exists
    const exists = formData.subjects.includes(currentSubject);

    if (exists) {
      setValidationErrors({
        ...validationErrors,
        subjects: 'This subject is already assigned'
      });
      return;
    }

    setFormData({
      ...formData,
      subjects: [
        ...formData.subjects,
        currentSubject
      ]
    });

    setCurrentSubject('');
    setValidationErrors({
      ...validationErrors,
      subjects: null
    });
  };

  const handleRemoveSubject = (subjectId) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(id => id !== subjectId)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    if (formData.subjects.length > 9) {
      setError('You can only assign up to 9 subjects');
      setSaving(false);
      return;
    }
    
    try {
      // Only send editable fields to the backend
      const payload = {
        phone: formData.phone,
        address: formData.address,
        subjects: formData.subjects
      };

      const response = await authAxios.put(`teachers/${id}`, payload);
      
      setTimeout(() => {
        setSaving(false);
        alert('Teacher updated successfully!');
        navigate('/admin/teachers');
      }, 1500);
      
    } catch (err) {
      setSaving(false);
      setError(err.response?.data?.message || 'Failed to update teacher. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Loader text="Loading data..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/admin/teachers" className="text-blue-600 hover:text-blue-800 mr-4">
            <ArrowLeft className="inline mr-1" size={16} /> Back to Teachers
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800">Edit Teacher</h1>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {Object.keys(validationErrors).length > 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
            <p className="font-bold">Please fix the following errors:</p>
            <ul className="list-disc pl-5 mt-2">
              {Object.entries(validationErrors).map(([field, error]) => (
                error && <li key={field}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Personal Information - Display Only */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                  <div className="p-2 bg-gray-100 rounded">{formData.firstName}</div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                  <div className="p-2 bg-gray-100 rounded">{formData.lastName}</div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                  <div className="p-2 bg-gray-100 rounded">{formData.email}</div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                    Phone *
                  </label>
                  <input
                    id="phone"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
                  <div className="p-2 bg-gray-100 rounded">{formData.gender}</div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
                  <div className="p-2 bg-gray-100 rounded">{formData.dob}</div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Joining Date</label>
                  <div className="p-2 bg-gray-100 rounded">{formData.joinDate}</div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Qualification</label>
                  <div className="p-2 bg-gray-100 rounded">{formData.qualification}</div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Salary</label>
                  <div className="p-2 bg-gray-100 rounded">{formData.salary}</div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Years of Experience</label>
                  <div className="p-2 bg-gray-100 rounded">{formData.experience}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information - Editable */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.street">
                  Street Address *
                </label>
                <input
                  id="address.street"
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.city">
                  City *
                </label>
                <input
                  id="address.city"
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.state">
                  State *
                </label>
                <input
                  id="address.state"
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.zipCode">
                  Zip Code *
                </label>
                <input
                  id="address.zipCode"
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.country">
                  Country
                </label>
                <input
                  id="address.country"
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
          </div>

          {/* Subject Assignments */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Subject Assignments</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Subject</label>
                <select
                  name="subject"
                  value={currentSubject}
                  onChange={handleSubjectChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
                  disabled={!currentSubject}
                >
                  <Plus className="mr-1" size={16} /> Add
                </button>
              </div>
            </div>

            {validationErrors.subjects && (
              <p className="text-red-500 text-xs italic mb-4">{validationErrors.subjects}</p>
            )}

            {formData.subjects.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.subjects.map((subjectId) => {
                      const subject = subjects.find(s => s._id === subjectId);
                      
                      return (
                        <tr key={subjectId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {subject?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleRemoveSubject(subjectId)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                No subjects assigned yet
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="p-6 flex justify-end gap-4">
            <Link
              to="/admin-teachers"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Update Teacher
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditTeacher;