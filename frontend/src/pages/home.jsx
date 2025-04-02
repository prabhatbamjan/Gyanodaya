import React from 'react'
import Header from '../components/homepage/header'
import HeroSection from '../components/homepage/hero-section'
import HowItWork from '../components/homepage/howItWork'
import Feature from '../components/homepage/feature'
import Testimonial from '../components/homepage/testoominal'
import Contact from '../components/homepage/contact'
import Footer from '../components/homepage/footer'


const Home = () => {
  return (
       <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
     <Header/>
    
  

    {/* Hero Section */}  
   <HeroSection/>
   
      {/* Features Section */}
      <Feature/>

      <HowItWork/>
      

      {/* Testimonials Section */}
      <Testimonial/>

    

      {/* Contact Section */}
      <Contact/>

      {/* Footer */}
      <Footer/>
    </div>
  )
}

export default Home
