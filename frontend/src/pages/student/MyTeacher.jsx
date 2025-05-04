import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import authAxios, { getUserData } from "../../utils/auth";
import Layout from "../../components/layoutes/studentlayout";

const MyTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const userData = getUserData();

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const studentRes = await authAxios.get(`/students/${userData.id}`);
        const classId = studentRes.data.data.student.class._id;

        const timetableRes = await authAxios.get(`timetables/class/${classId}`);
        const timetable = timetableRes.data.data;

        const teacherMap = {};

        timetable.forEach((dayEntry) => {
          dayEntry.periods.forEach((period) => {
            const subject = period.subject;
            const teacher = period.teacher;

            if (subject?._id && teacher?._id) {
              if (!teacherMap[subject._id]) {
                teacherMap[subject._id] = {
                  subjectName: subject.name,
                  subjectCode: subject.code,
                  teachers: []
                };
              }

              const teacherId = teacher._id;
              const exists = teacherMap[subject._id].teachers.some(t => t._id === teacherId);
              if (!exists) {
                teacherMap[subject._id].teachers.push({
                  _id: teacherId,
                  teacherName: `${teacher.firstName} ${teacher.lastName}`,
                  email: teacher.email || "N/A",
                  phone: teacher.phone || "N/A"
                });
              }
            }
          });
        });

        // Flatten the structure for rendering
        const flattened = [];
        Object.values(teacherMap).forEach((subjectEntry) => {
          subjectEntry.teachers.forEach((teacher) => {
            flattened.push({
              subjectName: subjectEntry.subjectName,
              subjectCode: subjectEntry.subjectCode,
              ...teacher
            });
          });
        });

        setTeachers(flattened);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const filtered = teachers.filter((t) =>
    t.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 bg-gray-50 w-full">
        <header className="mb-6 bg-white p-5 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl font-semibold text-gray-800">My Teachers</h1>
              <p className="text-sm text-gray-500">Teachers for your current subjects</p>
            </div>
            <div className="relative w-full md:w-auto">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by teacher name"
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="w-full overflow-x-auto rounded-lg shadow-sm bg-white">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">Loading...</td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((entry, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-700">{entry.subjectName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entry.teacherName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{entry.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{entry.phone}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-sm text-gray-500">
                    No teachers found.
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

export default MyTeachers;
