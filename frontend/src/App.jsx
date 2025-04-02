
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Login from './pages/login';
import Signup from './pages/signup';
import ForgotPassword from './pages/forgotpassword';
export default function LandingPage() {
  return (
    <Router>
   
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/forgotpassword" element={<ForgotPassword/>} />
      <Route path="/dashboard" element={<Dashboard/>} />
      
      
    
    </Routes>
  </Router>
 
  )
}
