const Attendance = require('../models/attendanceModel');
const TAttendance = require('../models/TattemdanceModel');
const Class = require('../models/classModel');
const Student = require('../models/studentModel');
const Teacher = require('../models/teacherModel');
const Subject = require('../models/subjectModel');
const Notification = require('../models/notificationModel');

// Get all attendance records with filters
exports.getAttendanceRecords = async (req, res) => {
    try {
        const {
            classId,
            subjectId,
            teacherId,
            studentId,
            startDate,
            endDate,
            status
        } = req.query;

        const query = {};

        if (classId) query.class = classId;
        if (subjectId) query.subject = subjectId;
        if (teacherId) query.teacher = teacherId;
        if (status) query.status = status;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        if (studentId) {
            query['records.student'] = studentId;
        }

        const attendance = await Attendance.find(query)
            .populate('class', 'name grade section')
            .populate('subject', 'name code')
            .populate('teacher', 'firstName lastName')
            .populate('records.student', 'firstName lastName rollNumber')
            .populate('records.markedBy', 'firstName lastName')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendance records',
            error: error.message
        });
    }
};

// Create new attendance record
exports.createAttendance = async (req, res) => {
    try {
        const {
            class: classId,
            subject: subjectId,
            date,
            period,
            records,
            teacher: teacherId,
            academicYear
        } = req.body;

        // Validate class exists
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Validate subject exists
        const subjectExists = await Subject.findById(subjectId);
        if (!subjectExists) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Validate teacher exists
        const teacherExists = await Teacher.findById(teacherId);
        if (!teacherExists) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Validate all students exist
        for (const record of records) {
            const studentExists = await Student.findById(record.student);
            if (!studentExists) {
                return res.status(404).json({
                    success: false,
                    message: `Student with ID ${record.student} not found`
                });
            }
        }

        // Check if attendance already exists for this class, subject, and date
        const existingAttendance = await Attendance.findOne({
            class: classId,
            subject: subjectId,
            date: new Date(date),
            period
        });

        if (existingAttendance) {
            return res.status(409).json({
                success: false,
                message: 'Attendance record already exists for this class, subject, and period'
            });
        }

        const attendance = await Attendance.create({
            class: classId,
            subject: subjectId,
            date: new Date(date),
            period,
            records,
            teacher: teacherId,
            academicYear
        });

        // Create notifications for absent students
        const absentStudents = records.filter(record => record.status === 'absent');
        for (const record of absentStudents) {
            await Notification.create({
                recipient: record.student,
                type: 'attendance',
                title: 'Absence Recorded',
                message: `You were marked absent for ${subjectExists.name} on ${new Date(date).toLocaleDateString()}`,
                relatedTo: attendance._id
            });
        }

        const populatedAttendance = await Attendance.findById(attendance._id)
            .populate('class', 'name grade section')
            .populate('subject', 'name code')
            .populate('teacher', 'firstName lastName')
            .populate('records.student', 'firstName lastName rollNumber')
            .populate('records.markedBy', 'firstName lastName');

        res.status(201).json({
            success: true,
            data: populatedAttendance
        });
    } catch (error) {
        console.error('Error creating attendance record:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

// Update attendance record
exports.updateAttendance = async (req, res) => {
    try {
        const { records, status } = req.body;

        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }

        // Update records if provided
        if (records) {
            attendance.records = records;
        }

        // Update status if provided
        if (status) {
            attendance.status = status;
        }

        await attendance.save();

        const updatedAttendance = await Attendance.findById(attendance._id)
            .populate('class', 'name grade section')
            .populate('subject', 'name code')
            .populate('teacher', 'firstName lastName')
            .populate('records.student', 'firstName lastName rollNumber')
            .populate('records.markedBy', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: updatedAttendance
        });
    } catch (error) {
        console.error('Error updating attendance record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update attendance record',
            error: error.message
        });
    }
};




