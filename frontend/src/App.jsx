import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import Home from "./pages/home";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import Subject from "./pages/subject/Subject";
import AddSubject from "./pages/subject/addSubject";
import EditSubject from "./pages/subject/EditSubject";
import Login from './pages/login';
import Signup from './pages/signup';
import ForgotPassword from './pages/forgotpassword';
import Class from './pages/class/class';
import AddClass from './pages/class/addClass';
import EditClass from './pages/class/EditClass';
import Teacher from './pages/teacher.jsx/teacher';
import TeacherDetails from './pages/teacher.jsx/TeacherDetails';
import AddTeacher from './pages/teacher.jsx/AddTeacher';
import EditTeacher from './pages/teacher.jsx/EditTeacher';
import Student from './pages/student/Students';
import AddStudent from './pages/student/AddStudent';
import EditStudent from './pages/student/EditStudent';
import ViewClass from './pages/class/ClassDetails';
import Timetable from './pages/timetable/TimeTable';
import AddTimetable from './pages/timetable/addTimeTable';
import ViewTimetable from './pages/timetable/ViewTimetable';
import EditTimetable from './pages/timetable/editTimetable';
import Profile from './pages/Profile';
import AcademicCalendar from './pages/academics/AcademicCalendar';
import AddCalendarEvent from './pages/academics/AddCalendarEvent';
import CalendarEventDetail from './pages/academics/CalendarEventDetail';
import Notifications from './pages/notifications/notification';
import AddNotification from './pages/notifications/addNotification';
import Assignment from './pages/AssignmentManagement/AssignmentManagement';
import AddAssignment from './pages/AssignmentManagement/AssignmentForm';
import AssignmentGrading from './pages/AssignmentManagement/AssignmentGrading';
// import Submissions from './pages/Submissions';
// import SubmissionDetail from './pages/SubmissionDetail';
// import StudentSubmission from './pages/StudentSubmission';
// import AdminSubjects from './pages/admin/';
// import AdminTeachers from './pages/admin/AdminTeachers';
// import AdminTimetable from './pages/admin/AdminTimetable';
// import TeacherTimetable from './pages/teacher/TeacherTimetable';
// import TeacherProfile from './pages/teacher/TeacherProfile';
// import ParentChildren from './pages/parent/ParentChildren';
// import ParentProfile from './pages/parent/ParentProfile';
// import StudentSubjects from './pages/student/StudentSubjects';
// import StudentTimetable from './pages/student/StudentTimetable';
// import StudentProfile from './pages/student/StudentProfile';

