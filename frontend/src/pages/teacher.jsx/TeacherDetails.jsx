import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash, Mail, Phone, MapPin, Calendar, GraduationCap, Book, User, Users, Clock } from 'lucide-react';
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
  
        setTeacher(response.data.data);
  
        // Fetch classes taught by this teacher
        try {
          const classesResponse = await authAxios.get(`classes/`);
          if (classesResponse.data.success) {
            const fetchedClasses = classesResponse.data.data;
            setClasses(fetchedClasses);
  
            
           
            }
        } catch (err) {
          console.error('Error fetching classes:', err);
        }
  
        // Fetch timetable for this teacher
        try { 
          const timetableResponse = await authAxios.get(`timetables/teacher/${id}`);
          if (timetableResponse.data.success) {
            console.log(timetableResponse.data.data)
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

  const isClassTeacher = (teacherId, classes) => {
    const filteredClasses = classes.filter(
      cls => cls.classTeacher && cls.classTeacher._id === teacherId
    );
  
    const isTeacher = filteredClasses.length > 0;
    const classNames = filteredClasses.map(cls => cls.name);
    const classSection = filteredClasses.map(cls => cls.section);
  

    return { isTeacher, classNames, classSection };
  };
  
 const subjectClassMap = Array.isArray(timetable)
  ? [
      ...new Map(
        timetable
          .flatMap(entry =>
            (entry.periods || [])
              .filter(period => period.subject)
              .map(period => ({
                subjectName: period.subject.name || 'Unnamed Subject',
                className: `Grade ${entry.class.grade} - ${entry.class.section}`,
              }))
          )
          .map(item => [`${item.subjectName}-${item.className}`, item]) // key by unique combo
      ).values()
    ]
  : [];
 

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
          <Link to={classesLink} className="text-blue-600 hover:text-blue-800 flex items-center">
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
                        <label className="block text-xs text-gray-500">Join Date</label>
                        <div className="text-sm font-medium text-gray-800">
                          {new Date(teacher.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                    
                      <div>
                        <label className="block text-xs text-gray-500">Qualification</label>
                        <div className="text-sm font-medium text-gray-800">{teacher.qualification}</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Experience</label>
                        <div className="text-sm font-medium text-gray-800">{teacher.experience} years</div>
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
                    { isClassTeacher(id, classes).isTeacher ? (
                      <div>
                        <p className="text-2xl font-bold text-blue-800">Grade {isClassTeacher(id, classes).classNames[0]} - {isClassTeacher(id, classes).classSection[0]}</p>
                       
                      </div>
                    ) : (
                      <p className="text-xl font-medium text-blue-800">Not a class teacher</p>
                    )}
                  </div>
                  
                 
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-700 mb-1">Classes</h4>
                    <p className="text-2xl font-bold text-purple-800">{classes.length}</p>
                    <p className="text-sm text-purple-600">Classes taught</p>
                  </div>
                </div>
                
           
                <h4 className="text-sm font-medium text-gray-700 mb-3">Classes Taught</h4>
                {subjectClassMap && subjectClassMap.length > 0 ? (
                  <div className="overflow-x-auto bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          

                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subjectClassMap.map((cls, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{cls.className}</div>
                             
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {cls.subjectName ? (
                                <div className="text-sm text-gray-900">{cls.subjectName}</div>
                              ) : (
                                <div className="text-sm text-gray-500">Multiple subjects</div>
                              )}
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
                  <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                            <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((periodNumber) => (
                          <tr key={periodNumber}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Period {periodNumber}
                            </td>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                              const daySchedule = timetable.find(t => t.day === day);
                              const periodData = daySchedule?.periods?.find(p => p.periodNumber === periodNumber);
                              
                              return (
                                <td key={`${periodNumber}-${day}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {periodData ? (
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {periodData.subject?.name || 'N/A'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {periodData.startTime} - {periodData.endTime}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Grade {periodData.class?.grade} {periodData.class?.section}
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
            
         
          </div>
        </div>
      </div>
  
  );
};

export default TeacherDetails; 