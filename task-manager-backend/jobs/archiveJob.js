const Task = require('../models/Task');

const archiveCompletedTasks = async () => {
  try {
    const completedTasks = await Task.find({ 
      completed: true, 
      archived: false 
    });

    if (completedTasks.length > 0) {
      await Task.updateMany(
        { completed: true, archived: false },
        { 
          archived: true, 
          archivedAt: new Date() 
        }
      );

      console.log(`Archived ${completedTasks.length} completed tasks`);
    }
  } catch (error) {
    console.error('Error archiving completed tasks:', error);
  }
};

module.exports = { archiveCompletedTasks };