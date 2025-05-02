import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash, Mail, Phone, MapPin, Calendar, GraduationCap, User, Book } from 'lucide-react';

import authAxios from '../../utils/auth';
import { getUserRole } from '../../utils/auth';
const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [attendanceData, setAttendanceData] = useState(null);
  const [feesData, setFeesData] = useState(null);
 const role = getUserRole(); // 'admin', 'teacher', etc.
  const classesLink = `/${role}-students`;
  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const response = await authAxios.get(`students/${id}`);
        if (!response.data.success) {
          throw new Error('Failed to fetch student details');
        }
        
        setStudent(response.data.data);
        
        // Fetch attendance data
        // try {
        //   const attendanceResponse = await authAxios.get(`attendance/student/${id}`);
        //   if (attendanceResponse.data.success) {
        //     setAttendanceData(attendanceResponse.data.data);
        //   }
        // } catch (err) {
        //   console.error('Error fetching attendance:', err);
        // }
        setAttendanceData(10);
        // Fetch fees data
        // try {
        //   const feesResponse = await authAxios.get(`fees/student/${id}`);
        //   if (feesResponse.data.success) {
        //     setFeesData(feesResponse.data.data);
        //   }
        // } catch (err) {
        //   console.error('Error fetching fees:', err);
        // }
        setFeesData(2000);
        setError(null);
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError(err.message || 'Failed to load student details');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);


  if (loading) {
    return (
      
        <div className="w-full p-6 bg-gray-50">
          <div className="w-full bg-white rounded-lg shadow-sm p-6 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading student details...</p>
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
            Back to Students
          </Link>
        </div>
    
    );
  }

  if (!student) {
    return (
      
        <div className="w-full p-6 bg-gray-50">
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-6">
            Student not found
          </div>
          <Link to={classesLink} className="text-blue-600 hover:text-blue-800 flex items-center">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Students
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
              Back to Students
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              {student.firstName} {student.lastName}
            </h1>
          </div>
          
         
        </div>
        
        {/* Student Profile Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 md:mb-0 md:mr-6 flex-shrink-0">
                {student.imageUrl ? (
                  <img
                    src={student.imageUrl.secure_url || student.imageUrl}
                    alt={`${student.firstName} ${student.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-2xl font-bold">
                    {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      {student.firstName} {student.lastName}
                    </h2>
                    <p className="text-gray-600 mb-2">Roll Number: {student.rollNumber}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Grade {student.grade} - Section {student.section}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {student.gender}
                      </span>
                      {student.bloodGroup && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Blood: {student.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center">
                        <Mail className="text-gray-500 mr-2" size={16} /> 
                        <span className="text-sm text-gray-700">{student.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="text-gray-500 mr-2" size={16} /> 
                        <span className="text-sm text-gray-700">{student.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="text-gray-500 mr-2" size={16} /> 
                        <span className="text-sm text-gray-700">
                          DOB: {new Date(student.dob).toLocaleDateString()}
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
                onClick={() => setActiveTab('academics')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'academics'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Book className="inline-block h-5 w-5 mr-2" />
                Academics
              </button>
              
              <button
                onClick={() => setActiveTab('attendance')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'attendance'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="inline-block h-5 w-5 mr-2" />
                Attendance
              </button>
              
              <button
                onClick={() => setActiveTab('parent')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'parent'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="inline-block h-5 w-5 mr-2" />
                Parent Info
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
                            {student.firstName} {student.lastName}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Date of Birth</label>
                          <div className="text-sm font-medium text-gray-800">
                            {new Date(student.dob).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Gender</label>
                          <div className="text-sm font-medium text-gray-800">{student.gender}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Blood Group</label>
                          <div className="text-sm font-medium text-gray-800">{student.bloodGroup || 'Not specified'}</div>
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
                          <div className="text-sm font-medium text-gray-800">{student.email}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Phone Number</label>
                          <div className="text-sm font-medium text-gray-800">{student.phone || 'Not specified'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Address</label>
                          <div className="text-sm font-medium text-gray-800">
                            {student.address ? (
                              <>
                                {student.address.street}, {student.address.city}, {student.address.state} {student.address.zipCode}, {student.address.country}
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
                  <h4 className="text-sm font-medium text-gray-500 mb-2">School Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Admission Date</label>
                        <div className="text-sm font-medium text-gray-800">
                          {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'Not specified'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Roll Number</label>
                        <div className="text-sm font-medium text-gray-800">{student.rollNumber}</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Class & Section</label>
                        <div className="text-sm font-medium text-gray-800">Grade {student.grade} - {student.section}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Academics Tab */}
            {activeTab === 'academics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-700 mb-1">Current Grade</h4>
                    <p className="text-2xl font-bold text-blue-800">Grade {student.grade}</p>
                    <p className="text-sm text-blue-600">Section {student.section}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-700 mb-1">Academic Performance</h4>
                    <p className="text-2xl font-bold text-green-800">
                      {student.academics?.currentGPA ? `${student.academics.currentGPA} GPA` : 'N/A'}
                    </p>
                    <p className="text-sm text-green-600">
                      {student.academics?.rank ? `Rank: ${student.academics.rank}` : 'Not ranked yet'}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-700 mb-1">Subjects</h4>
                    <p className="text-2xl font-bold text-purple-800">
                      {student.academics?.subjects?.length || 0}
                    </p>
                    <p className="text-sm text-purple-600">Enrolled subjects</p>
                  </div>
                </div>
                
                {student.academics?.subjects && student.academics.subjects.length > 0 ? (
                  <div className="overflow-x-auto bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Teacher
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {student.academics.subjects.map((subject, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {subject.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {subject.teacher}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span 
                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                                  ${subject.grade?.startsWith('A') ? 'bg-green-100 text-green-800' : 
                                    subject.grade?.startsWith('B') ? 'bg-blue-100 text-blue-800' : 
                                    subject.grade?.startsWith('C') ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'}`}
                              >
                                {subject.grade || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {subject.score ? `${subject.score}%` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No subjects data available.
                  </div>
                )}
              </div>
            )}
            
            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Record</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-green-700 mb-1">Present</h4>
                    <p className="text-2xl font-bold text-green-800">
                      {student.attendance?.present || 0} days
                    </p>
                    <p className="text-sm text-green-600">
                      {student.attendance ? 
                        Math.round((student.attendance.present / student.attendance.total) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-red-700 mb-1">Absent</h4>
                    <p className="text-2xl font-bold text-red-800">
                      {student.attendance?.absent || 0} days
                    </p>
                    <p className="text-sm text-red-600">
                      {student.attendance ? 
                        Math.round((student.attendance.absent / student.attendance.total) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-yellow-700 mb-1">Late</h4>
                    <p className="text-2xl font-bold text-yellow-800">
                      {student.attendance?.late || 0} days
                    </p>
                    <p className="text-sm text-yellow-600">
                      {student.attendance ? 
                        Math.round((student.attendance.late / student.attendance.total) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-blue-700 mb-1">Overall</h4>
                    <p className="text-2xl font-bold text-blue-800">
                      {student.attendance?.percentage || 0}%
                    </p>
                    <p className="text-sm text-blue-600">
                      {student.attendance?.total || 0} total days
                    </p>
                  </div>
                </div>
                
                {attendanceData && attendanceData.length > 0 ? (
                  <div className="overflow-x-auto bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceData.map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                record.status === 'present' ? 'bg-green-100 text-green-800' :
                                record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800">
                              {record.note || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No detailed attendance records available.
                  </div>
                )}
              </div>
            )}
            
            {/* Parent Info Tab */}
            {activeTab === 'parent' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Parent Information</h3>
                
                {student.parent ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Details</h4>
                      <div className="bg-gray-50 rounded-lg p-5">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <span className="text-xl font-bold text-blue-600">
                              {student.parent.firstName?.[0]}{student.parent.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <h5 className="text-lg font-semibold text-gray-800">
                              {student.parent.firstName} {student.parent.lastName}
                            </h5>
                            <p className="text-gray-600">{student.parent.relation}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Mail className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-gray-800">{student.parent.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-gray-800">{student.parent.phone}</span>
                          </div>
                          {student.parent.occupation && (
                            <div className="flex items-center">
                              <User className="w-5 h-5 text-gray-400 mr-3" />
                              <span className="text-gray-800">{student.parent.occupation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Information</h4>
                      <div className="bg-gray-50 rounded-lg p-5">
                        <div className="space-y-4">
                          {/* Add any additional parent info here */}
                          <div>
                            <label className="block text-xs text-gray-500">Relation to Student</label>
                            <div className="text-sm font-medium text-gray-800">
                              {student.parent.relation}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">Emergency Contact</label>
                            <div className="text-sm font-medium text-gray-800">
                              {student.parent.isEmergencyContact ? 'Yes' : 'No'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No parent information available.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
   
  );
};

export default StudentDetails; 