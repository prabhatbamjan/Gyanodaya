import React, { useState, useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import {
  Bell,
  Clock,
  FileText,
  Menu,
} from "lucide-react";
import Layout from "../components/layoutes/studentlayout";
import {getUserData, logout } from "../utils/auth";

const StudentDashboard = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([ ]);
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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const courses = [
    { id: 1, name: "Mathematics", progress: 75, teacher: "Ms. Johnson", nextClass: "Tomorrow, 9:00 AM" },
    { id: 2, name: "Science", progress: 65, teacher: "Mr. Smith", nextClass: "Today, 2:00 PM" },
    { id: 3, name: "English", progress: 90, teacher: "Mrs. Davis", nextClass: "Wednesday, 11:00 AM" },
    { id: 4, name: "History", progress: 50, teacher: "Mr. Wilson", nextClass: "Friday, 1:00 PM" },
  ];

  const upcomingAssignments = [
    { id: 1, title: "Math Problems Set 12", course: "Mathematics", due: "Tomorrow" },
    { id: 2, title: "Science Lab Report", course: "Science", due: "Friday" },
    { id: 3, title: "Essay on Shakespeare", course: "English", due: "Next Monday" },
  ];

  const announcements = [
    { id: 1, title: "School Holiday Next Week", date: "Posted 3 days ago" },
    { id: 2, title: "Annual Sports Day Coming Up", date: "Posted 1 week ago" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout>
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1">
       

          {/* Main Content */}
          <main className="p-4 md:p-6">
            {/* Welcome Banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-lg p-4 md:p-6 text-white">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Welcome Back </h2>
              <p className="opacity-90 mb-4">
                You have {upcomingAssignments.length} upcoming assignments and {courses.length} active courses.
              </p>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate('/student/assignments')}
                  className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  View Assignments
                </button>
                <button
                  onClick={() => navigate('/student/results')}
                  className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  View Results
                </button>
                <Link to="/student/schedule">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium border border-blue-400 hover:bg-blue-700 transition-colors">
                  Check Schedule
                </button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* My Courses */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">My Courses</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                  </div>
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800">{course.name}</h4>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{course.teacher}</span>
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
                            {course.nextClass}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upcoming Assignments */}
              <div>
                <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">Upcoming Assignments</h3>
                    <button 
                      onClick={() => navigate('/student/assignments')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {upcomingAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{assignment.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {assignment.course} • Due {assignment.due}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Announcements */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">Announcements</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                  </div>
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <p className="text-sm font-medium text-gray-800">{announcement.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{announcement.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-800">Today's Schedule</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">Full Calendar</button>
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
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
