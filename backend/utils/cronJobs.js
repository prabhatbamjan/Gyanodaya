const cron = require('node-cron');
const Exam = require('../models/examModel');
const Event = require('../models/eventModel');
const Assignment = require('../models/assignmentModel');
const Submission = require('../models/submissionModel');

/**
 * Updates exam statuses based on their start and end dates
 * - Upcoming: start date is in the future
 * - Ongoing: current date is between start and end dates
 * - Completed: end date is in the past
 */
const updateExamStatuses = async () => {
  const now = new Date();
  
  try {
    console.log('Running scheduled exam status update...');
    
    // Update exams whose status is 'Upcoming' but should be 'Ongoing'
    await Exam.updateMany(
      { 
        status: 'Upcoming',
        startDate: { $lte: now },
        endDate: { $gte: now }
      },
      { status: 'Ongoing' }
    );
    
    // Update exams whose status is 'Ongoing' but should be 'Completed'
    await Exam.updateMany(
      {
        status: 'Ongoing',
        endDate: { $lt: now }
      },
      { status: 'Completed' }
    );
    
    console.log('Exam status update completed');
  } catch (error) {
    console.error('Error updating exam statuses:', error);
  }
};

/**
 * Updates event statuses based on their start and end dates
 * - upcoming: start date is in the future
 * - ongoing: current date is between start and end dates
 * - completed: end date is in the past
 */
const updateEventStatuses = async () => {
  const now = new Date();
  
  try {
    console.log('Running scheduled event status update...');
    
    // Update events whose status is 'upcoming' but should be 'ongoing'
    await Event.updateMany(
      { 
        status: 'upcoming',
        startDate: { $lte: now },
        endDate: { $gte: now }
      },
      { status: 'ongoing' }
    );
    
    // Update events whose status is 'ongoing' but should be 'completed'
    await Event.updateMany(
      {
        status: { $in: ['upcoming', 'ongoing'] },
        endDate: { $lt: now }
      },
      { status: 'completed' }
    );
    
    console.log('Event status update completed');
  } catch (error) {
    console.error('Error updating event statuses:', error);
  }
};

/**
 * Updates assignment submissions status to 'late' if submitted after due date
 * Also marks unsubmitted assignments as late if due date has passed
 */
const updateAssignmentStatuses = async () => {
  const now = new Date();
  
  try {
    console.log('Running scheduled assignment status update...');
    
    // Find assignments with due dates that have passed
    const pastDueAssignments = await Assignment.find({
      dueDate: { $lt: now },
      isDraft: false
    });
    
    if (pastDueAssignments.length > 0) {
      console.log(`Found ${pastDueAssignments.length} past due assignments to check`);
      
      // Update submissions to 'late' status if they were submitted after the due date
      // and aren't already graded or returned
      for (const assignment of pastDueAssignments) {
        await Submission.updateMany(
          {
            assignment: assignment._id,
            status: 'submitted',
            submittedAt: { $gt: assignment.dueDate }
          },
          { 
            status: 'late',
            isLate: true 
          }
        );
      }
    }
    
    console.log('Assignment status update completed');
  } catch (error) {
    console.error('Error updating assignment statuses:', error);
  }
};

/**
 * Schedule all status update jobs
 */
const scheduleStatusUpdates = () => {
  // Run status updates immediately on server start
  updateExamStatuses();
  updateEventStatuses();
  updateAssignmentStatuses();
  
  // Schedule exam status updates to run every hour
  cron.schedule('0 * * * *', updateExamStatuses);
  
  // Schedule event status updates to run every hour
  cron.schedule('15 * * * *', updateEventStatuses);
  
  // Schedule assignment status updates to run every 2 hours
  cron.schedule('30 */2 * * *', updateAssignmentStatuses);
  
  console.log('All status update jobs scheduled');
};

module.exports = { 
  updateExamStatuses, 
  updateEventStatuses,
  updateAssignmentStatuses,
  scheduleStatusUpdates
}; 