import React, { useState, useEffect } from "react";
import {useNavigate  } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  User,
  Bell,
  FileText,
  Menu,
  CreditCard,
  BarChart,
  CheckCircle,
  Clock,
  UserCheck,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  Users,
} from "lucide-react";
import { logout, getUserData } from '../utils/auth';
const ParentDashboard = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChild, setActiveChild] = useState(0);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "John has a test tomorrow", time: "10 min ago" },
    { id: 2, text: "School fees due next week", time: "2 hours ago" },
    { id: 3, text: "Parent-teacher meeting scheduled", time: "Yesterday" },
  ]);

  const children = [
    { 
      id: 1, 
      name: "John Smith", 
      grade: "10th Grade", 
      class: "10-A",
      attendance: "92%",
      nextTest: { subject: "Mathematics", date: "Tomorrow" },
      recentGrades: [
        { subject: "Mathematics", grade: "A", score: "92/100" },
        { subject: "Science", grade: "B+", score: "87/100" },
        { subject: "English", grade: "A-", score: "89/100" },
        { subject: "History", grade: "B", score: "83/100" }
      ],
      upcomingAssignments: [
        { id: 1, subject: "Mathematics", title: "Chapter 5 Problems", due: "Tomorrow" },
        { id: 2, subject: "Science", title: "Lab Report", due: "Friday" }
      ],
      attendance: {
        present: 45,
        absent: 2,
        late: 3,
        percentage: 92
      }
    },
    { 
      id: 2, 
      name: "Emma Smith", 
      grade: "7th Grade", 
      class: "7-C",
      attendance: "95%",
      nextTest: { subject: "Science", date: "Friday" },
      recentGrades: [
        { subject: "Mathematics", grade: "A+", score: "98/100" },
        { subject: "Science", grade: "A", score: "94/100" },
        { subject: "English", grade: "A", score: "92/100" },
        { subject: "Art", grade: "A+", score: "100/100" }
      ],
      upcomingAssignments: [
        { id: 1, subject: "Science", title: "Ecosystem Project", due: "Next Monday" },
        { id: 2, subject: "English", title: "Book Report", due: "Friday" }
      ],
      attendance: {
        present: 47,
        absent: 1,
        late: 2,
        percentage: 95
      }
    }
  ];

  const fees = [
    { id: 1, description: "Tuition Fee", amount: "$2,500", dueDate: "15 Oct 2023", status: "Paid" },
    { id: 2, description: "School Trip", amount: "$150", dueDate: "30 Oct 2023", status: "Pending" },
    { id: 3, description: "Lab Materials", amount: "$75", dueDate: "5 Nov 2023", status: "Pending" }
  ];

  const announcements = [
    { id: 1, title: "Annual School Function", date: "Posted 2 days ago" },
    { id: 2, title: "PTA Meeting Schedule", date: "Posted 1 week ago" }
  ];

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
 const handleLogout = () => {
      logout();
      navigate('/login');
    };
  const activeChildData = children[activeChild];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-0 -ml-64"} md:ml-0 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out fixed md:relative z-30 h-screen overflow-y-auto`}
      >
        <div className="flex items-center gap-2 p-4 border-b border-gray-200">
          <Users className="h-6 w-6 text-purple-600" />
          <div className="font-semibold text-lg text-purple-600">Parent Portal</div>
        </div>

        <div className="py-4">
          <div className="px-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">My Children</h3>
            <ul className="space-y-1">
              {children.map((child, index) => (
                <li key={child.id}>
                  <button 
                    onClick={() => setActiveChild(index)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                      activeChild === index 
                        ? "bg-purple-50 text-purple-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span>{child.name}</span>
                      <span className="text-xs text-gray-500">{child.grade}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Monitoring</h3>
            <ul className="space-y-1">
              <li>
                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-purple-50 text-purple-700">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                  <BarChart className="h-4 w-4" />
                  <span>Academic Progress</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                  <Clock className="h-4 w-4" />
                  <span>Attendance</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                  <BookOpen className="h-4 w-4" />
                  <span>Assignments</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="px-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">School</h3>
            <ul className="space-y-1">
              <li>
                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                  <Calendar className="h-4 w-4" />
                  <span>Calendar</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                  <CreditCard className="h-4 w-4" />
                  <span>Payments</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 mt-auto">
          <div className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-medium">
              PS
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium">Parent Account</span>
              <span className="text-xs text-gray-500">parent@example.com</span>
            </div>
           
          </div>
           <button
                      onClick={handleLogout}
                      className="flex w-full items-center mt-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                      <span>Log out</span>
                    </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-20">
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 focus:outline-none md:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-4 flex-1 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-purple-700">Parent Dashboard</h1>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          {/* Child Info Banner */}
          <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 md:p-6 bg-gradient-to-r from-purple-500 to-purple-700 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{activeChildData.name}</h2>
                  <p className="text-sm md:text-base opacity-90">
                    {activeChildData.grade} • Class {activeChildData.class}
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2">
                    <p className="text-xs opacity-90">Attendance</p>
                    <p className="font-bold">{activeChildData.attendance.percentage}%</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2">
                    <p className="text-xs opacity-90">Next Test</p>
                    <p className="font-bold">{activeChildData.nextTest.subject}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center justify-center p-2 text-center">
                  <BarChart className="h-5 w-5 text-purple-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">Academic Progress</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 text-center">
                  <FileText className="h-5 w-5 text-amber-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">Assignments</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 text-center">
                  <UserCheck className="h-5 w-5 text-green-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">Attendance</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 text-center">
                  <MessageSquare className="h-5 w-5 text-blue-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">Contact Teachers</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Recent Grades */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">Recent Grades</h3>
                  <button className="text-sm text-purple-600 hover:text-purple-800">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeChildData.recentGrades.map((grade, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{grade.subject}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{grade.score}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              grade.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                              grade.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                              grade.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {grade.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance Overview */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">Attendance Overview</h3>
                  <button className="text-sm text-purple-600 hover:text-purple-800">Full Report</button>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[140px] p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Present</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{activeChildData.attendance.present}</p>
                    <p className="text-xs text-gray-500">Days</p>
                  </div>
                  <div className="flex-1 min-w-[140px] p-3 bg-red-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Absent</span>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{activeChildData.attendance.absent}</p>
                    <p className="text-xs text-gray-500">Days</p>
                  </div>
                  <div className="flex-1 min-w-[140px] p-3 bg-amber-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Late</span>
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{activeChildData.attendance.late}</p>
                    <p className="text-xs text-gray-500">Days</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* Upcoming Assignments */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">Upcoming Assignments</h3>
                  <button className="text-sm text-purple-600 hover:text-purple-800">View All</button>
                </div>
                <div className="space-y-3">
                  {activeChildData.upcomingAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{assignment.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{assignment.subject} • Due {assignment.due}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee Information */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">Fee Information</h3>
                  <button className="text-sm text-purple-600 hover:text-purple-800">Payment History</button>
                </div>
                <div className="space-y-3">
                  {fees.map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{fee.description}</p>
                        <p className="text-xs text-gray-500">Due: {fee.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{fee.amount}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          fee.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {fee.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Announcements */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">School Announcements</h3>
                  <button className="text-sm text-purple-600 hover:text-purple-800">View All</button>
                </div>
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-800">{announcement.title}</p>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{announcement.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard; 