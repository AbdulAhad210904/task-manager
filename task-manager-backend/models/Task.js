const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    maxlength: 200,
    trim: true,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  },
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  archivedAt: {
    type: Date,
    default: null
  }
});


taskSchema.pre('save', function(next) {
  if (this.isModified('archived') && this.archived && !this.archivedAt) {
    this.archivedAt = new Date();
  }
  next();
});

//to get all subtasks
taskSchema.methods.getSubtasks = async function() {
  return await this.constructor.find({ parentTask: this._id });
};

//method to cascade delete subtasks
taskSchema.statics.cascadeDelete = async function(taskId) {
  const subtasks = await this.find({ parentTask: taskId });
  
  for (const subtask of subtasks) {
    await this.cascadeDelete(subtask._id);
  }
  
  await this.findByIdAndDelete(taskId);
};

//circular references detection
taskSchema.pre('save', async function(next) {
  if (this.parentTask) {
    const isCircular = await this.constructor.findOne({
      _id: this.parentTask,
      $or: [
        { parentTask: this._id },
        { _id: this._id }
      ]
    });
    
    if (isCircular) {
      const error = new Error('Circular reference detected');
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);