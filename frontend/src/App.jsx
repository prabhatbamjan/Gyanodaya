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
import ViewClass from './pages/class/ClassDetails';
import Teacher from './pages/teacher.jsx/teacher';
import TeacherDetails from './pages/teacher.jsx/TeacherDetails';
import AddTeacher from './pages/teacher.jsx/AddTeacher';
import EditTeacher from './pages/teacher.jsx/EditTeacher';
import Student from './pages/student/Students';
import AddStudent from './pages/student/AddStudent';
import EditStudent from './pages/student/EditStudent';
import ViewStudent from './pages/student/StudentDetails';
import Timetable from './pages/timetable/TimeTable';
import AddTimetable from './pages/timetable/addTimeTable';
import ViewTimetable from './pages/timetable/ViewTimetable';
import EditTimetable from './pages/timetable/editTimetable';
import Profile from './pages/Profile';
import Notifications from './pages/notifications/notification';
import AddNotification from './pages/notifications/addNotification';
import Attendance from './pages/attendance/AttendancePage';
import AddAttendance from './pages/attendance/MarkAttendance';
import ViewAttendance from './pages/attendance/AttendanceReport';
import EditAttendance from './pages/attendance/EditAttendance';
import Event from './pages/events/EventsPage';
import AddEvent from './pages/events/AddEvent';
import EditEvent from './pages/events/EditEvent';
import Product from './pages/products/ProductsPage';
import Addproduct from './pages/products/AddProduct';
import Editproduct from './pages/products/EditProduct';
import Viewproduct from './pages/products/ViewProduct';
import OrderList from './pages/order/OrderList';
import OrderDetails from './pages/order/OrderDetails';


import Assignment from './pages/AssignmentManagement/AssignmentManagement';
import AddAssignment from './pages/AssignmentManagement/AssignmentForm';
import AssignmentGrading from './pages/AssignmentManagement/AssignmentGrading';
import AssignmentEdit from './pages/AssignmentManagement/AssignmentEdite';
import TeacherNotifications from './pages/teacher/TeacherNotifications';
import Exam from './pages/admin/Exam/exam';
import AddExam from './pages/admin/Exam/AddExam';
import EditExam from './pages/admin/Exam/EditExam';
// Fee Management
import FeeList from './pages/fee/FeeList';
import AddFee from './pages/fee/AddFee';
import EditFee from './pages/fee/EditFee';

// Salary Management
import SalaryList from './pages/salary/SalaryList';
import AddSalary from './pages/salary/AddSalary';
import EditSalary from './pages/salary/EditSalary';
import TeacherResults from './pages/teacher/TeacherResults';
import TeacherResultForm from './pages/teacher/TeacherResultForm';
import AdminResults from './pages/admin/AdminResults';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentSubmissionForm from './pages/student/StudentSubmissionForm';
import ViewSubmission from './pages/student/ViewSubmission';
// import Submissions from './pages/Submissions';
// import SubmissionDetail from './pages/SubmissionDetail';
// import StudentSubmission from './pages/StudentSubmission';
// import StudentAssignments from './pages/student/StudentAssignments';
// import AdminSubjects from './pages/admin/';
// import AdminTeachers from './pages/admin/AdminTeachers';
// import AdminTimetable from './pages/admin/AdminTimetable';
// import TeacherTimetable from './pages/teacher/TeacherTimetable';
// import TeacherProfile from './pages/teacher/TeacherProfile';
// import ParentChildren from './pages/parent/ParentChildren';
// import ParentProfile from './pages/parent/ParentProfile';
 import StudentSubjects from './pages/student/MyCourse';
import StudentTimetable from './pages/student/MyTimetable';
import StudentAttendance from './pages/student/MyAttendance';
import MyTeacher from './pages/student/MyTeacher';
// import StudentProfile from './pages/student/StudentProfile';
import MyClasses from './pages/teacher/MyClasses';
import MyStudent from './pages/teacher/Mystudent';
import StudentNotice from './pages/student/notice';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherTimetable from './pages/teacher/TeacherTimetable';
import Messages from './pages/Messages';