exports.getAttendanceByTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId; // or req.user.id if using auth

    const attendanceRecords = await Attendance.find({ teacher: teacherId })
      .populate('class', 'name section')        // optional: to get class info
      .populate('subject', 'name')              // optional: to get subject name
      .populate('records.student', 'firstName lastName rollNumber'); // optional: get student details

    res.status(200).json({
      success: true,
      data: attendanceRecords
    });
  } catch (err) {
    console.error('Error fetching attendance by teacher:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: err.message
    });
  }
};
exports.getAttendanceById =async(req,res) =>{
    
    try {
        const attendanceId = req.params.id;
    
        const attendance = await Attendance.findById(attendanceId)
          .populate('class', 'name section academicYear')
          .populate('subject', 'name')
          .populate('records.student', 'firstName lastName rollNumber')
          .populate('records.markedBy', 'firstName lastName')
          .populate('teacher', 'firstName lastName');
    
        if (!attendance) {
          return res.status(404).json({ success: false, message: 'Attendance not found' });
        }
    
        res.json({ success: true, data: attendance });
      } catch (err) {
        console.error('Error fetching attendance:', err);
        res.status(500).json({ success: false, message: 'Server error' });
      }

}
// Delete attendance record
exports.deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }

        await attendance.remove();

        res.status(200).json({
            success: true,
            message: 'Attendance record deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting attendance record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete attendance record',
            error: error.message
        });
    }
};

// Generate attendance report
exports.generateReport = async (req, res) => {
    try {
        const {
            classId,
            subjectId,
            startDate,
            endDate,
            reportType // daily, weekly, monthly
        } = req.query;

        const query = {};
        if (classId) query.class = classId;
        if (subjectId) query.subject = subjectId;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const attendance = await Attendance.find(query)
            .populate('class', 'name grade section')
            .populate('subject', 'name code')
            .populate('records.student', 'firstName lastName rollNumber')
            .sort({ date: 1 });

        // Process attendance data based on report type
        let report = {};
        
        if (reportType === 'daily') {
            attendance.forEach(record => {
                const date = record.date.toISOString().split('T')[0];
                if (!report[date]) {
                    report[date] = {
                        date,
                        total: 0,
                        present: 0,
                        absent: 0,
                        late: 0,
                        excused: 0
                    };
                }
                
                const stats = record.statistics;
                report[date].total += stats.total;
                report[date].present += stats.present;
                report[date].absent += stats.absent;
                report[date].late += stats.late;
                report[date].excused += stats.excused;
            });
        } else if (reportType === 'weekly') {
            attendance.forEach(record => {
                const weekNumber = getWeekNumber(record.date);
                const weekKey = `Week ${weekNumber}`;
                
                if (!report[weekKey]) {
                    report[weekKey] = {
                        week: weekNumber,
                        total: 0,
                        present: 0,
                        absent: 0,
                        late: 0,
                        excused: 0
                    };
                }
                
                const stats = record.statistics;
                report[weekKey].total += stats.total;
                report[weekKey].present += stats.present;
                report[weekKey].absent += stats.absent;
                report[weekKey].late += stats.late;
                report[weekKey].excused += stats.excused;
            });
        } else if (reportType === 'monthly') {
            attendance.forEach(record => {
                const month = record.date.toLocaleString('default', { month: 'long' });
                const year = record.date.getFullYear();
                const monthKey = `${month} ${year}`;
                
                if (!report[monthKey]) {
                    report[monthKey] = {
                        month,
                        year,
                        total: 0,
                        present: 0,
                        absent: 0,
                        late: 0,
                        excused: 0
                    };
                }
                
                const stats = record.statistics;
                report[monthKey].total += stats.total;
                report[monthKey].present += stats.present;
                report[monthKey].absent += stats.absent;
                report[monthKey].late += stats.late;
                report[monthKey].excused += stats.excused;
            });
        }

        // Calculate percentages
        Object.keys(report).forEach(key => {
            const data = report[key];
            data.presentPercentage = (data.present / data.total) * 100;
            data.absentPercentage = (data.absent / data.total) * 100;
            data.latePercentage = (data.late / data.total) * 100;
            data.excusedPercentage = (data.excused / data.total) * 100;
        });

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generating attendance report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate attendance report',
            error: error.message
        });
    }
};

// Helper function to get week number
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
} 
 exports.getStudentAttendance = async (req, res) => {
        const { studentId } = req.params;

        try {
            const records = await Attendance.find({ 'records.student': studentId })            
                .sort({ date: -1 });    
                

                res.status(200).json({
                    success: true,
                    count: records.length,
                    data: records
                });
        } catch (error) {
            console.error('Error fetching student attendance:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch student attendance',
                error: error.message
            });
        }
    }


