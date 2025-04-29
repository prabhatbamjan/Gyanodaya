import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Info, Trash2, Plus } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const AddTeacher = () => {
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
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    if (!validateForm()) {
      setSaving(false); 
      return;
    }
  
    
   
    
    try {
      const response = await authAxios.post('teachers/', formData);
      console.log(formData);
      console.log(response);
      
      setTimeout(() => {
        setSaving(false);
        alert('Teacher added successfully!');
        navigate('/admin-teachers');
      }, 1500);
      
    } catch (err) {
      setSaving(false);
      setError('Failed to add teacher. Please try again.');
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
  const validateForm = () => {
        
    // Basic validation
    if (!formData.firstName.trim()) {
        setError('First name is required');
        return false;
    }
    if(!formData.firstName.trim().match(/^[A-Za-z\s']{2,}$/)){
      setError('First name must contain only letters');
      return false;
    }
    if (!formData.lastName.trim()) {
        setError('Last name is required');
        return false;
    }
    if(!formData.lastName.trim().match(/^[A-Za-z\s']{1,}$/)){
      setError('Last name must contain only letters');
      return false;
    }
    if (!formData.email.trim()) {
        setError('Email is required');
        return false;
    }
    if (!formData.email.trim().match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      setError('Invalid email format');
      return false;
    }
   
    if (!formData.gender) {
        setError('Gender is required');
        return false;
    }
    if (!formData.dob) {
        setError('Date of birth is required');
        return false;
    }
    if (!formData.joinDate) {
        setError('Joining date is required');
        return false;
    }
    if (!formData.qualification.trim()) {
        setError('Qualification is required');
        return false;
    }
    
    if (!formData.phone.trim()) {
        setError('Phone number is required');
        return false;
    }
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        setError('Phone number must be 10 digits');
        return false;
    }
    
    // Address validation
    if (!formData.address.street.trim()) {
        setError('Street address is required');
        return false;
    }
    if (!formData.address.city.trim()) {
        setError('City is required');
        return false;
    }
    if (!formData.address.state.trim()) {
        setError('State is required');
        return false;
    }
    if (!formData.address.zipCode.trim()) {
        setError('Zip code is required');
        return false;
    }
    else if (!/^\d{5}$/.test(formData.address.zipCode.replace(/\D/g, ''))) {
      setError('Zip code must be 5 digits');
      return false;
  }

  if (formData.subjects.length > 2 || formData.subjects.length === 0  ) {
    setError('You can only assign up to 2 subjects');
    
    return false;
  }
  if(formData.subjects.length === 0){
    setError('Please assign at least one subject');
    return false;
  }
  const dobDate = new Date(formData.dob);
  const admissionDate = new Date(formData.admissionDate);
  const currentDate = new Date();

 

  // Date validation
  if (!formData.dob) {
    setError('Date of birth is required');
    return false;
  }

  if (!formData.joinDate) {
    setError('Joining date is required');
    return false;
  }

  // Check if dates are in the future
  if (dobDate > currentDate) {
    setError('Date of birth cannot be in the future');
    return false;
  }

  if (joinDate > currentDate) {
    setError('Joining date cannot be in the future');
    return false;
  }

  // Check if dob is before admission date
  if (dobDate >= joinDate) {
    setError('Date of birth must be before joining date');
    return false;
  }

  // Calculate age difference (minimum 3 years)
  const ageDiff = admissionDate.getFullYear() - dobDate.getFullYear();
  const monthDiff = admissionDate.getMonth() - dobDate.getMonth();
  
  // Adjust age if birthday hasn't occurred yet in the admission year
  const actualAge = monthDiff < 0 || 
                   (monthDiff === 0 && admissionDate.getDate() < dobDate.getDate()) 
                   ? ageDiff - 1 
                   : ageDiff;

  if (actualAge < 18) {
    setError('Teacher must be at least 18 years old at joining');
    return false;
  }
    
    
  setError('');
  return true;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/admin/teachers" className="text-blue-600 hover:text-blue-800 mr-4">
            <ArrowLeft className="inline mr-1" size={16} /> Back to Teachers
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800">Add New Teacher</h1>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

    

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Personal Information */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange} 
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
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
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dob">
                    Date of Birth *
                  </label>
                  <input
                    id="dob"
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="joinDate">
                    Joining Date *
                  </label>
                  <input
                    id="joinDate"
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleChange}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="qualification">
                    Qualification *
                  </label>
                  <input
                    id="qualification"
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="e.g., B.Ed, M.Ed, Ph.D"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="salary">
                    Salary
                  </label>
                  <input
                    id="salary"
                    type="number"
                    name="salary"
                    min="1000"
                    value={formData.salary}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experience">
                    Years of Experience
                  </label>
                  <input
                    id="experience"
                    type="number"
                    name="experience"
                    min="0"
                    max="30"
                    value={formData.experience}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
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
          <div className="p-6 flex justify-end">
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
                  Add Teacher
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddTeacher;