// rafce

import React from 'react'

const HeroSection = () => {
  return (
    <div>
         <section id="home" className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 opacity-20 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Gyanodaya </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              The complete school management solution that simplifies administration, enhances learning, and connects
              your entire school community.
            </p>
            
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

    </div>
  )
}

export default HeroSection
