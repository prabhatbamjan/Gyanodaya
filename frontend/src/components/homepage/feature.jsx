import React from 'react'
import {
 

    Users,
    Calendar,
    FileText,
    MessageCircle,
   
  } from "lucide-react"
function Feature() {
  return (
    <section id="features" className="py-20 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Powerful Features</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Everything you need to manage your school efficiently in one platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Feature 1 */}
        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="text-blue-600 mb-4">
            <Users size={48} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Student Management</h3>
          <p className="text-gray-600">
            Easily manage student records, attendance, performance, and communication with parents.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="text-blue-600 mb-4">
            <Calendar size={48} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Attendance Tracking</h3>
          <p className="text-gray-600">
            Track attendance in real-time with automated notifications for absences and tardiness.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="text-blue-600 mb-4">
            <FileText size={48} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Exam Management</h3>
          <p className="text-gray-600">
            Create, schedule, and grade exams with powerful analytics to track student progress.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="text-blue-600 mb-4">
            <MessageCircle size={48} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Communication Tools</h3>
          <p className="text-gray-600">
            Connect teachers, students, and parents with messaging, announcements, and updates.
          </p>
        </div>
      </div>
    </div>
  </section>
  )
}

export default Feature
