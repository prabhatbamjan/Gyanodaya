import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash, Mail, Phone, MapPin, Calendar, GraduationCap, Book, User, Users } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';
import Loader from '../../components/Loader';

const TeacherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  
  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      try {
        const response = await authAxios.get(`teachers/${id}`);
        console.log(response.data);
        setTeacher(response.data);
      } catch (err) {
        setError('Failed to fetch teacher details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchTeacherData();
  }, [id]);
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      // In a real application, this would be an API call:
      // await axios.delete(`/api/teachers/${id}`);
      
      alert('Teacher deleted successfully');
      navigate('/admin-teachers');
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Loader text="Loading teacher data..." />
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
          <Link to="/admin-teachers" className="text-blue-600 hover:text-blue-800">
            <ArrowLeft className="inline mr-1" size={16} /> Back to Teachers
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link to="/admin-teachers" className="text-blue-600 hover:text-blue-800 flex items-center">
              <ArrowLeft className="mr-1" size={16} /> Back to Teachers
            </Link>
            <h1 className="text-2xl font-semibold text-gray-800 ml-4">Teacher Details</h1>
          </div>
          
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Teacher profile header */}
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              {/* <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-100 rounded-full flex-shrink-0 overflow-hidden mb-4 md:mb-0 md:mr-6">
                {teacher.profileImg ? (
                  <img 
                    
                    alt={`${teacher.firstName} ${teacher.lastName}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-200 text-blue-600 text-2xl font-bold">
                    {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                  </div>
                )}
              </div> */}
              
              <div className="flex-grow text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                  {teacher.firstName} {teacher.lastName}
                </h2>
                <p className="text-gray-600 mb-2">{teacher.subjects.map(s => s.name).join(', ')} Teacher</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    ID: {teacher.employeeId}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    teacher.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {teacher.status}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 ml-auto flex-shrink-0">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center mb-2">
                    <Mail className="text-gray-500 mr-2" size={16} /> 
                    <span>{teacher.email}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Phone className="text-gray-500 mr-2" size={16} /> 
                    <span>{teacher.phone}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Calendar className="text-gray-500 mr-2" size={16} /> 
                    <span>Joined: {new Date(teacher.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap">
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'personal'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('personal')}
              >
                Personal Info
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'classes'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('classes')}
              >
                Classes & Subjects
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'timetable'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('timetable')}
              >
                Timetable
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'performance'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('performance')}
              >
                Performance
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div className="p-6">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="py-2 text-gray-600 font-medium">Full Name</td>
                          <td className="py-2 text-gray-800">{teacher.firstName} {teacher.lastName}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600 font-medium">Gender</td>
                          <td className="py-2 text-gray-800">{teacher.gender}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600 font-medium">Date of Birth</td>
                          <td className="py-2 text-gray-800">{new Date(teacher.dob).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600 font-medium">Email</td>
                          <td className="py-2 text-gray-800">{teacher.email}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600 font-medium">Phone</td>
                          <td className="py-2 text-gray-800">{teacher.phone}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="py-2 text-gray-600 font-medium">Employee ID</td>
                          <td className="py-2 text-gray-800">{teacher.employeeId}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600 font-medium">Qualification</td>
                          <td className="py-2 text-gray-800">{teacher.qualification}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600 font-medium">Experience</td>
                          <td className="py-2 text-gray-800">{teacher.experience} years</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600 font-medium">Joining Date</td>
                          <td className="py-2 text-gray-800">{new Date(teacher.joinDate).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600 font-medium">Status</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              teacher.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {teacher.status}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Contact Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start mb-2">
                    <MapPin className="text-gray-500 mr-2 mt-1" size={18} />
                    <div>
                      <p className="text-gray-800">{teacher.address.street}</p>
                      <p className="text-gray-800">{teacher.address.city}, {teacher.address.state}, {teacher.address.zipCode}</p>
                      <p className="text-gray-800">{teacher.address.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <Mail className="text-gray-500 mr-2" size={18} />
                    <a href={`mailto:${teacher.email}`} className="text-blue-600 hover:underline">{teacher.email}</a>
                  </div>
                  <div className="flex items-center mt-2">
                    <Phone className="text-gray-500 mr-2" size={18} />
                    <a href={`tel:${teacher.phone}`} className="text-blue-600 hover:underline">{teacher.phone}</a>
                  </div>
                </div>
              </div>
            )}
            
            {/* Classes & Subjects Tab */}
            {activeTab === 'classes' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Teaching Subjects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {teacher.subjects.map(subject => (
                    <div key={subject._id} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center">
                        <Book className="text-blue-600 mr-3" size={20} />
                        <h4 className="text-lg font-medium text-gray-800">{subject.name}</h4>
                      </div>
                    </div>
                  ))}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Assigned Classes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teacher.classes.map(cls => (
                    <div key={cls._id} className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="flex items-center">
                        <Users className="text-green-600 mr-3" size={20} />
                        <div>
                          <h4 className="text-lg font-medium text-gray-800">{cls.name}</h4>
                          <p className="text-gray-600">Grade {cls.grade}, Section {cls.section}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Timetable Tab */}
            {activeTab === 'timetable' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Timetable</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Day
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Period 1
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Period 2
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Period 3
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Period 4
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Period 5
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Period 6
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {teacher.timetable.map((day, index) => (
                        <tr key={day.day} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 border-r">
                            {day.day}
                          </td>
                          {Array.from({ length: 6 }, (_, i) => i + 1).map(period => {
                            const periodData = day.periods.find(p => p.period === period);
                            return (
                              <td key={`${day.day}-${period}`} className="py-3 px-4 text-sm text-gray-500 border-r">
                                {periodData ? (
                                  <div>
                                    <div className="font-medium text-gray-800">{periodData.subject}</div>
                                    <div className="text-xs text-gray-500">{periodData.class}</div>
                                    <div className="text-xs text-gray-400">{periodData.time}</div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Free</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-500 text-sm">Attendance Rate</h4>
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex items-end">
                      <p className="text-3xl font-bold text-gray-800">{teacher.performance.attendance}%</p>
                      <p className="text-sm text-green-500 ml-2">+2.5%</p>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${teacher.performance.attendance}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-500 text-sm">Classes Handled</h4>
                      <Book className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{teacher.performance.classesHandled}</p>
                    <p className="text-sm text-gray-500 mt-1">Last semester</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-500 text-sm">Students Performance</h4>
                      <GraduationCap className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex items-end">
                      <p className="text-3xl font-bold text-gray-800">{teacher.performance.studentsPerformance}%</p>
                      <p className="text-sm text-green-500 ml-2">+3.2%</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Average passing rate</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-500 text-sm">Feedback Rating</h4>
                      <User className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex items-end">
                      <p className="text-3xl font-bold text-gray-800">{teacher.performance.feedback}</p>
                      <p className="text-sm text-gray-500 ml-2">/5</p>
                    </div>
                    <div className="flex mt-2 text-yellow-500">
                      {'★'.repeat(Math.floor(teacher.performance.feedback))}
                      {teacher.performance.feedback % 1 >= 0.5 ? '½' : ''}
                      {'☆'.repeat(5 - Math.ceil(teacher.performance.feedback))}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Monthly Performance</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <p className="text-gray-500 mb-4">Performance data visualization would be displayed here.</p>
                  <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                    <p className="text-gray-400">Chart Placeholder</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherDetails; 