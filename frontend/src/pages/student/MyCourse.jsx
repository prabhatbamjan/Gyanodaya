import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import authAxios ,{getUserData}from '../../utils/auth'; 
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import Layout from '../../components/layoutes/studentlayout';


const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]); // Ensure it's an empty array by default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  const userData = getUserData();
 

  // Fetch subjects when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response1 = await authAxios.get(`students/${userData.id}`);
      
        const classId = response1.data.data.student.class._id; 
    
        const subjectsRes = await authAxios.get(`/classes/${classId}`);
      
      
     
   
        setSubjects(subjectsRes.data.data.subjects); // Update the state with the fetched data
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        setError(error); // Handle any error that occurs during fetching
        setLoading(false);
      }
    };

    fetchData(); // Call the async function
  }, []);

 
  

  const filteredSubjects = Array.isArray(subjects) ? subjects.filter(subject => {
    return (
      (subject.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       subject.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterDepartment === "" || subject.department === filterDepartment)
    );
  }) : [];

  return (
    <Layout>
      <div className="w-full p-6 bg-gray-50">
        <header className="mb-6 bg-white p-5 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl font-semibold text-gray-800">All Subjects</h1>
              <p className="text-sm text-gray-500">Manage all academic subjects</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-auto">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
          
              
              
            </div>
          </div>
        </header>

        <div className="w-full overflow-x-auto rounded-lg shadow-sm bg-white">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  CODE
                </th>
                <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  NAME
                </th>
                <th scope="col" className="hidden md:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  DEPARTMENT
                </th>
                <th scope="col" className="hidden md:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  DESCRIPTION
                </th>
               
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 md:px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject._id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">{subject.code}</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{subject.name}</td>
                    <td className="hidden md:table-cell px-4 md:px-6 py-4 text-sm text-gray-700">{subject.department}</td>
                    <td className="hidden md:table-cell px-4 md:px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{subject.description}</td>
                
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No subjects found. Try adjusting your search criteria or add a new subject.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default SubjectManagement;
