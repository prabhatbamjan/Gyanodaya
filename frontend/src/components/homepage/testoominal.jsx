import React from 'react'

function Testimonial() {
  return (
    <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from educators who have transformed their schools with Gyanodaya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src="/placeholder.svg?height=60&width=60"
                  alt="Principal"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">Sarah Johnson</h4>
                  <p className="text-gray-600 text-sm">Principal, Lincoln High School</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "EduManage Pro has revolutionized how we run our school. Administrative tasks that used to take days now
                take minutes, and our staff can focus on what truly matters - our students."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <img src="/placeholder.svg?height=60&width=60" alt="Teacher" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-semibold text-gray-800">Michael Chen</h4>
                  <p className="text-gray-600 text-sm">Teacher, Westfield Elementary</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The attendance and grading features save me hours each week. The parent communication tools have also
                improved my relationship with families and student outcomes."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src="/placeholder.svg?height=60&width=60"
                  alt="Administrator"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">Lisa Rodriguez</h4>
                  <p className="text-gray-600 text-sm">Administrator, Oak Ridge Academy</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The analytics and reporting features have given us insights we never had before. We can now make
                data-driven decisions that have measurably improved student performance."
              </p>
            </div>
          </div>
        </div>
      </section>
  )
}

export default Testimonial
