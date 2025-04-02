import React from 'react'
import {
  BookOpen 
} from "lucide-react"
import { Link } from 'react-router-dom'
const Header = () => {
  return (
    <nav className="bg-white/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 shadow-sm">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">Gyanodaya</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#testimonials" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Testimonials
            </a>
          
            <a href="#contact" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Contact
            </a>
            <Link to="/login">
              <button className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition-colors">
                Log In
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                Sign Up
              </button>
            </Link>
          </nav>


        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            className="text-gray-700 hover:text-blue-600 focus:outline-none"
            onClick={() => {
              const mobileMenu = document.getElementById("mobile-menu")
              if (mobileMenu) {
                mobileMenu.classList.toggle("hidden")
              }
            }}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Menu */}
    <div id="mobile-menu" className="hidden md:hidden bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col space-y-3">
          <a
            href="#home"
            className="text-gray-700 hover:text-blue-600 font-medium py-2 transition duration-300"
            onClick={() => document.getElementById("mobile-menu")?.classList.add("hidden")}
          >
            Home
          </a>
          <a
            href="#features"
            className="text-gray-700 hover:text-blue-600 font-medium py-2 transition duration-300"
            onClick={() => document.getElementById("mobile-menu")?.classList.add("hidden")}
          >
            Features
          </a>
          <a
            href="#about"
            className="text-gray-700 hover:text-blue-600 font-medium py-2 transition duration-300"
            onClick={() => document.getElementById("mobile-menu")?.classList.add("hidden")}
          >
            How It Works
          </a>
          <a
            href="#testimonials"
            className="text-gray-700 hover:text-blue-600 font-medium py-2 transition duration-300"
            onClick={() => document.getElementById("mobile-menu")?.classList.add("hidden")}
          >
            Testimonials
          </a>
          
          <a
            href="#contact"
            className="text-gray-700 hover:text-blue-600 font-medium py-2 transition duration-300"
            onClick={() => document.getElementById("mobile-menu")?.classList.add("hidden")}
          >
            Contact
          </a>
          <Link to="/login">
              <button className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition-colors">
                Log In
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                Sign Up
              </button>
            </Link>
        </div>
      </div>
    </div>
  </nav>
  )
}

export default Header
