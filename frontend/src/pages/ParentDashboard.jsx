import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Clock,
  FileText,
  Menu,
  User,
  BookOpen,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Layout from "../components/layoutes/parentlayout";
import { getUserData, logout } from "../utils/auth";
import authAxios from "../utils/auth";

const ParentDashboard = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childCourses, setChildCourses] = useState([]);
  const [childAssignments, setChildAssignments] = useState([]);
  const [feeInfo, setFeeInfo] = useState(null);
  
  const navigate = useNavigate();
  const userData = getUserData();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fetch parent's children data
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        // This would be replaced with a real API call to get the parent's children
        // const response = await authAxios.get('/parent/children');
        // setChildren(response.data);
        
        // Dummy data for now
        const dummyChildren = [
          { id: 1, name: "Alex Johnson", grade: "9th Grade", class: "Class A", image: null },
          { id: 2, name: "Sam Johnson", grade: "6th Grade", class: "Class B", image: null }
        ];
        
        setChildren(dummyChildren);
        
        if (dummyChildren.length > 0) {
          setSelectedChild(dummyChildren[0]);
          
          // Get the selected child's data
          fetchChildData(dummyChildren[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching children:", err);
        setError("Failed to load your children's information");
        setLoading(false);
      }
    };
    
    fetchChildren();
  }, []);

  // Fetch selected child's data
  const fetchChildData = async (childId) => {
    try {
      setLoading(true);
      
      // These would be real API calls in a production environment
      // const coursesResponse = await authAxios.get(`/parent/children/${childId}/courses`);
      // const assignmentsResponse = await authAxios.get(`/parent/children/${childId}/assignments`);
      // const feeResponse = await authAxios.get(`/parent/children/${childId}/fees`);
      
      // Dummy data for now
      const dummyCourses = [
        { id: 1, name: "Mathematics", progress: 75, teacher: "Ms. Johnson", nextClass: "Tomorrow, 9:00 AM", grade: "B+" },
        { id: 2, name: "Science", progress: 65, teacher: "Mr. Smith", nextClass: "Today, 2:00 PM", grade: "A-" },
        { id: 3, name: "English", progress: 90, teacher: "Mrs. Davis", nextClass: "Wednesday, 11:00 AM", grade: "A" },
        { id: 4, name: "History", progress: 50, teacher: "Mr. Wilson", nextClass: "Friday, 1:00 PM", grade: "C+" },
      ];
      
      const dummyAssignments = [
        { id: 1, title: "Math Problems Set 12", course: "Mathematics", due: "Tomorrow", status: "Pending" },
        { id: 2, title: "Science Lab Report", course: "Science", due: "Friday", status: "Pending" },
        { id: 3, title: "Essay on Shakespeare", course: "English", due: "Next Monday", status: "Pending" },
        { id: 4, title: "History Timeline Project", course: "History", due: "Last Friday", status: "Submitted" },
      ];
      
      const dummyFeeInfo = {
        tuitionFee: 5000,
        paidAmount: 3500,
        dueAmount: 1500,
        nextDueDate: "November 15, 2023",
        recentPayments: [
          { id: 1, amount: 1500, date: "October 15, 2023", method: "Credit Card", status: "Completed" },
          { id: 2, amount: 2000, date: "September 15, 2023", method: "Bank Transfer", status: "Completed" },
        ]
      };
      
      setChildCourses(dummyCourses);
      setChildAssignments(dummyAssignments);
      setFeeInfo(dummyFeeInfo);
      setLoading(false);
    } catch (err) {
      console.error(`Error fetching data for child ${childId}:`, err);
      setError("Failed to load your child's information");
      setLoading(false);
    }
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    fetchChildData(child.id);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const announcements = [
    { id: 1, title: "School Holiday Next Week", date: "Posted 3 days ago" },
    { id: 2, title: "Annual Sports Day Coming Up", date: "Posted 1 week ago" },
    { id: 3, title: "Parent-Teacher Meeting", date: "Posted 2 days ago" },
  ];

  const renderChildAvatar = (child) => {
    if (child.image) {
      return <img src={child.image} alt={child.name} className="h-full w-full rounded-full object-cover" />;
    }
    
    return (
      <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
        {child.name.split(' ').map(part => part[0]).join('')}
      </div>
    );
  };

  return (
    <Layout>
    <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1">
          {/* Main Content */}
          <main className="p-4 md:p-6">
            {/* Welcome Banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-lg p-4 md:p-6 text-white">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Welcome {userData?.firstName} {userData?.lastName}</h2>
              <p className="opacity-90 mb-4">
                Track your {children.length > 1 ? "children's" : "child's"} academic progress and stay connected with their education.
              </p>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate('/parent/fee-payment')}
                  className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Pay Fees
                </button>
                  <button 
                  onClick={() => navigate('/parent/academic-records')}
                  className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Academic Records
                </button>
                <Link to="/parent/messages">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium border border-blue-400 hover:bg-blue-700 transition-colors">
                    Message Teachers
                  </button>
                </Link>
            </div>
            </div>
           
            {/* Child Selector (only if multiple children) */}
            {children.length > 1 && (
              <div className="mb-6 bg-white rounded-lg shadow border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-3">Select Child</h3>
                <div className="flex overflow-x-auto gap-4 pb-2">
                  {children.map(child => (
                    <div 
                      key={child.id}
                      onClick={() => handleChildSelect(child)}
                      className={`flex-shrink-0 flex flex-col items-center cursor-pointer p-3 rounded-lg ${
                        selectedChild?.id === child.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="h-16 w-16 rounded-full overflow-hidden mb-2">
                        {renderChildAvatar(child)}
        </div>
                      <p className="text-sm font-medium text-center">{child.name}</p>
                      <p className="text-xs text-gray-500">{child.grade}</p>
              </div>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                <p className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </p>
              </div>
            ) : selectedChild && (
              <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Child's Courses */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-800">{selectedChild.name}'s Courses</h3>
                        <button 
                          onClick={() => navigate(`/parent/courses/${selectedChild.id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View All
                        </button>
                      </div>
                      <div className="space-y-4">
                        {childCourses.map((course) => (
                          <div key={course.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-800">{course.name}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{course.teacher}</span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Grade: {course.grade}</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{course.progress}% Complete</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Next: {course.nextClass}
                            </span>
                </div>
              </div>
                        ))}
                </div>
                    </div>
                  </div>

                  <div>
                    {/* Fee Information */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-800">Fee Information</h3>
                        <button 
                          onClick={() => navigate('/parent/fee-payment')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Pay Now
                        </button>
                      </div>
                      {feeInfo && (
                        <div>
                          <div className="mb-4">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Total Tuition</span>
                              <span className="text-sm font-medium">${feeInfo.tuitionFee}</span>
                    </div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Amount Paid</span>
                              <span className="text-sm font-medium text-green-600">${feeInfo.paidAmount}</span>
                  </div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Balance Due</span>
                              <span className="text-sm font-medium text-amber-600">${feeInfo.dueAmount}</span>
                    </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Next Due Date</span>
                              <span className="text-sm font-medium">{feeInfo.nextDueDate}</span>
                  </div>
                </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-500 h-3 rounded-full"
                              style={{ width: `${(feeInfo.paidAmount / feeInfo.tuitionFee) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-center mt-2 text-gray-500">
                            {Math.round((feeInfo.paidAmount / feeInfo.tuitionFee) * 100)}% of tuition paid
                          </p>
              </div>
                      )}
            </div>

              {/* Upcoming Assignments */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">Upcoming Assignments</h3>
                        <button 
                          onClick={() => navigate(`/parent/assignments/${selectedChild.id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View All
                        </button>
                </div>
                <div className="space-y-3">
                        {childAssignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                          >
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                              assignment.status === 'Submitted' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-amber-100 text-amber-600'
                            }`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{assignment.title}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {assignment.course} • Due {assignment.due}
                              </p>
                              <p className={`text-xs mt-1 ${
                                assignment.status === 'Submitted' 
                                  ? 'text-green-600' 
                                  : 'text-amber-600'
                              }`}>
                                Status: {assignment.status}
                              </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                  </div>
                </div>

                {/* Announcements */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">School Announcements</h3>
                    <button 
                      onClick={() => navigate('/parent/announcements')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View All
                    </button>
                      </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50">
                        <Bell className="h-5 w-5 text-blue-600 mb-2" />
                        <p className="text-sm font-medium text-gray-800">{announcement.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{announcement.date}</p>
                    </div>
                  ))}
                </div>
              </div>

                {/* Today's Schedule */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">{selectedChild.name}'s Schedule Today</h3>
                    <button
                      onClick={() => navigate(`/parent/schedule/${selectedChild.id}`)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Full Calendar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">9:00 - 10:30 AM</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Current</span>
                      </div>
                      <h4 className="font-medium text-gray-800">Mathematics</h4>
                      <p className="text-xs text-gray-500 mt-1">Room 102 • Ms. Johnson</p>
                    </div>
                    <div className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">10:45 - 12:15 PM</span>
                      </div>
                      <h4 className="font-medium text-gray-800">History</h4>
                      <p className="text-xs text-gray-500 mt-1">Room 205 • Mr. Wilson</p>
                </div>
                    <div className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">1:00 - 2:30 PM</span>
                      </div>
                      <h4 className="font-medium text-gray-800">English</h4>
                      <p className="text-xs text-gray-500 mt-1">Room 301 • Mrs. Davis</p>
                    </div>
                    <div className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">2:45 - 4:15 PM</span>
                </div>
                      <h4 className="font-medium text-gray-800">Science</h4>
                      <p className="text-xs text-gray-500 mt-1">Lab 3 • Mr. Smith</p>
              </div>
            </div>
          </div>
              </>
            )}
        </main>
      </div>
    </div>
    </Layout>
  );
};

export default ParentDashboard; 