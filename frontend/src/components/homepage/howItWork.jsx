import React from 'react'

function HowItWork() {
  return (
    <div>
      <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Gyanodaya simplifies school management in just a few easy steps.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center mb-6 relative z-10">
                  <span className="text-xl font-bold">1</span>
                </div>
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
                <h3 className="text-xl font-medium mb-2">Set Up Your School</h3>
                <p className="text-gray-600">
                  Create your school profile, add classes, subjects, and import existing data.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center mb-6 relative z-10">
                  <span className="text-xl font-bold">2</span>
                </div>
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
                <h3 className="text-xl font-medium mb-2">Invite Users</h3>
                <p className="text-gray-600">Add administrators, teachers, students, and parents to the platform.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center mb-6">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Start Managing</h3>
                <p className="text-gray-600">
                  Begin using the features to streamline your school's operations and enhance learning.
                </p>
              </div>
            </div>
          </div>
        </section>
    </div>
  )
}

export default HowItWork