exports.createTAttendance = async (req, res) => {
    try {
        const {
           
            date,
          
            records,
            user: userId,
            
        } = req.body;

        // Validate class exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

       
       

        // Validate all students exist
        for (const record of records) {
            const teacherExists = await Teacher.findById(record.teacher);
            if (!teacherExists) {
                return res.status(404).json({
                    success: false,
                    message: `Teacher with ID ${record.teacher} not found`
                });
            }
        }

        // Check if attendance already exists for this class, subject, and date
        const existingAttendance = await TAttendance.findOne({
            
            date: new Date(date),
            
        });

        if (existingAttendance) {
            return res.status(409).json({
                success: false,
                message: 'Attendance record already exists for this class, subject, and period'
            });
        }

        const attendance = await TAttendance.create({
            
            date: new Date(date),
            records,
            user: userId,
            
        });

        // Create notifications for absent students
        const absentTeachers= records.filter(record => record.status === 'absent');
        for (const record of absentTeachers) {
            await Notification.create({
                recipient: record.teacher,
                type: 'attendance',
                title: 'Absence Recorded',
                message: `You were marked absent on ${new Date(date).toLocaleDateString()}`,
                relatedTo: attendance._id
            });
        }

        const populatedAttendance = await TAttendance.findById(attendance._id)
            .populate('user', 'firstName lastName')
            .populate('records.teacher', 'firstName lastName')
            .populate('records.markedBy', 'firstName lastName');

        res.status(201).json({
            success: true,
            data: populatedAttendance
        });
    } catch (error) {
        console.error('Error creating teacher attendance record:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

 

// GET /api/attendance/student/:studentId
exports.getStudentAttendance = async (req, res) => {
    const { studentId } = req.params;

    try {
        const records = await Attendance.find({ 'records.student': studentId })
            .populate('class', 'name grade section')
            .populate('subject', 'name code')
            .populate('teacher', 'firstName lastName')
            .populate('records.student', 'firstName lastName rollNumber')
            .populate('records.markedBy', 'firstName lastName')
            .sort({ date: -1 });

        // Filter records to only include the student's subdocument from each attendance
        const filteredRecords = records.map(attendance => {
            const studentRecord = attendance.records.find(
                record => record.student._id.toString() === studentId
            );

            return {
                _id: attendance._id,
                class: attendance.class,
                subject: attendance.subject,
                date: attendance.date,
                period: attendance.period,
                teacher: attendance.teacher,
                academicYear: attendance.academicYear,
                status: attendance.status,
                studentRecord
            };
        });

        res.status(200).json({
            success: true,
            count: filteredRecords.length,
            data: filteredRecords
        });
    } catch (error) {
        console.error('Error retrieving student attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getAttendanceRate = async (req, res) => {
    try {
        // 1. Get total number of students
        const totalStudents = await Student.countDocuments();
        console.log(totalStudents)
        
        // 2. Get total school days (unique dates with attendance records)
        const schoolDays = await Attendance.distinct('date');
        const totalSchoolDays = schoolDays.length;

        // 3. Check for valid data
        if (totalStudents === 0 || totalSchoolDays === 0) {
            return res.status(200).json({
                attendanceRate: 0,
                message: 'Insufficient data to calculate attendance rate'
            });
        }

        // 4. Calculate total possible attendance slots
        const totalPossibleSlots = totalStudents * totalSchoolDays;

        // 5. Aggregate total present attendance records
        const presentCountResult = await Attendance.aggregate([
            { $unwind: '$records' },
            { 
                $group: {
                    _id: null,
                    totalPresent: { 
                        $sum: {
                            $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const totalPresent = presentCountResult[0]?.totalPresent || 0;

        // 6. Calculate attendance rate
        const attendanceRate = (totalPresent / totalPossibleSlots) * 100;

        res.status(200).json({
            success: true,
            attendanceRate: attendanceRate.toFixed(2),
            statistics: {
                totalStudents,
                totalSchoolDays,
                totalPossibleSlots,
                totalPresent,
                totalAbsent: totalPossibleSlots - totalPresent
            }
        });

    } catch (error) {
        console.error('Error calculating attendance rate:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while calculating attendance rate',
            error: error.message
        });
    }
};