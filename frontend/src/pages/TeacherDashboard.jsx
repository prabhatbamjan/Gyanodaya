import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Users,
  PenTool,
  PlusCircle,
  ArrowRight
} from "lucide-react";
import Layout from "../components/layoutes/teacherlayout";
import { Link } from 'react-router-dom';
import { getUserData } from '../utils/auth';
import authAxios from "../utils/auth";

const TeacherDashboard = () => {
  const userData = getUserData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for all dashboard data
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingAssignments: 0,
    upcomingEvents: 0,
  });
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [activities, setActivities] = useState([]);
  const [studentPerformance, setStudentPerformance] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch classes taught by the teacher
        const classesRes = await authAxios.get('/timetables/teacher/classes');
        const fetchedClasses = classesRes.data.data || [];
        setClasses(fetchedClasses);
        
        // Set active class to first class if available
        if (fetchedClasses.length > 0) {
          setActiveClass(fetchedClasses[0].name);
        }
        
        // Fetch stats
        const statsRes = await authAxios.get('/teachers/dashboard/stats');
        setStats(statsRes.data.data || {
          totalClasses: fetchedClasses.length,
          totalStudents: 0,
          pendingAssignments: 0,
          upcomingEvents: 0,
        });
        
        // Fetch assignments
        const assignmentsRes = await authAxios.get('/assignments/teacher');
        setAssignments(assignmentsRes.data.data || []);
        
        // Fetch today's schedule
        const today = new Date().toISOString().split('T')[0];
        const scheduleRes = await authAxios.get(`/timetables/teacher/schedule?date=${today}`);
        setSchedule(scheduleRes.data.data || []);
        
        // Fetch recent activities
        const activitiesRes = await authAxios.get('/teachers/dashboard/activities');
        setActivities(activitiesRes.data.data || []);
        
        // Fetch student performance data
        const performanceRes = await authAxios.get('/teachers/dashboard/performance');
        setStudentPerformance(performanceRes.data.data || [
          { range: "90-100%", count: 0, percentage: 0 },
          { range: "80-89%", count: 0, percentage: 0 },
          { range: "70-79%", count: 0, percentage: 0 },
          { range: "60-69%", count: 0, percentage: 0 },
          { range: "Below 60%", count: 0, percentage: 0 },
        ]);
        
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please refresh the page.");
        
        // Set fallback data
        setClasses([
          { _id: "1", name: "Class 10A" },
          { _id: "2", name: "Class 9B" },
          { _id: "3", name: "Class 8C" },
        ]);
        setActiveClass("Class 10A");
        setStats({
          totalClasses: 3,
          totalStudents: 78,
          pendingAssignments: 4,
          upcomingEvents: 2,
        });
        setAssignments([
          {
            _id: "a1",
            title: "Math Homework",
            className: "Class 10A",
            dueDate: "2025-04-25",
            submittedCount: 22,
            totalStudents: 26,
          },
          {
            _id: "a2",
            title: "Science Project",
            className: "Class 10A",
            dueDate: "2025-04-20",
            submittedCount: 18,
            totalStudents: 26,
          },
          {
            _id: "a3",
            title: "English Essay",
            className: "Class 9B",
            dueDate: "2025-04-22",
            submittedCount: 20,
            totalStudents: 26,
          },
        ]);
        setSchedule([
          {
            startTime: "9:00 AM",
            endTime: "9:45 AM",
            className: "Class 10A",
            subjectName: "Mathematics",
            room: "101",
          },
          {
            startTime: "10:00 AM",
            endTime: "10:45 AM",
            className: "Class 9B",
            subjectName: "Science",
            room: "102",
          },
        ]);
        setActivities([
          {
            student: { name: "Alice" },
            action: "submitted the Math Homework",
            timestamp: new Date().toISOString(),
          },
          {
            student: { name: "Bob" },
            action: "submitted the Science Project",
            timestamp: new Date().toISOString(),
          },
        ]);
        setStudentPerformance([
          { range: "90-100%", count: 8, percentage: 25 },
          { range: "80-89%", count: 12, percentage: 37.5 },
          { range: "70-79%", count: 7, percentage: 21.9 },
          { range: "60-69%", count: 3, percentage: 9.4 },
          { range: "Below 60%", count: 2, percentage: 6.2 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <Layout>
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, {userData ? `${userData.firstName} ${userData.lastName}` : 'Teacher'}
          </h2>
          <p className="text-gray-600">Here's what's happening with your classes today.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link to="/teacher-timetable" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
            View Schedule
          </Link>
          <Link to="/assignments/create" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center gap-1">
            <PlusCircle className="w-4 h-4" />
            Create Assignment
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard icon={<BookOpen className="h-6 w-6 text-blue-500" />} label="Total Classes" value={stats.totalClasses} />
            <StatCard icon={<Users className="h-6 w-6 text-blue-500" />} label="Total Students" value={stats.totalStudents} />
            <StatCard icon={<PenTool className="h-6 w-6 text-blue-500" />} label="Pending Grades" value={stats.pendingAssignments} />
            <StatCard icon={<Calendar className="h-6 w-6 text-blue-500" />} label="Upcoming Events" value={stats.upcomingEvents} subtitle={stats.nextEvent ? `Next: ${stats.nextEvent.title} (${stats.nextEvent.daysUntil} days)` : null} />
          </div>

          {/* Main Content and Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - Class Overview */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Class Overview: {activeClass}</h3>
                <select
                  className="border border-gray-300 rounded-md text-sm px-2 py-1"
                  value={activeClass}
                  onChange={(e) => setActiveClass(e.target.value)}
                  disabled={classes.length === 0}
                >
                  {classes.map(cls => (
                    <option key={cls._id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Student Performance</h4>
                  {studentPerformance.map((p, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{p.range}</span>
                        <span>{p.count} students ({p.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${["bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-orange-500", "bg-red-500"][i]}`}
                          style={{ width: `${p.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Recent Assignments</h4>
                  {assignments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <TableHead title="Assignment" />
                            <TableHead title="Class" />
                            <TableHead title="Due Date" />
                            <TableHead title="Submitted" />
                            <TableHead title="Actions" />
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {assignments
                            .filter(a => a.className === activeClass || a.class?.name === activeClass)
                            .slice(0, 5)
                            .map(a => (
                              <tr key={a._id}>
                                <TableCell>{a.title}</TableCell>
                                <TableCell>{a.className || a.class?.name}</TableCell>
                                <TableCell>{new Date(a.dueDate).toLocaleDateString()}</TableCell>
                                <TableCell>{a.submittedCount}/{a.totalStudents}</TableCell>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <Link to={`/assignments/edit/${a._id}`} className="text-blue-600 hover:text-blue-800 mr-3">View</Link>
                                  <Link to={`/assignments/grading/${a._id}`} className="text-green-600 hover:text-green-800">Grade</Link>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No assignments found</div>
                  )}
                  {assignments.length > 5 && (
                    <div className="mt-4 text-right">
                      <Link to="/assignments" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                        View all assignments
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Schedule & Activity */}
            <div className="space-y-6">
              {/* Schedule */}
              <Card title="Today's Schedule" link="/teacher-timetable">
                {schedule.length > 0 ? (
                  schedule.map((s, i) => (
                    <div key={i} className="border-l-2 border-blue-500 pl-3 mb-4 last:mb-0">
                      <p className="text-xs text-gray-500">{s.startTime} - {s.endTime}</p>
                      <p className="text-sm font-medium text-gray-800">{s.className || s.class?.name}</p>
                      <p className="text-xs text-gray-500">{s.subjectName || s.subject?.name} • Room {s.room}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500">No classes scheduled for today</p>
                )}
              </Card>

              {/* Activities */}
              <Card title="Recent Activities" link="/activities">
                {activities.length > 0 ? (
                  activities.map((a, i) => (
                    <div key={i} className="flex items-start mb-4 last:mb-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 mr-3">
                        {a.student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">
                          <span className="font-medium">{a.student.name}</span> {a.action}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500">No recent activities</p>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

const StatCard = ({ icon, label, value, subtitle }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center">
      {icon}
      <h3 className="ml-2 text-sm font-medium text-gray-500">{label}</h3>
    </div>
    <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
    {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
  </div>
);

const TableHead = ({ title }) => (
  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {title}
  </th>
);

const TableCell = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
    {children}
  </td>
);

const Card = ({ title, link, children }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium text-gray-800">{title}</h3>
      {link && (
        <Link to={link} className="text-sm text-blue-600 hover:text-blue-800">
          View All
        </Link>
      )}
    </div>
    {children}
  </div>
);

export default TeacherDashboard;
