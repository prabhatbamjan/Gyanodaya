import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash, Mail, Phone, MapPin, Calendar, GraduationCap, User } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        // In a real app, fetch from API: const response = await axios.get(`/api/students/${id}`);
        // For demonstration, using mock data
        setTimeout(() => {
          const mockStudent = {
            _id: id,
            rollNumber: 'R001',
            firstName: 'Rahul',
            lastName: 'Sharma',
            gender: 'Male',
            email: 'rahul.sharma@example.com',
            dob: '2008-05-15',
            bloodGroup: 'O+',
            grade: 9,
            section: 'A',
            admissionDate: '2020-04-10',
            phone: '9876543210',
            address: {
              street: '123 Main Street',
              city: 'Mumbai',
              state: 'Maharashtra',
              zipCode: '400001',
              country: 'India'
            },
            parent: {
              _id: 'parent1',
              firstName: 'Raj',
              lastName: 'Sharma',
              email: 'raj.sharma@example.com',
              phone: '9876543211',
              occupation: 'Software Engineer',
              relation: 'Father'
            },
            attendance: {
              present: 85,
              absent: 10,
              late: 5,
              total: 100,
              percentage: 85
            },
            academics: {
              currentGPA: 3.8,
              rank: 5,
              subjects: [
                { name: 'Mathematics', teacher: 'Ms. Gupta', grade: 'A', score: 92 },
                { name: 'Science', teacher: 'Mr. Patel', grade: 'A-', score: 88 },
                { name: 'English', teacher: 'Mrs. Khan', grade: 'B+', score: 85 },
                { name: 'Social Studies', teacher: 'Mr. Verma', grade: 'A', score: 90 },
                { name: 'Hindi', teacher: 'Mrs. Sharma', grade: 'B', score: 82 }
              ]
            },
            fees: {
              total: 50000,
              paid: 30000,
              due: 20000,
              dueDate: '2023-12-31',
              history: [
                { date: '2023-04-15', amount: 15000, receipt: 'REC001' },
                { date: '2023-08-10', amount: 15000, receipt: 'REC002' }
              ]
            },
            profileImg: 'https://randomuser.me/api/portraits/men/32.jpg'
          };
          setStudent(mockStudent);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to fetch student details. Please try again later.');
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      // In a real app, make API call: await axios.delete(`/api/students/${id}`);
      // For demonstration, just navigate back
      alert('Student deleted successfully');
      navigate('/admin/students');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Loader text="Loading student details..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>{error}</p>
          </div>
          <Link to="/admin/students" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            <ArrowLeft className="inline mr-1" size={16} /> Back to Students
          </Link>
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p>Student not found.</p>
          </div>
          <Link to="/admin/students" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            <ArrowLeft className="inline mr-1" size={16} /> Back to Students
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
            <Link to="/admin/students" className="text-blue-600 hover:text-blue-800 flex items-center">
              <ArrowLeft className="mr-1" size={16} /> Back to Students
            </Link>
            <h1 className="text-2xl font-semibold text-gray-800">Student Details</h1>
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/admin/students/${id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center mr-2"
            >
              <Pencil className="mr-2" size={16} /> Edit
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center"
            >
              <Trash className="mr-2" size={16} /> Delete
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Student Profile Header */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 md:mb-0 md:mr-6">
                <img
                  src={student.profileImg || 'https://via.placeholder.com/150'}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-gray-600 mb-2">Roll Number: {student.rollNumber}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
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
              <div className="ml-auto mt-4 md:mt-0 flex-shrink-0">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center mb-2">
                    <Mail className="text-gray-500 mr-2" size={16} /> 
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Phone className="text-gray-500 mr-2" size={16} /> 
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <MapPin className="text-gray-500 mr-2" size={16} /> 
                    <span>{student.address.street}, {student.address.city}, {student.address.state} {student.address.zipCode}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Calendar className="text-gray-500 mr-2" size={16} /> 
                    <span>DOB: {new Date(student.dob).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <GraduationCap className="text-gray-500 mr-2" size={16} /> 
                    <span>Grade {student.grade}-{student.section}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="text-gray-500 mr-2" size={16} /> 
                    <span>Roll Number: {student.rollNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'personal' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('personal')}
              >
                Personal Info
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'academic' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('academic')}
              >
                Academic Details
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'attendance' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('attendance')}
              >
                Attendance
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'fees' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('fees')}
              >
                Fees
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'parent' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('parent')}
              >
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Basic Details</h4>
                    <div className="space-y-3">
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Full Name:</span>
                        <span className="text-gray-800">{student.firstName} {student.lastName}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Roll Number:</span>
                        <span className="text-gray-800">{student.rollNumber}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Gender:</span>
                        <span className="text-gray-800">{student.gender}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Date of Birth:</span>
                        <span className="text-gray-800">
                          {new Date(student.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Age:</span>
                        <span className="text-gray-800">
                          {new Date().getFullYear() - new Date(student.dob).getFullYear()} years
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Email:</span>
                        <span className="text-gray-800">{student.email}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Phone:</span>
                        <span className="text-gray-800">{student.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Blood Group:</span>
                        <span className="text-gray-800">{student.bloodGroup || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Address Information</h4>
                    <div className="space-y-3">
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Street:</span>
                        <span className="text-gray-800">{student.address.street}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">City:</span>
                        <span className="text-gray-800">{student.address.city}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">State:</span>
                        <span className="text-gray-800">{student.address.state}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Zip Code:</span>
                        <span className="text-gray-800">{student.address.zipCode}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Country:</span>
                        <span className="text-gray-800">{student.address.country}</span>
                      </div>
                    </div>

                    <h4 className="text-md font-medium text-gray-700 mt-6 mb-3">School Information</h4>
                    <div className="space-y-3">
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Grade:</span>
                        <span className="text-gray-800">{student.grade}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Section:</span>
                        <span className="text-gray-800">{student.section}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium text-gray-500">Admission:</span>
                        <span className="text-gray-800">
                          {new Date(student.admissionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Academic Details Tab */}
            {activeTab === 'academic' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Details</h3>
                
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-blue-700 mb-2">Current GPA</h4>
                    <p className="text-3xl font-bold text-blue-800">{student.academics.currentGPA}/4.0</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-green-700 mb-2">Class Rank</h4>
                    <p className="text-3xl font-bold text-green-800">#{student.academics.rank}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-purple-700 mb-2">Attendance</h4>
                    <p className="text-3xl font-bold text-purple-800">{student.attendance.percentage}%</p>
                  </div>
                </div>
                
                <h4 className="text-md font-medium text-gray-700 mb-3">Current Subjects & Grades</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Subject
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Teacher
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Grade
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {student.academics.subjects.map((subject, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-800">{subject.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{subject.teacher}</td>
                          <td className="py-3 px-4">
                            <span 
                              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                                ${subject.grade.startsWith('A') ? 'bg-green-100 text-green-800' : 
                                  subject.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' : 
                                  subject.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}`}
                            >
                              {subject.grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800">{subject.score}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Record</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-green-700 mb-1">Present</h4>
                    <p className="text-2xl font-bold text-green-800">{student.attendance.present} days</p>
                    <p className="text-sm text-green-600">{Math.round(student.attendance.present / student.attendance.total * 100)}%</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-red-700 mb-1">Absent</h4>
                    <p className="text-2xl font-bold text-red-800">{student.attendance.absent} days</p>
                    <p className="text-sm text-red-600">{Math.round(student.attendance.absent / student.attendance.total * 100)}%</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-yellow-700 mb-1">Late</h4>
                    <p className="text-2xl font-bold text-yellow-800">{student.attendance.late} days</p>
                    <p className="text-sm text-yellow-600">{Math.round(student.attendance.late / student.attendance.total * 100)}%</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-blue-700 mb-1">Overall</h4>
                    <p className="text-2xl font-bold text-blue-800">{student.attendance.percentage}%</p>
                    <p className="text-sm text-blue-600">{student.attendance.total} total days</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Attendance Visualization</h4>
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-6 bg-gradient-to-r from-green-500 to-green-600 flex items-center pl-2 text-xs text-white"
                      style={{ width: `${student.attendance.percentage}%` }}
                    >
                      {student.attendance.percentage}%
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Remarks</h4>
                  <p className="text-gray-600">
                    {student.attendance.percentage >= 90 
                      ? 'Excellent attendance record. Keep up the good work!' 
                      : student.attendance.percentage >= 80 
                      ? 'Good attendance record. There is some room for improvement.' 
                      : student.attendance.percentage >= 70 
                      ? 'Average attendance. Please try to attend more regularly.' 
                      : 'Poor attendance. A significant improvement is required.'}
                  </p>
                </div>
              </div>
            )}

            {/* Fees Tab */}
            {activeTab === 'fees' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-blue-700 mb-2">Total Fees</h4>
                    <p className="text-3xl font-bold text-blue-800">₹{student.fees.total.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-green-700 mb-2">Paid Amount</h4>
                    <p className="text-3xl font-bold text-green-800">₹{student.fees.paid.toLocaleString()}</p>
                    <p className="text-sm text-green-600">{Math.round(student.fees.paid / student.fees.total * 100)}% Paid</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-red-700 mb-2">Due Amount</h4>
                    <p className="text-3xl font-bold text-red-800">₹{student.fees.due.toLocaleString()}</p>
                    <p className="text-sm text-red-600">Due by: {new Date(student.fees.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <h4 className="text-md font-medium text-gray-700 mb-3">Payment History</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Date
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Amount
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Receipt No.
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {student.fees.history.map((payment, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-800">
                            {new Date(payment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800">₹{payment.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm text-blue-600">{payment.receipt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Payment Status</h4>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-4 bg-gradient-to-r from-green-500 to-green-600"
                        style={{ width: `${Math.round(student.fees.paid / student.fees.total * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Parent Info Tab */}
            {activeTab === 'parent' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Parent Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Contact Details</h4>
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                          <span className="text-xl font-bold text-blue-600">
                            {student.parent.firstName.charAt(0)}{student.parent.lastName.charAt(0)}
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
                          <a href={`mailto:${student.parent.email}`} className="text-blue-600 hover:underline">
                            {student.parent.email}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-gray-400 mr-3" />
                          <a href={`tel:${student.parent.phone}`} className="text-blue-600 hover:underline">
                            {student.parent.phone}
                          </a>
                        </div>
                        {student.parent.occupation && (
                          <div className="flex items-center">
                            <GraduationCap className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-gray-700">{student.parent.occupation}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-700">
                            {student.address.street}, {student.address.city}, {student.address.state}, {student.address.zipCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Messages & Notes</h4>
                    <div className="bg-white rounded-lg border border-gray-200 p-5 h-full">
                      <p className="text-gray-500 italic">No recent messages or notes.</p>
                      
                      <div className="mt-6">
                        <label htmlFor="parentMessage" className="block text-sm font-medium text-gray-700 mb-2">
                          Send Message to Parent
                        </label>
                        <textarea
                          id="parentMessage"
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Type your message here..."
                        ></textarea>
                        <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                          Send Message
                        </button>
                      </div>
                    </div>
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

export default StudentDetails; 