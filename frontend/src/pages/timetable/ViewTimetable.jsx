import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Edit, RefreshCw } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const ViewTimetable = () => {
  const { classId } = useParams();
  const [timetable, setTimetable] = useState({});
  const [classInfo, setClassInfo] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const printRef = useRef(null);
  const navigate = useNavigate();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all necessary data in parallel
      const [timetableResponse, classResponse, subjectsResponse, teachersResponse] = await Promise.all([
        authAxios.get(`timetables/class/${classId}`),
        authAxios.get(`classes/${classId}`),
        authAxios.get('subjects/'),
        authAxios.get('teachers/')
      ]);
   
      const allOk = [timetableResponse, classResponse, subjectsResponse, teachersResponse].every(
        res => res.status === 200
      );
      
      if (!allOk) {
        throw new Error('One or more API responses were not OK');
      }
    
      const subjectsData = subjectsResponse.data.data;
      const teachersData = teachersResponse.data.data;
      const timetableData = timetableResponse.data.data;

      // Create lookup objects for quick access
      const subjectsMap = subjectsData.reduce((map, subject) => {
        map[subject._id] = subject;
        return map;
      }, {});

      const teachersMap = teachersData.reduce((map, teacher) => {
        map[teacher._id] = teacher;
        return map;
      }, {});

      // Organize timetable by days and enrich with subject/teacher data
      const timetableByDay = {};
      days.forEach(day => {
        const dayTimetable = timetableData.find(t => t.day === day);
        if (dayTimetable) {
          // Sort periods by periodNumber and enrich with subject/teacher info
          const enrichedPeriods = dayTimetable.periods
            .sort((a, b) => a.periodNumber - b.periodNumber)
            .map(period => ({
              ...period,
              subject: subjectsMap[period.subject._id] || { name: 'Unknown Subject' },
              teacher: teachersMap[period.teacher._id] || { firstName: 'Unknown', lastName: 'Teacher' }
            }));
          
          timetableByDay[day] = {
            ...dayTimetable,
            periods: enrichedPeriods
          };
        } else {
          timetableByDay[day] = null;
        }
      });

      setTimetable(timetableByDay);
      setClassInfo(classResponse.data.data);
      setSubjects(subjectsData);
      setTeachers(teachersData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Get all unique period numbers across all days
  const getAllPeriods = () => {
    const periods = new Set();
    days.forEach(day => {
      if (timetable[day]?.periods) {
        timetable[day].periods.forEach(period => {
          periods.add(period.periodNumber);
        });
      }
    });
    return Array.from(periods).sort((a, b) => a - b);
  };

  const getPeriodByNumber = (day, periodNumber) => {
    if (!timetable[day]) return null;
    return timetable[day].periods?.find(p => p.periodNumber === periodNumber) || null;
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const originalContents = document.body.innerHTML;
    
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
          <title>Timetable - ${classInfo ? `${classInfo.name} Grade ${classInfo.grade}${classInfo.section}` : 'Class'}</title>
          <style>${printCSS}</style>
        </head>
        <body>
          <div class="print-header">
            <h1>${classInfo ? `Timetable for ${classInfo.name} - Grade ${classInfo.grade}${classInfo.section}` : 'Class Timetable'}</h1>
            <p>Academic Year: ${Object.values(timetable).find(t => t !== null)?.academicYear || 'N/A'}</p>
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


  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin-timetable')}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Timetables
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader size="large" text="Loading timetable..." />
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {classInfo ? `Timetable for ${classInfo.name} - Grade ${classInfo.grade}${classInfo.section}` : 'Class Timetable'}
              </h1>
              <p className="text-gray-600">
                Academic Year: {Object.values(timetable).find(t => t !== null)?.academicYear || 'N/A'}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden mb-6" ref={printRef}>
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
                              <div className="min-w-[120px]">
                                <div className="font-medium text-gray-800">
                                  {period.subject.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {period.teacher.firstName} {period.teacher.lastName}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {period.startTime} - {period.endTime}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">Timetable Legend</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map(subject => (
                  <div key={subject._id} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                    <span className="text-sm font-medium">{subject.name}</span>
                    <span className="text-xs text-gray-500">({subject.code})</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ViewTimetable;