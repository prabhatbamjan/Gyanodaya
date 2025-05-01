import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Info } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const AddStudent = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [noClassesFound, setNoClassesFound] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',  
    dob: '',
    gender: '',
    classId: '',
    bloodGroup: '',
    admissionDate: '',
    address: '',     
    city: '',
    state: '',
    zipCode: '',
    country: 'Nepal',     
    parentfirstName: '',
    parentlastName: '',
    parentemail: '',
    parentphone: '',
    parentoccupation: '',
    parentrelation: 'parent',
  });

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await authAxios.get('classes/');
        setClasses(response.data.data);
      } catch (err) {
        setError(err.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
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
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (!validateForm()) {
      setSaving(false);
      return;
    }

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add all text fields to FormData
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('dob', formData.dob);
      formDataToSend.append('bloodGroup', formData.bloodGroup);
      formDataToSend.append('admissionDate', formData.admissionDate);
      formDataToSend.append('classId', formData.classId);
      
      // Add address fields
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('zipCode', formData.zipCode);
      formDataToSend.append('country', formData.country);
      
      // Add parent fields
      formDataToSend.append('parentfirstName', formData.parentfirstName);
      formDataToSend.append('parentlastName', formData.parentlastName);
      formDataToSend.append('parentemail', formData.parentemail);
      formDataToSend.append('parentphone', formData.parentphone);
      formDataToSend.append('parentoccupation', formData.parentoccupation);
      formDataToSend.append('parentrelation', formData.parentrelation);
      
      // Add the image file if selected
      if (profileImage) {
        formDataToSend.append('image', profileImage);
      } else {
        setSaving(false);
        setError('Please upload a profile image');
        return;
      }
      
      console.log('Sending student data');
      
      // Send the form data to the server
      const response = await authAxios.post('students/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log(response.data);
      
      if(response.status === 201){
        alert('Student added successfully!');
        navigate('/admin-students');
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response && err.response.data) {
        console.error('Server response:', err.response.data);
        setError(err.response.data.message || 'Failed to add student. Please try again.');
      } else {
        setError(err.message || 'Failed to add student. Please try again.');
      }
      setSaving(false);
    }
  };

  const validateForm = () => {
    // Image validation
    if (!profileImage) {
      setError('Please upload a profile image');
      return false;
    }
        
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
    if(!formData.bloodGroup){
      setError('Blood group is required');
      return false;
    }
    if (!formData.classId) {
        setError('Class is required');
        return false;
    }
    
    if (!formData.parentphone.trim()) {
        setError('Phone number is required');
        return false;
    }
    else if (!/^\d{10}$/.test(formData.parentphone.replace(/\D/g, ''))) {
        setError('Phone number must be 10 digits');
        return false;
    }
    
    // Address validation
    if (!formData.address.trim()) {
        setError('Street address is required');
        return false;
    }
    if (!formData.city.trim()) {
        setError('City is required');
        return false;
    }
    if (!formData.state.trim()) {
        setError('State is required');
        return false;
    }
    if (!formData.zipCode.trim()) {
        setError('Zip code is required');
        return false;
    }
    else if (!/^\d{5}$/.test(formData.zipCode.replace(/\D/g, ''))) {
      setError('Zip code must be 5 digits');
      return false;
  }
  if(!formData.country.trim()){
    setError('Country is required');
    return false;
  }
  if(!formData.parentrelation.trim()){
    setError('Relation is required');
    return false;
  }
  if(!formData.parentfirstName.trim()){
    setError('Parent first name is required');
    return false;
  }
  if(!formData.parentfirstName.trim().match(/^[A-Za-z\s']{2,}$/)){
    setError('Parent first name must contain only letters');
    return false;
  }
  if(!formData.parentlastName.trim()){
    setError('Parent last name is required');
    return false;
  }
  if(!formData.parentlastName.trim().match(/^[A-Za-z\s']{1,}$/)){
    setError('Parent last name must contain only letters');
    return false;
  }
  if(!formData.parentemail.trim()){
    setError('Parent email is required');
    return false;
  }
  if (!formData.parentemail.trim().match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
    setError('Invalid email format');
    return false;
  }
  if(!formData.parentoccupation.trim()){
    setError('Parent occupation is required');
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

  if (!formData.admissionDate) {
    setError('Admission date is required');
    return false;
  }

  // Check if dates are in the future
  if (dobDate > currentDate) {
    setError('Date of birth cannot be in the future');
    return false;
  }

  if (admissionDate > currentDate) {
    setError('Admission date cannot be in the future');
    return false;
  }

  // Check if dob is before admission date
  if (dobDate >= admissionDate) {
    setError('Date of birth must be before admission date');
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

  if (actualAge < 3) {
    setError('Student must be at least 3 years old at admission');
    return false;
  }
 

  
    
    
  setError('');
  return true;
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Loader text="Loading form..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/admin-students" className="text-blue-600 hover:text-blue-800 mr-4">
            <ArrowLeft className="inline mr-1" size={16} /> Back to Students
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800">Add New Student</h1>
        </div>

        {noClassesFound && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 flex items-start" role="alert">
            <Info className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <p className="font-bold">No classes found!</p>
              <p>You need to create classes before adding students. Students must be assigned to a class.</p>
              <Link to="/admin-classes" className="mt-2 inline-block text-blue-600 underline">
                Add a class now
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Profile Image Upload */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Profile Image</h2>
            <div className="flex flex-col items-center mb-4">
              <div className="mb-4 w-40 h-40 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden bg-gray-100">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center justify-center">
                    <Upload size={40} />
                    <span className="text-sm mt-2">No image</span>
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center">
                <Upload size={16} className="mr-2" />
                {imagePreview ? 'Change Photo' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Max size: 2MB. Formats: JPG, PNG</p>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>

              <div>
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
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dob">
                    Admission Date * 
                  </label>
                  <input
                    id="admissionDate"
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bloodGroup">
                    Blood Group
                  </label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="classId">
                      Class <span className="text-red-500">*</span>
                    </label>
                    {classes.length > 0 ? (
                      <select
                        id="classId"
                        name="classId"
                        value={formData.classId}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      >
                        <option value="">Select Class</option>
                        {classes.map(cls => (
                          <option key={cls._id} value={cls._id}>
                            class{cls.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-gray-100 rounded border border-gray-300 text-gray-600">
                        No classes available. Please add classes first.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                  Address *
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="state">
                  State *
                </label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="zipCode">
                  Zip Code *
                </label>
                <input
                  id="zipCode"
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Parent Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parentfirstName">
                  Parent First Name *
                </label>
                <input
                  id="parentfirstName"
                  type="text"
                  name="parentfirstName"
                  value={formData.parentfirstName}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parentlastName">
                  Parent Last Name *
                </label>
                <input
                  id="parentlastName"
                  type="text"
                  name="parentlastName"
                  value={formData.parentlastName}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parentemail">
                  Parent Email *
                </label>
                <input
                  id="parentemail"
                  type="email"
                  name="parentemail"
                  value={formData.parentemail}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parentphone">
                  Parent Phone *
                </label>
                <input
                  id="parentphone"
                  type="text"
                  name="parentphone"
                  value={formData.parentphone}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parentoccupation">
                  Parent Occupation
                </label>
                <input
                  id="parentoccupation"
                  type="text"
                  name="parentoccupation"
                  value={formData.parentoccupation}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parentrelation">
                  Relation to Student
                </label>
                <select
                  id="parentrelation"
                  name="parentrelation"
                  value={formData.parentrelation}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="parent">Parent</option>
                  <option value="guardian">Guardian</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 flex justify-end">
            <button
              type="submit"
              disabled={saving || classes.length === 0}
              className={`
                bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none flex items-center
                ${(saving || classes.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Add Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddStudent;