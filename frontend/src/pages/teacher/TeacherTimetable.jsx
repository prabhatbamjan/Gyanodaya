import React, { useState, useEffect, useRef } from 'react';
import { Printer, Download, RefreshCw, Calendar } from 'lucide-react';
import Layout from '../../components/layoutes/teacherlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';
import { getUserData } from '../../utils/auth';

const TeacherTimetable = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timetableData, setTimetableData] = useState([]);
  const [organizedTimetable, setOrganizedTimetable] = useState({});
  const [teacherData, setTeacherData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const printRef = useRef(null);
  const userData = getUserData();

  // Include Sunday if needed
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimetable();
  }, []);

  useEffect(() => {
    organizeTimetableData();
  }, [timetableData]);

  const fetchTimetable = async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);

    try {
      const teacherResponse = await authAxios.get(`teachers/${userData.id}`);
      const teacher = teacherResponse.data.data;
      setTeacherData(teacher);

      const timetableRes = await authAxios.get(`timetables/teacher/${userData.id}`);

      if (timetableRes.status !== 200) {
        throw new Error('Failed to fetch timetable');
      }

      setTimetableData(timetableRes.data.data);
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setError(err.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const organizeTimetableData = () => {
    if (!timetableData || timetableData.length === 0) return;

    const organized = {};
    days.forEach(day => {
      organized[day] = [];
    });

    timetableData.forEach(timetable => {
      const day = timetable.day;

      if (timetable.periods && timetable.periods.length > 0) {
        timetable.periods.forEach(period => {
          if (period.teacher && period.teacher._id === userData.id) {
            organized[day] = organized[day] || [];
            organized[day].push({
              ...period,
              class: timetable.class,
            });
          }
        });
      }
    });

    Object.keys(organized).forEach(day => {
      if (organized[day]) {
        organized[day].sort((a, b) => a.periodNumber - b.periodNumber);
      }
    });

    setOrganizedTimetable(organized);
  };

  const handleRefresh = () => {
    fetchTimetable();
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const printCSS = `
      @page { size: landscape; margin: 10mm; }
      body { font-family: Arial, sans-serif; }
      .print-header { text-align: center; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Teacher Timetable - ${teacherData ? `${teacherData.firstName} ${teacherData.lastName}` : 'Teacher'}</title>
          <style>${printCSS}</style>
        </head>
        <body>
          <div class="print-header">
            <h1>Timetable for ${teacherData ? `${teacherData.firstName} ${teacherData.lastName}` : 'Teacher'}</h1>
            <p>Academic Year: ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</p>
          </div>
          ${printContent.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const getAllPeriods = () => {
    const periods = new Set();

    days.forEach(day => {
      if (organizedTimetable[day]) {
        organizedTimetable[day].forEach(period => {
          periods.add(period.periodNumber);
        });
      }
    });

    return Array.from(periods).sort((a, b) => a - b);
  };

  const getPeriodByNumber = (day, periodNumber) => {
    if (!organizedTimetable[day]) return null;
    return organizedTimetable[day].find(p => p.periodNumber === periodNumber) || null;
  };

  const getClassInfo = (classData) => {
    if (!classData) return 'N/A';
    let classInfo = classData.name || 'Unknown Class';
    if (classData.section) {
      classInfo += ` - ${classData.section}`;
    }
    return classInfo;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Timetable</h1>
            <p className="text-gray-600">Your weekly teaching schedule</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Timetable
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader size="large" text="Loading your timetable..." />
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={printRef}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                {teacherData ? `${teacherData.firstName} ${teacherData.lastName}'s Schedule` : 'My Schedule'}
              </h2>
              <p className="text-sm text-gray-500">
                Academic Year: {new Date().getFullYear()}-{new Date().getFullYear() + 1}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                      Day / Period
                    </th>
                    {getAllPeriods().map(periodNum => (
                      <th 
                        key={`period-${periodNum}`} 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Period {periodNum}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {days.map((day, idx) => (
                    <tr key={day} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10">
                        {day}
                      </td>
                      {getAllPeriods().map(periodNum => {
                        const period = getPeriodByNumber(day, periodNum);
                        return (
                          <td key={`${day}-${periodNum}`} className="px-4 py-4 text-sm text-gray-500">
                            {period ? (
                              <div className="bg-blue-50 p-2 rounded-md border-l-4 border-blue-400">
                                <div className="font-medium text-gray-800">
                                  {period.subject?.name || "Unknown Subject"}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  Class: {getClassInfo(period.class)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {period.startTime} - {period.endTime}
                                </div>
                                {period.roomNumber && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Room: {period.roomNumber}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">Free period</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {Object.values(organizedTimetable).every(day => !day || day.length === 0) && (
              <div className="p-6 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No classes scheduled</h3>
                <p className="text-gray-500 mb-4">
                  You don't have any classes scheduled yet. Please contact the administrator if you believe this is an error.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeacherTimetable;
