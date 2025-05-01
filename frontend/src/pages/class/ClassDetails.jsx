import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash, Users, BookOpen, Calendar, Clock, Home, Eye, Plus } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';
import {getUserRole}  from '../../utils/auth';

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const role = getUserRole(); // 'admin', 'teacher', etc.
const classesLink = `/${role}-classes`; 


  useEffect(() => {
    const fetchClassDetails = async () => {
      setLoading(true);
      try {
        // Fetch class details
        const classResponse = await authAxios.get(`classes/${id}`);
        
        if (!classResponse.data.success) {
          throw new Error('Failed to fetch class details');
        }
        
        setClassData(classResponse.data.data);
        
        // Fetch students in this class
        if (classResponse.data.data.students && classResponse.data.data.students.length > 0) {
          const studentsResponse = await authAxios.get(`students/class/${id}`);
          if (studentsResponse.status ===200) {
            setStudents(studentsResponse.data.data);
          }
        }
        
        // Fetch timetable for this class
        try {
          const timetableResponse = await authAxios.get(`timetables/class/${id}`);
          if (timetableResponse.status === 200) {
            console.log("Timetable data received:", timetableResponse.data.data);
            setTimetable(timetableResponse.data.data);
          }
        } catch (timetableErr) {
          console.error('Error fetching timetable:', timetableErr);
          // Continue with other data even if timetable fails
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching class details:', err);
        setError(err.message || 'Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [id]);



  if (loading) {
    return (
    
        <div className="w-full p-6 bg-gray-50">
          <div className="w-full bg-white rounded-lg shadow-sm p-6 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading class details...</p>
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
          <Link to="/admin-classes" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Classes
          </Link>
        </div>
     
    );
  }

  if (!classData) {
    return (
    
        <div className="w-full p-6 bg-gray-50">
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-6">
            Class not found
          </div>
          <Link to="/admin-classes" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Classes
          </Link>
        </div>
   
    );
  }

  return (
    
      <div className="w-full p-6 bg-gray-50">
        {/* Header with actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to={classesLink} className="text-blue-600 hover:text-blue-800 flex items-center mr-4">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Classes
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              Class {classData.name}{classData.section ? `-${classData.section}` : ''}
            </h1>
          </div>
          
          
        </div>
        
        {/* Class Info Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Class Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Class & Section</h3>
                <p className="text-lg font-medium text-gray-900">
                  Grade {classData.grade} - {classData.section}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Room Number</h3>
                <div className="flex items-center">
                  <Home className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-lg font-medium text-gray-900">{classData.roomNumber || 'Not assigned'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Academic Year</h3>
                <p className="text-lg font-medium text-gray-900">{classData.academicYear}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Class Teacher</h3>
                {classData.classTeacher ? (
                  <Link 
                    to={`/admin-teachers/view/${classData.classTeacher._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {classData.classTeacher.firstName} {classData.classTeacher.lastName}
                  </Link>
                ) : (
                  <p className="text-gray-500">Not assigned</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Capacity</h3>
                <p className="text-lg font-medium text-gray-900">{classData.capacity} students</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Current Enrollment</h3>
                <p className="text-lg font-medium text-gray-900">
                  {classData.students?.length || 0} students
                  {classData.capacity && classData.students?.length ? ` (${Math.round((classData.students.length / classData.capacity) * 100)}% full)` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'students'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="inline-block h-5 w-5 mr-2" />
                Students
              </button>
              
              <button
                onClick={() => setActiveTab('subjects')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'subjects'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="inline-block h-5 w-5 mr-2" />
                Subjects
              </button>
              
              <button
                onClick={() => setActiveTab('timetable')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'timetable'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="inline-block h-5 w-5 mr-2" />
                Timetable
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Students Tab */}
            {activeTab === 'students' && (
              <div>
               
                
                {students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No students enrolled in this class yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                        
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gender
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr key={student._id} className="hover:bg-gray-50">
                          
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 mr-3">
                                  {student.profilePicture ? (
                                    <img
                                      src={student.profilePicture}
                                      alt={`${student.firstName} ${student.lastName}`}
                                      className="h-8 w-8 rounded-full"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-sm font-medium text-blue-600">
                                        {student.firstName?.[0]}{student.lastName?.[0]}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{student.gender}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{student.parent.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Link
                                to={`/admin-students/view/${student._id}`}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* Subjects Tab */}
            {activeTab === 'subjects' && (
              <div>
              
                
                {!classData.subjects || classData.subjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No subjects assigned to this class yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classData.subjects.map((subject) => (
                      <div key={subject._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800">{subject.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">Code: {subject.code}</p>
                        
                        
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Timetable Tab */}
            {activeTab === 'timetable' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Class Timetable</h3>
                  <Link 
                    to={`/admin-timetable/view/${id}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Full Timetable
                  </Link>
                </div>
                
                {!timetable || timetable.length === 0 ? (
                  <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg text-center">
                    <p className="mb-2">No timetable has been created for this class yet.</p>
                    {role === 'admin' && (
                      <Link 
                        to={`/admin-timetable/add?classId=${id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Timetable
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Day
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Periods
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {timetable.map((daySchedule, index) => (
                          <tr key={daySchedule._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {daySchedule.day}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {daySchedule.periods && daySchedule.periods.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {daySchedule.periods
                                    .sort((a, b) => a.periodNumber - b.periodNumber)
                                    .map((period, idx) => (
                                      <div key={idx} className="bg-gray-50 p-2 rounded">
                                        <div className="font-medium">Period {period.periodNumber}</div>
                                        <div className="text-xs text-gray-600">
                                          {period.subject?.name || "Unknown Subject"}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {period.teacher ? 
                                            `${period.teacher.firstName} ${period.teacher.lastName}` : 
                                            "Not assigned"}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {period.startTime} - {period.endTime}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">No periods scheduled</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {timetable.length === 0 && (
                          <tr>
                            <td colSpan="2" className="px-4 py-4 text-center text-sm text-gray-500">
                              No timetable data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    
  );
};

export default ClassDetails; 