export default function LandingPage() { 
  return (
 
      <Router>
        <Routes>
          {/* public */}
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />  
          <Route path="/signup" element={<Signup/>} />
          <Route path="/forgotpassword" element={<ForgotPassword/>} />
         
      
          {/* admin */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminDashboard/>
            </ProtectedRoute>
          } />  
          <Route path="/student-dashboard" element={<ProtectedRoute requiredRoles={['student']}><StudentDashboard/></ProtectedRoute>} />
          <Route path="/teacher-dashboard" element={<ProtectedRoute requiredRoles={['teacher']}><TeacherDashboard/></ProtectedRoute>} />   
          <Route path="/parent-dashboard" element={<ProtectedRoute requiredRoles={['parent']}><ParentDashboard/></ProtectedRoute>} />
          <Route path="/admin-subjects" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Subject/>
            </ProtectedRoute>
          } />
          <Route path="/admin-subjects/addSubject" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <AddSubject/>
            </ProtectedRoute>
          } />   
          <Route path="/admin-subjects/edit/:id" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <EditSubject/>
            </ProtectedRoute>
          } />
          <Route path="/admin-classes" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Class/>
            </ProtectedRoute>
          } />
          <Route path="/admin-classes/add" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <AddClass/>
            </ProtectedRoute>
          } />
          <Route path="/admin-classes/edit/:id" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <EditClass/>
            </ProtectedRoute>
          } />        
          <Route path="/admin-classes/view/:id" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <ViewClass/>
            </ProtectedRoute>
          } />
          <Route path="/admin-teachers" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Teacher/>
            </ProtectedRoute>
          } />
          <Route path="/admin-teachers/addTeacher" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <AddTeacher/>
            </ProtectedRoute>
          } />
          <Route path="/admin-teachers/edit/:id" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <EditTeacher/>
            </ProtectedRoute>
          } />    
          <Route path="/admin-teachers/view/:id" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <TeacherDetails/>
            </ProtectedRoute>
          } />
          <Route path="/admin-students" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Student/>
            </ProtectedRoute>
          } />
          <Route path="/admin-students/addStudent" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <AddStudent/>
            </ProtectedRoute>
          } />
          <Route path="/admin-students/edit/:id" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <EditStudent/>
            </ProtectedRoute>
          } />
          <Route path="/admin-profile" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Profile/>
            </ProtectedRoute>
          } />
          <Route path="/admin-timetable" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Timetable/>
            </ProtectedRoute>
          } />
          <Route path="/admin-timetable/add" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <AddTimetable/>
            </ProtectedRoute>
          } />
          <Route path="/admin-timetable/view/:classId" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <ViewTimetable/>
            </ProtectedRoute>
            
          } />
           <Route path="/admin-timetable/edit/:id" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <EditTimetable/>
            </ProtectedRoute>
            
          } />
          <Route path="/academics/calendar" element={<ProtectedRoute element={<AcademicCalendar />} allowedRoles={['admin', 'teacher', 'student', 'parent']} />} />
          <Route path="/academics/calendar/add" element={<ProtectedRoute element={<AddCalendarEvent />} allowedRoles={['admin', 'teacher']} />} />

          <Route path="/academics/calendar/:id" element={<ProtectedRoute element={<CalendarEventDetail />} allowedRoles={['admin', 'teacher', 'student', 'parent']} />} />
         
         {/* notification */}
         <Route path="/notifications" element={<Notifications/>} />
         <Route path="/notifications-add" element={<AddNotification />} />

         {/* teacher */}
         <Route path="/teacher-dashboard" element={<TeacherDashboard/>} />

         {/* assignment */}
         <Route path="/assignment" element={<Assignment/>} />
         <Route path="/assignment/add" element={<AddAssignment/>} />
         {/* <Route path="/assignment/edit/:id" element={<ProtectedRoute element={<EditAssignment/>} allowedRoles={['teacher']} />} /> */}
         <Route path="/assignment/grading/:id" element={<ProtectedRoute element={<AssignmentGrading/>} allowedRoles={['teacher']} />} />
         
         {/* submissions
         <Route path="/submissions" element={
            <ProtectedRoute requiredRoles={['admin', 'teacher']}>
              <Submissions/>
            </ProtectedRoute>
         } />
         <Route path="/submission/:id" element={
            <ProtectedRoute requiredRoles={['admin', 'teacher']}>
              <SubmissionDetail/>
            </ProtectedRoute>
         } />
         <Route path="/assignment/submit/:id" element={
            <ProtectedRoute requiredRoles={['student']}>
              <StudentSubmission/>
            </ProtectedRoute>
         } /> */}
        
         
                
          {/* <Route path="/admin/subjects" element={<AdminSubjects />} />
          <Route path="/admin/teachers" element={<AdminTeachers />} />
          <Route path="/admin/timetable" element={<AdminTimetable />} />
          <Route path="/admin/profile" element={<Profile />} />
         
          <Route path="/teacher/timetable" element={<TeacherTimetable />} />
          <Route path="/teacher/profile" element={<TeacherProfile />} />
         
          <Route path="/parent/children" element={<ParentChildren />} />
          <Route path="/parent/profile" element={<ParentProfile />} />
         
          <Route path="/student/subjects" element={<StudentSubjects />} />
          <Route path="/student/timetable" element={<StudentTimetable />} />
          <Route path="/student/profile" element={<StudentProfile />} /> */}
        </Routes>
      </Router>
   
  )
}
