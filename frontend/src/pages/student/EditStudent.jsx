import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Info } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const EditStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const fetchData = async () => {
      try {
        // Fetch classes
        const classesResponse = await authAxios.get('classes/');
        setClasses(classesResponse.data.data);
        
        // Fetch student data
        const studentResponse = await authAxios.get(`students/edit/${id}`);
        const studentData = studentResponse.data.data;
        console.log(studentData);
        
        // Map the student data to formData structure
        setFormData({
          firstName: studentData.student.firstName || '',
          lastName: studentData.student.lastName || '',
          email: studentData.student.email || '',
          dob: studentData.student.dateOfBirth ? studentData.student.dateOfBirth.split('T')[0] : '',
          gender: studentData.student.gender || '',
          classId: studentData.student.classId?._id || '',
          bloodGroup: studentData.student.bloodGroup || '',
          admissionDate: studentData.student.admissionDate ? studentData.student.admissionDate.split('T')[0] : '',
          address: studentData.student.address.street || '',
          city: studentData.student.address.city || '',
          state: studentData.student.address.state || '',
          zipCode: studentData.student.address.zipCode || '',
          country: studentData.student.address.country || 'Nepal',
          parentfirstName: studentData.parent?.firstName || '',
          parentlastName: studentData.parent?.lastName || '',
          parentemail: studentData.parent?.email || '',
          parentphone: studentData.parent?.phone || '',
          parentoccupation: studentData.parent?.occupation || '',
          parentrelation: studentData.parent?.relationship || 'parent',
        });
        
        if (studentData.profileImage) {
          setImagePreview(studentData.profileImage);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
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
      const response = await authAxios.put(`students/${id}`, formData);
      if(response.status === 200){
        navigate('/admin-students');
      }
    } catch (err) {
      setSaving(false);
      setError(err.response?.data?.message || 'Failed to update student');
    }
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.firstName.trim()) {
        setError('First name is required');
        return false;
    }
    if (!formData.lastName.trim()) {
        setError('Last name is required');
        return false;
    }
    if (!formData.email.trim()) {
        setError('Email is required');
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
    if(!formData.parentlastName.trim()){
      setError('Parent last name is required');
      return false;
    }
    if(!formData.parentemail.trim()){
      setError('Parent email is required');
      return false;
    }
    if(!formData.parentoccupation.trim()){
      setError('Parent occupation is required');
      return false;
    }
    
    const dobDate = new Date(formData.dob);
    const admissionDate = new Date(formData.admissionDate);
    const currentDate = new Date();

    if (!formData.dob) {
      setError('Date of birth is required');
      return false;
    }

    if (!formData.admissionDate) {
      setError('Admission date is required');
      return false;
    }

    if (dobDate > currentDate) {
      setError('Date of birth cannot be in the future');
      return false;
    }

    if (admissionDate > currentDate) {
      setError('Admission date cannot be in the future');
      return false;
    }

    if (dobDate >= admissionDate) {
      setError('Date of birth must be before admission date');
      return false;
    }

    const ageDiff = admissionDate.getFullYear() - dobDate.getFullYear();
    const monthDiff = admissionDate.getMonth() - dobDate.getMonth();
    
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
          <Loader text="Loading student data..." />
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
          <h1 className="text-2xl font-semibold text-gray-800">Edit Student</h1>
        </div>

        {noClassesFound && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 flex items-start" role="alert">
            <Info className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <p className="font-bold">No classes found!</p>
              <p>You need to create classes before editing students.</p>
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
                    readOnly
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
                    readOnly
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
                    readOnly
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
                    readOnly
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
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dob">
                    Class * 
                  </label>
                  <input
                    id="classId"
                    type="text"
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    readOnly
                  />
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
                  readOnly
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Update Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditStudent;