import React, { useEffect, useState } from "react";
import authAxios, { getUserData } from "../../utils/auth";
import { Search } from "lucide-react";
import Layout from "../../components/layoutes/studentlayout";

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [loading, setLoading] = useState(false);

  const userData = getUserData();

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await authAxios.get(`/attendance/student/${userData.id}`);
        setRecords(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const filteredRecords = records.filter((record) =>
    record.date.includes(searchDate)
  );

  const countStatus = (status) =>
    records.filter(
      (r) =>
        r.studentRecord &&
        r.studentRecord.status &&
        r.studentRecord.status.toLowerCase() === status
    ).length;

  const stats = {
    present: countStatus("present"),
    absent: countStatus("absent"),
    late: countStatus("late"),
  };

  return (
    <Layout>
      <div className="w-full p-6 bg-gray-50">
        <header className="mb-6 bg-white p-5 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl font-semibold text-gray-800">
                My Attendance
              </h1>
              <p className="text-sm text-gray-500">
                View your subject-wise attendance
              </p>
            </div>
            <div className="relative w-full md:w-auto">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </header>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 text-green-800 p-4 rounded-lg shadow">
            <p className="text-sm font-medium">Present</p>
            <p className="text-2xl font-bold">{stats.present}</p>
          </div>
          <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow">
            <p className="text-sm font-medium">Absent</p>
            <p className="text-2xl font-bold">{stats.absent}</p>
          </div>
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow">
            <p className="text-sm font-medium">Late</p>
            <p className="text-2xl font-bold">{stats.late}</p>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-lg shadow-sm bg-white">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center p-4">Loading...</td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {record.subject?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                      {record.studentRecord?.status || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {record.studentRecord?.remarks || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-sm text-gray-500">
                    No attendance records found.
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

export default StudentAttendance;
