import React from 'react'
import {
  
    Facebook,
    Twitter,
    Instagram,
    LinkedinIcon as LinkedIn,
    
  } from "lucide-react"
const Footer = () => {
  return (
    
    <footer className="bg-gray-800 text-white py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Gyanodaya</h3>
          <p className="text-gray-400 mb-4">Simplifying school management for educators worldwide.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">
              <LinkedIn size={20} />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Company</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                Press
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Resources</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                Tutorials
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                Webinars
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Legal</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                Cookie Policy
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                GDPR
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} EduManage Pro. All rights reserved.</p>
      </div>
    </div>
  </footer>
  )
}

export default Footer
