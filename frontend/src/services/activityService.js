import authAxios from '../utils/auth';

// Function to get recent activities
export const getRecentActivities = async (limit = 5) => {
  try {
    // This combines data from different endpoints to create an activity feed
    const [
      studentRes,
      teacherRes,
      notificationRes,
      feeRes
    ] = await Promise.all([
      // Get recent student activities (new admissions, etc.)
      authAxios.get(`/students?limit=${limit}&sort=-createdAt`),
      // Get recent teacher activities (new hires, etc.)
      authAxios.get(`/teachers?limit=${limit}&sort=-createdAt`),
      // Get recent notifications
      authAxios.get(`/notifications?limit=${limit}&sort=-createdAt`),
      // Get recent fee collections
      authAxios.get(`/fees?limit=${limit}&sort=-createdAt`)
    ]);

    // Transform student data to activity format
    const studentActivities = studentRes.data.data.map(student => ({
      id: `student-${student._id}`,
      type: 'student',
      title: 'New student admission',
      description: `${student.firstName} ${student.lastName} was admitted to Grade ${student.class?.name || 'N/A'}`,
      timestamp: new Date(student.createdAt),
      icon: 'Users'
    }));

    // Transform teacher data to activity format
    const teacherActivities = teacherRes.data.data.map(teacher => ({
      id: `teacher-${teacher._id}`,
      type: 'teacher',
      title: 'New teacher joined',
      description: `${teacher.firstName} ${teacher.lastName} joined as ${teacher.subject?.name || 'N/A'} teacher`,
      timestamp: new Date(teacher.createdAt),
      icon: 'School2'
    }));

    // Transform notification data to activity format
    const notificationActivities = notificationRes.data.data.map(notification => ({
      id: `notification-${notification._id}`,
      type: 'notification',
      title: notification.title || 'New notification',
      description: notification.message,
      timestamp: new Date(notification.createdAt),
      icon: 'Bell'
    }));

    // Transform fee data to activity format
    const feeActivities = feeRes.data.data.map(fee => ({
      id: `fee-${fee._id}`,
      type: 'fee',
      title: 'Fee collection',
      description: `₹${fee.amount} collected from ${fee.student?.firstName || 'student'} ${fee.student?.lastName || ''}`,
      timestamp: new Date(fee.createdAt),
      icon: 'CreditCard'
    }));

    // Combine all activities
    const allActivities = [
      ...studentActivities,
      ...teacherActivities,
      ...notificationActivities,
      ...feeActivities
    ];

    // Sort by timestamp (most recent first) and limit to the requested number
    const sortedActivities = allActivities.sort((a, b) => 
      b.timestamp - a.timestamp
    ).slice(0, limit);

    return { data: sortedActivities };
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
}; 