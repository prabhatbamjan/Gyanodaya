import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, BookOpen, User, MapPin, Users, Briefcase } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';

function ClassDetails() {
  const { id } = useParams();  
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchClassDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch class details from the backend API
          const classResponse = await authAxios.get(`classes/${id}`);
          console.log(classResponse.data);
          const classData = classResponse.data.data;

        // Assuming the response has 'class' and 'students' as fields
        setClassData(classData);
        setStudents(classData.students);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch class details');
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [id]);



  if (isLoading && !classData) {
    return (
      <div className="p-6 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>{error}</p>
          <Link to="/admin/classes" className="text-blue-600 mt-2 inline-block">
            Return to Classes
          </Link>
        </div>
      </div>
    );
  }

  // Get list of subjects
  const subjects = classData?.subjectTeachers?.map(st => st.subjectName) || [];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Link to="/admin/classes" className="flex items-center text-blue-600 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Classes
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{classData?.name}</h1>
              <p className="text-gray-600">Grade {classData?.grade}, Section {classData?.section}</p>
            </div>
         
          </div>
        </div>

        {/* Class overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start">
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Subjects</h3>
                <p className="text-xl font-semibold text-gray-800">{subjects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start">
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Students</h3>
                <p className="text-xl font-semibold text-gray-800">{classData?.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start">
              <div className="bg-purple-100 p-3 rounded-full">
                <User className="h-6 w-6 text-purple-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Class Teacher</h3>
                <p className="text-xl font-semibold text-gray-800">{classData?.classTeacher}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start">
              <div className="bg-yellow-100 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-yellow-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Room Number</h3>
                <p className="text-xl font-semibold text-gray-800">{classData?.roomNumber || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Class details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Class information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-800">Class Information</h2>
              </div>
              <div className="p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Class Teacher</h3>
                  <div className="flex items-center">
                    <img
                      src={classData?.classTeacher.profileImg}
                      alt={classData?.classTeacher.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">{classData?.classTeacher.name}</p>
                      <p className="text-sm text-gray-500">{classData?.classTeacher.subject} Teacher</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Grade</h3>
                    <p className="text-gray-800">Grade {classData?.grade}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Section</h3>
                    <p className="text-gray-800">{classData?.section}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Room Number</h3>
                    <p className="text-gray-800">{classData?.roomNumber || 'Not assigned'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Students</h3>
                    <p className="text-gray-800">{classData?.totalStudents}</p>
                  </div>
                </div>

                {/* Subjects and Teachers */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Subject Teachers</h3>
                  <div className="space-y-3">
                    {classData?.subjectTeachers.map((st) => (
                      <div key={st.subjectId} className="flex items-center p-3 border rounded-md bg-gray-50">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3 flex-grow">
                          <p className="font-medium text-gray-800">{st.subjectName}</p>
                          <div className="flex items-center mt-1">
                            <img
                              src={st.teacher.profileImg}
                              alt={st.teacher.name}
                              className="h-6 w-6 rounded-full object-cover mr-2"
                            />
                            <p className="text-sm text-gray-600">{st.teacher.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Created On</h3>
                    <p className="text-gray-800">
                      {new Date(classData?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                    <p className="text-gray-800">
                      {new Date(classData?.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student list */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b px-5 py-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Students</h2>
                <Link
                  to={`/admin/classes/${id}/students`}
                  className="text-blue-600 text-sm flex items-center"
                >
                  View All
                  <ArrowLeft className="h-4 w-4 ml-1 transform rotate-180" />
                </Link>
              </div>
              <div className="p-5">
                {students.length > 0 ? (
                  <div className="divide-y">
                    {students.map(student => (
                      <div key={student.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={student.profileImg}
                            alt={student.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div className="ml-3">
                            <p className="font-medium text-gray-800">{student.name}</p>
                            <p className="text-sm text-gray-500">Roll No: {student.rollNumber}</p>
                          </div>
                        </div>
                        <Link
                          to={`/admin/students/${student.id}`}
                          className="text-blue-600 text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-500">
                    No students added to this class yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Teachers list */}
          <div>
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b px-5 py-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Teachers</h2>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {/* Get unique teachers from subjectTeachers */}
                  {Array.from(new Set(classData?.subjectTeachers.map(st => st.teacherId)))
                    .map(teacherId => {
                      const teacherEntry = classData?.subjectTeachers.find(st => st.teacherId === teacherId);
                      const teacher = teacherEntry?.teacher;
                      
                      // Get all subjects taught by this teacher in this class
                      const teacherSubjects = classData?.subjectTeachers
                        .filter(st => st.teacherId === teacherId)
                        .map(st => st.subjectName);
                      
                      const isClassTeacher = classData?.classTeacher.id === teacherId;
                      
                      return (
                        <div key={teacherId} className="flex items-start border-b pb-4 last:border-0">
                          <img
                            src={teacher?.profileImg}
                            alt={teacher?.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <div className="ml-3 flex-grow">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-800">{teacher?.name}</p>
                                <p className="text-sm text-gray-500 mb-1">{teacher?.subject} Teacher</p>
                              </div>
                              {isClassTeacher && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Class Teacher
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {teacherSubjects?.map((subject, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Delete Class
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this class? This action cannot be undone.
                          All data associated with this class will be permanently removed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isLoading}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ClassDetails; 