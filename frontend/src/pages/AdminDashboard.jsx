import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  Calendar,
  School2,
  CreditCard, 
  Clipboard,
  ArrowRight
} from "lucide-react";
import { Link } from 'react-router-dom';
import Layout from '../components/layoutes/adminlayout';
import authAxios from '../utils/auth';
import Loader from '../components/Loader';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0, 
    activeClasses: 0,  
    totalTeachers: 0,
  
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [studentsRes, classesRes, teachersRes] = 
          await Promise.all([
            authAxios.get('students/'),
            authAxios.get('classes/'),
            authAxios.get('teachers/'),
            authAxios.get('notifications/')

          ]);

        setStats({
          totalStudents: studentsRes.data.data.length,
          activeClasses: classesRes.data.data.length,
          totalTeachers: teachersRes.data.data.length,
         
        });

     
        setNotifications(notificationsRes.data.data);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  return (
    <Layout>
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Students Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Total Students</h3>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
            {/* <p className="text-sm text-gray-500 mt-1">12 new this month</p> */}
          </div>
        </div>

        {/* Attendance Rate Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Attendance Rate</h3>
            <ClipboardList className="h-6 w-6 text-blue-500" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-800">94.2%</p>
            <p className="text-sm text-gray-500 mt-1">2.1% increase</p>
          </div>
        </div>

        {/* Active Classes Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Active Classes</h3>
            <BookOpen className="h-6 w-6 text-blue-500" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-800">{stats.activeClasses}</p>
            {/* <p className="text-sm text-gray-500 mt-1">3 added this week</p> */}
          </div>
        </div>

        {/* Upcoming Events Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Upcoming Events</h3>
            <Calendar className="h-6 w-6 text-blue-500" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-800">7</p>
            <p className="text-sm text-gray-500 mt-1">Next: Annual Day (2 days)</p>
          </div>
        </div>
      </div>

     

      {/* Recent Activity and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="bg-blue-100 rounded-full p-2 mr-3">
                  <Users className="h-5 w-5 text-blue-500" />
                </span>
                <div>
                  <p className="text-gray-800 font-medium">New student admission</p>
                  <p className="text-gray-500 text-sm">Rahul Sharma was admitted to Grade 9, Section A</p>
                  <p className="text-gray-400 text-xs mt-1">Today, 10:30 AM</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 rounded-full p-2 mr-3">
                  <School2 className="h-5 w-5 text-green-500" />
                </span>
                <div>
                  <p className="text-gray-800 font-medium">New teacher joined</p>
                  <p className="text-gray-500 text-sm">Priya Patel joined as Mathematics teacher for senior grades</p>
                  <p className="text-gray-400 text-xs mt-1">Yesterday, 2:15 PM</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 rounded-full p-2 mr-3">
                  <Calendar className="h-5 w-5 text-purple-500" />
                </span>
                <div>
                  <p className="text-gray-800 font-medium">Event scheduled</p>
                  <p className="text-gray-500 text-sm">Annual Sports Day scheduled for next month</p>
                  <p className="text-gray-400 text-xs mt-1">2 days ago</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-yellow-100 rounded-full p-2 mr-3">
                  <CreditCard className="h-5 w-5 text-yellow-500" />
                </span>
                <div>
                  <p className="text-gray-800 font-medium">Fee collection</p>
                  <p className="text-gray-500 text-sm">₹150,000 collected in fees this week</p>
                  <p className="text-gray-400 text-xs mt-1">3 days ago</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Quick Stats</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Total Teachers</span>
                <span className="font-semibold text-gray-800">{stats.totalTeachers}</span>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Total Classes</span>
                <span className="font-semibold text-gray-800">{stats.activeClasses}</span>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Student-Teacher Ratio</span>
                  <span className="font-semibold text-gray-800">{stats.totalStudents / stats.totalTeachers}:1</span>
              </li>
              {/* <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Fee Collection Rate</span>
                <span className="font-semibold text-gray-800">86%</span>
              </li> */}
              <li className="flex justify-between items-center">
                <span className="text-gray-600">Average Attendance</span>
                <span className="font-semibold text-gray-800">94.2%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Academic Calendar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Academic Calendar</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Annual Day Celebration</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Dec 15, 2023</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">1 day</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Upcoming
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Winter Vacation</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Dec 20 - Jan 5, 2024</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">17 days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Confirmed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Terminal Examinations</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Nov 25 - Dec 5, 2023</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">10 days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      In Progress
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Republic Day Celebration</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Jan 26, 2024</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">1 day</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Upcoming
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard; 