import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sunday'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all necessary data in parallel
        const [timetableResponse, classResponse, subjectsResponse, teachersResponse] = await Promise.all([
          authAxios.get(`timetables/class/${classId}`),
          authAxios.get(`classes/${classId}`),
          authAxios.get('subjects/'),
          authAxios.get('teachers/')
        ]);

        if (!timetableResponse.data.success || !classResponse.data.success || 
            !subjectsResponse.data.success || !teachersResponse.data.success) {
          throw new Error('Failed to fetch required data');
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
                subject: subjectsMap[period.subject] || { name: 'Unknown Subject' },
                teacher: teachersMap[period.teacher] || { firstName: 'Unknown', lastName: 'Teacher' }
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
      }
    };

    if (classId) {
      fetchData();
    }
  }, [classId]);

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/admin-timetable" className="flex items-center text-blue-600 mb-4">
          <ArrowLeft className="mr-2" size={16} />
          Back to Timetables
        </Link>

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

            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Day / Period
                      </th>
                      {getAllPeriods().map(periodNum => (
                        <th 
                          key={`period-${periodNum}`} 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Period {periodNum}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {days.map((day, idx) => (
                      <tr key={day} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {day}
                        </td>
                        {getAllPeriods().map(periodNum => {
                          const period = getPeriodByNumber(day, periodNum);
                          return (
                            <td key={`${day}-${periodNum}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {period ? (
                                <div>
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
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ViewTimetable;