import MarkTeacherAttendance from './pages/attendance/teacher/MarkTeacherAttendance';
import ViewTeacherAttendance from './pages/attendance/teacher/ViewTeacherAttendance';
import AdminAttendance from './pages/admin/AdminAttendance';



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
          {/* <Route path="/student-dashboard" element={<ProtectedRoute requiredRoles={['student']}><StudentDashboard/></ProtectedRoute>} />
          <Route path="/teacher-dashboard" element={<ProtectedRoute requiredRoles={['teacher']}><TeacherDashboard/></ProtectedRoute>} />   
          <Route path="/parent-dashboard" element={<ProtectedRoute requiredRoles={['parent']}><ParentDashboard/></ProtectedRoute>} /> */}
          
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher-classes" element={<MyClasses />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />

          
          
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
          <Route path="/classes/view/:id" element={
            <ProtectedRoute requiredRoles={['admin','teacher','student','parent']}>
              <ViewClass/>
            </ProtectedRoute>
          } />
          <Route path="/admin-fees" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <FeeList/>
            </ProtectedRoute>
          } />
          <Route path="/admin-fees/add" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <AddFee/>
            </ProtectedRoute>
          } />
          <Route path="/admin-fees/edit/:id" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <EditFee/>
            </ProtectedRoute>
          } />

          <Route path="/admin-salary" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <SalaryList/>
            </ProtectedRoute>
          } />
          <Route path="/admin-salary/add" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <AddSalary/>
            </ProtectedRoute>
          } />
          <Route path="/admin-salary/edit/:id" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <EditSalary/>
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
          <Route path="/teachers/view/:id" element={
            <ProtectedRoute requiredRoles={['admin','teacher','student','parent']}>
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
           <Route path="/students/:id" element={
            <ProtectedRoute requiredRoles={['admin','teacher','student','parent']}>
              <ViewStudent/>
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
          <Route path="/admin-events" element={<Event/>} />
          <Route path="/admin-events/add" element={<AddEvent/>} />
          <Route path="/admin-events/edit/:id" element={<EditEvent/>} />
         {/* notification */}
         <Route path="/notifications" element={<Notifications/>} />
         <Route path="/notifications-add" element={<AddNotification />} />
         <Route path="/product" element={<Product/>} />
         <Route path="/addProduct" element={<Addproduct />} />
         <Route path="/editeProduct/:id" element={<Editproduct/>} />
         <Route path="/viewProduct/:id" element={<Viewproduct/>} />
         
    

         {/* attendance */}
         <Route path="/attendance" element={<Attendance/>} />
         <Route path="/attendance/add" element={<AddAttendance />} />
         <Route path="/attendance/view/:id" element={<ViewAttendance />} />
         <Route path="/attendance/edit/:id" element={<EditAttendance />} />

         {/* teacher */}
         <Route path="/teacher-dashboard" element={<TeacherDashboard/>} />
         <Route path="/teacher-students" element={<MyStudent/>} />
         <Route path="/teacher-timetable" element={<TeacherTimetable/>} />
         <Route path="/teacher-notifications" element={<ProtectedRoute requiredRoles={['teacher']}><TeacherNotifications /></ProtectedRoute>} />
         <Route path="/teacher-results" element={<ProtectedRoute requiredRoles={['teacher']}><TeacherResults /></ProtectedRoute>} />
         <Route path="/teacher-results/add" element={<ProtectedRoute requiredRoles={['teacher']}><TeacherResultForm /></ProtectedRoute>} />
         <Route path="/teacher-results/edit/:id" element={<ProtectedRoute requiredRoles={['teacher']}><TeacherResultForm /></ProtectedRoute>} />
         
         {/* teacher attendance */}
         <Route path="/teacher-attendance" element={<ProtectedRoute requiredRoles={['teacher']}><TeacherAttendance /></ProtectedRoute>} />
         <Route path="/teacher-attendance/mark" element={<ProtectedRoute requiredRoles={['teacher']}><AddAttendance /></ProtectedRoute>} />
         <Route path="/teacher-attendance/edit/:id" element={<ProtectedRoute requiredRoles={['teacher']}><EditAttendance /></ProtectedRoute>} />
         <Route path="/teacher-attendance/view/:id" element={<ProtectedRoute requiredRoles={['teacher']}><ViewAttendance /></ProtectedRoute>} />
          
         {/* exam */}
          <Route path="/admin-exams" element={<ProtectedRoute requiredRoles={['admin']}><Exam /></ProtectedRoute>} />
          <Route path="/admin/exams/add" element={<ProtectedRoute requiredRoles={['admin']}><AddExam /></ProtectedRoute>} />
          <Route path="/admin/exams/edit/:id" element={<ProtectedRoute requiredRoles={['admin']}><EditExam /></ProtectedRoute>} />
        
         {/* admin results */}
         <Route path="/admin-results" element={<ProtectedRoute requiredRoles={['admin']}><AdminResults /></ProtectedRoute>} />
         
         {/* assignment */}
         <Route path="/assignments" element={<Assignment/>} />
         <Route path="/assignments/create" element={<AddAssignment/>} />
         <Route path="/assignments/edit/:id" element={<AssignmentEdit/>} />
         <Route path="/assignments/grading/:id" element={<AssignmentGrading/>} />
{/*          
         submissions */}
         {/* <Route path="/submissions" element={
            <ProtectedRoute element={<Submissions/>} allowedRoles={['admin', 'teacher']} />
         } />
         <Route path="/submissions/:id" element={
            <ProtectedRoute element={<SubmissionDetail/>} allowedRoles={['admin', 'teacher']} />
         } />
         <Route path="/assignments/submit/:id" element={
            <ProtectedRoute element={<StudentSubmission/>} allowedRoles={['student']} />
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
          <Route path="/student/profile" element={<StudentProfile //>} /> */}

          {/* student assignments */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          {/* <Route path="/student/profile" element={<StudentProfile/>} /> */}
          <Route path="/student/timetable" element={<StudentTimetable/>} />
          <Route path="/student/attendance" element={<StudentAttendance/>} />
          {/* <Route path="/student/exam" element={<StudentExam/>} /> */}
          {/* <Route path="/student/result" element={<StudentResult/>} />
          <Route path="/student/fees" element={<StudentFees/>} /> */}
          {/* <Route path="/student/notification" element={<StudentNotification/>} /> */}
          {/* <Route path="/student/leave" element={<StudentLeave/>} /> */}
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/assignments/submit/:id" element={<StudentSubmissionForm />} />
          <Route path="/student/assignments/view-submission/:id" element={<ViewSubmission />} />
          <Route path="/student/mycourse" element={<StudentSubjects />} />
          <Route path="/student/myteacher" element={<MyTeacher />} />
          <Route path="/student/notice" element={<StudentNotice />} />
          {/* chat/messaging */}
          <Route path="/messages" element={
            <ProtectedRoute requiredRoles={['admin', 'teacher', 'student', 'parent']}>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/fee" element={<FeeList />} />
<Route path="/fee/add" element={<AddFee />} />
<Route path="/fee/edit/:id" element={<EditFee />} />
<Route path="/admin-attendance" element={
  <ProtectedRoute requiredRoles={['admin']}>
    <AdminAttendance />
  </ProtectedRoute>
} />
<Route path="/admin-attendance/teacher" element={
  <ProtectedRoute requiredRoles={['admin']}>
    <MarkTeacherAttendance />
  </ProtectedRoute>
} />
<Route path="/orders" element={
  <ProtectedRoute requiredRoles={['admin']}>
    <OrderList />
  </ProtectedRoute>
} />
<Route path="/orders/:id" element={
  <ProtectedRoute requiredRoles={['admin']}>
    <OrderDetails />
  </ProtectedRoute>
} />

<Route path="/admin-attendance/teacher/view" element={
  <ProtectedRoute requiredRoles={['admin']}>
    <ViewTeacherAttendance />
  </ProtectedRoute>
} />
        </Routes>
      </Router>
   
  )
}
