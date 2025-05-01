import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash, Mail, Phone, MapPin, Calendar, GraduationCap, Book, User, Users, Clock } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';
import { getUserRole } from '../../utils/auth';
const TeacherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [classes, setClasses] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const role = getUserRole(); // 'admin', 'teacher', etc.
  const classesLink = `/${role}-Teachers`;
  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      try {
        const response = await authAxios.get(`teachers/${id}`);
        if (!response.data.success) {
          throw new Error('Failed to fetch teacher details');
        }
        console.log(response.data.data)
        setTeacher(response.data.data);
        
        // Fetch classes taught by this teacher
        try {
          const classesResponse = await authAxios.get(`classes/teacher/${id}`);
          if (classesResponse.data.success) {
            setClasses(classesResponse.data.data);
          }
        } catch (err) {
          console.error('Error fetching classes:', err);
        }
        
        // Fetch timetable for this teacher
        try {
          const timetableResponse = await authAxios.get(`timetables/teacher/${id}`);
          if (timetableResponse.data.success) {
            setTimetable(timetableResponse.data.data);
          }
        } catch (err) {
          console.error('Error fetching timetable:', err);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching teacher details:', err);
        setError(err.message || 'Failed to load teacher details');
      } finally {
        setLoading(false);
      }
    };
  
    fetchTeacherData();
  }, [id]);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      try {
        const response = await authAxios.delete(`teachers/${id}`);
        if (response.data.success) {
          alert('Teacher deleted successfully');
          navigate('/admin-teachers');
        } else {
          throw new Error('Failed to delete teacher');
        }
      } catch (err) {
        console.error('Error deleting teacher:', err);
        setError(err.message || 'Failed to delete teacher');
      }
    }
  };
  
  if (loading) {
    return (
    
        <div className="w-full p-6 bg-gray-50">
          <div className="w-full bg-white rounded-lg shadow-sm p-6 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading teacher details...</p>
            </div>
          </div>
        </div>
     
    );
  }
  
  if (error) {
    return (
    
        <div className="w-full p-6 bg-gray-50">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
          <Link to="/admin-teachers" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Teachers
          </Link>
        </div>
     
    );
  }
  
  if (!teacher) {
    return (
    
        <div className="w-full p-6 bg-gray-50">
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-6">
            Teacher not found
          </div>
          <Link to="/admin-teachers" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Teachers
          </Link>
        </div>
     
    );
  }
  
  return (
   
      <div className="w-full p-6 bg-gray-50">
        {/* Header with actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/admin-teachers" className="text-blue-600 hover:text-blue-800 flex items-center mr-4">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Teachers
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              {teacher.firstName} {teacher.lastName}
            </h1>
          </div>
          
         
        </div>
        
        {/* Teacher Profile Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 md:mb-0 md:mr-6 flex-shrink-0">
                {teacher.imageUrl ? (
                  <img
                    src={teacher.imageUrl.secure_url || teacher.imageUrl}
                    alt={`${teacher.firstName} ${teacher.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-2xl font-bold">
                    {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      {teacher.firstName} {teacher.lastName}
                    </h2>
                    <p className="text-gray-600 mb-2">
                      {teacher.subjects?.map(s => s.name).join(', ')} Teacher
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        ID: {teacher.employeeId}
                      </span>
                      <span className={`bg-${teacher.status === 'Active' ? 'green' : 'yellow'}-100 text-${teacher.status === 'Active' ? 'green' : 'yellow'}-800 text-xs font-medium px-2.5 py-0.5 rounded`}>
                        {teacher.status}
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {teacher.type || 'Full-time'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center">
                        <Mail className="text-gray-500 mr-2" size={16} /> 
                        <span className="text-sm text-gray-700">{teacher.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="text-gray-500 mr-2" size={16} /> 
                        <span className="text-sm text-gray-700">{teacher.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="text-gray-500 mr-2" size={16} /> 
                        <span className="text-sm text-gray-700">
                          Joined: {new Date(teacher.joinDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('personal')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'personal'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="inline-block h-5 w-5 mr-2" />
                Personal Info
              </button>
              
              <button
                onClick={() => setActiveTab('classes')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'classes'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="inline-block h-5 w-5 mr-2" />
                Classes & Subjects
              </button>
              
              <button
                onClick={() => setActiveTab('timetable')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'timetable'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="inline-block h-5 w-5 mr-2" />
                Timetable
              </button>
              
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'performance'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <GraduationCap className="inline-block h-5 w-5 mr-2" />
                Performance
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Basic Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500">Full Name</label>
                          <div className="text-sm font-medium text-gray-800">
                            {teacher.firstName} {teacher.lastName}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Date of Birth</label>
                          <div className="text-sm font-medium text-gray-800">
                            {teacher.dob ? new Date(teacher.dob).toLocaleDateString() : 'Not specified'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Gender</label>
                          <div className="text-sm font-medium text-gray-800">{teacher.gender}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Marital Status</label>
                          <div className="text-sm font-medium text-gray-800">{teacher.maritalStatus || 'Not specified'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500">Email Address</label>
                          <div className="text-sm font-medium text-gray-800">{teacher.email}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Phone Number</label>
                          <div className="text-sm font-medium text-gray-800">{teacher.phone}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Address</label>
                          <div className="text-sm font-medium text-gray-800">
                            {teacher.address ? (
                              <>
                                {teacher.address.street}, {teacher.address.city}, {teacher.address.state} {teacher.address.zipCode}
                              </>
                            ) : (
                              'Address not specified'
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Employment Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Employee ID</label>
                        <div className="text-sm font-medium text-gray-800">{teacher.employeeId}</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Join Date</label>
                        <div className="text-sm font-medium text-gray-800">
                          {new Date(teacher.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Employment Type</label>
                        <div className="text-sm font-medium text-gray-800">{teacher.type || 'Full-time'}</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Qualification</label>
                        <div className="text-sm font-medium text-gray-800">{teacher.qualification}</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Experience</label>
                        <div className="text-sm font-medium text-gray-800">{teacher.experience} years</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Status</label>
                        <div className="text-sm font-medium text-gray-800">{teacher.status}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Classes & Subjects Tab */}
            {activeTab === 'classes' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Classes & Subjects</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-700 mb-1">Class Teacher</h4>
                    {teacher.isClassTeacher ? (
                      <div>
                        <p className="text-2xl font-bold text-blue-800">Grade {teacher.classTeacherFor?.grade} - {teacher.classTeacherFor?.section}</p>
                        <Link to={`/admin-classes/view/${teacher.classTeacherFor?._id}`} className="text-sm text-blue-600 hover:underline">
                          View Class
                        </Link>
                      </div>
                    ) : (
                      <p className="text-xl font-medium text-blue-800">Not a class teacher</p>
                    )}
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-700 mb-1">Subjects</h4>
                    <p className="text-2xl font-bold text-green-800">{teacher.subjects?.length || 0}</p>
                    <p className="text-sm text-green-600">Subjects taught</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-700 mb-1">Classes</h4>
                    <p className="text-2xl font-bold text-purple-800">{classes.length}</p>
                    <p className="text-sm text-purple-600">Classes taught</p>
                  </div>
                </div>
                
                <h4 className="text-sm font-medium text-gray-700 mb-3">Subjects Taught</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {teacher.subjects && teacher.subjects.length > 0 ? (
                    teacher.subjects.map((subject, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h5 className="text-lg font-medium text-gray-800">{subject.name}</h5>
                        <p className="text-sm text-gray-500">Code: {subject.code}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {subject.department && (
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {subject.department}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-4 text-gray-500">
                      No subjects assigned to this teacher
                    </div>
                  )}
                </div>
                
                <h4 className="text-sm font-medium text-gray-700 mb-3">Classes Taught</h4>
                {classes && classes.length > 0 ? (
                  <div className="overflow-x-auto bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {classes.map((cls, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">Grade {cls.grade} - {cls.section}</div>
                              <div className="text-sm text-gray-500">{cls.students?.length || 0} students</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {cls.subject ? (
                                <div className="text-sm text-gray-900">{cls.subject.name}</div>
                              ) : (
                                <div className="text-sm text-gray-500">Multiple subjects</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {cls.schedule || 'Schedule not available'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                              <Link to={`/admin-classes/view/${cls._id}`} className="text-blue-600 hover:text-blue-900">
                                View Class
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No classes assigned to this teacher
                  </div>
                )}
              </div>
            )}
            
            {/* Timetable Tab */}
            {activeTab === 'timetable' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Timetable</h3>
                
                {timetable ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                            Periods
                          </th>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                            <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5, 6, 7].map(periodNum => (
                          <tr key={periodNum} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap border-r">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">Period {periodNum}</span>
                                <span className="text-xs text-gray-500">
                                  {timetable.periods?.find(p => p.periodNumber === periodNum)?.startTime} - 
                                  {timetable.periods?.find(p => p.periodNumber === periodNum)?.endTime}
                                </span>
                              </div>
                            </td>
                            
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                              const periodData = timetable.schedule?.find(s => 
                                s.day === day && s.periodNumber === periodNum
                              );
                              
                              return (
                                <td key={`${day}-${periodNum}`} className="px-4 py-3 text-center border-r">
                                  {periodData ? (
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {periodData.subject?.name || 'N/A'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Grade {periodData.class?.grade} - {periodData.class?.section}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No timetable available for this teacher
                  </div>
                )}
              </div>
            )}
            
            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance & Evaluations</h3>
                
                {teacher.performance ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <h4 className="text-sm font-medium text-blue-700 mb-1">Overall Rating</h4>
                        <p className="text-2xl font-bold text-blue-800">{teacher.performance.rating}/5</p>
                        <div className="flex justify-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star}
                              className={`h-5 w-5 ${star <= teacher.performance.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <h4 className="text-sm font-medium text-green-700 mb-1">Attendance</h4>
                        <p className="text-2xl font-bold text-green-800">{teacher.performance.attendance}%</p>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <h4 className="text-sm font-medium text-purple-700 mb-1">Student Success</h4>
                        <p className="text-2xl font-bold text-purple-800">{teacher.performance.studentSuccess}%</p>
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Evaluations</h4>
                    <div className="overflow-x-auto bg-white">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {teacher.performance.evaluations?.map((evaluation, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(evaluation.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {evaluation.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg 
                                      key={star}
                                      className={`h-4 w-4 ${star <= evaluation.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{evaluation.comments}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No performance data available for this teacher
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
  
  );
};

export default TeacherDetails; 