import React, { useState } from 'react';
import { Calendar, Users, Clock, UserCheck, List, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layoutes/adminlayout';

const AttendanceCard = ({ title, description, icon: Icon, link, color }) => (
  <Link
    to={link}
    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div>
        <div className={`p-3 rounded-lg ${color} inline-block mb-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </div>
  </Link>
);

const AdminAttendance = () => {
  const attendanceOptions = [
    {
      title: "Mark Teacher Attendance",
      description: "Take daily attendance for teachers",
      icon: UserCheck,
      link: "/admin-attendance/teacher",
      color: "bg-blue-500"
    },
    {
      title: "View Teacher Attendance",
      description: "View and manage teacher attendance records",
      icon: List,
      link: "/admin-attendance/teacher/view",
      color: "bg-green-500"
    },
    {
      title: "Today's Overview",
      description: "Quick view of today's teacher attendance status",
      icon: Clock,
      link: "/admin-attendance/today",
      color: "bg-purple-500"
    },
    {
      title: "Reports & Analytics",
      description: "Generate attendance reports and view analytics",
      icon: Users,
      link: "/admin-attendance/reports",
      color: "bg-orange-500"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Calendar className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
            <p className="text-gray-600">Manage and track teacher attendance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {attendanceOptions.map((option, index) => (
            <AttendanceCard key={index} {...option} />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">Present Today</div>
              <div className="mt-2 flex justify-between items-end">
                <div className="text-2xl font-bold text-gray-800">85%</div>
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-red-600 text-sm font-medium">Absent Today</div>
              <div className="mt-2 flex justify-between items-end">
                <div className="text-2xl font-bold text-gray-800">15%</div>
                <Users className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-sm font-medium">Monthly Attendance</div>
              <div className="mt-2 flex justify-between items-end">
                <div className="text-2xl font-bold text-gray-800">92%</div>
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { teacher: "John Doe", status: "present", time: "9:00 AM" },
              { teacher: "Jane Smith", status: "absent", time: "9:15 AM" },
              { teacher: "Mike Johnson", status: "present", time: "8:45 AM" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-gray-800">{activity.teacher}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${
                    activity.status === 'present' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminAttendance;
