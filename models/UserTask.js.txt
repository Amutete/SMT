const mongoose = require('mongoose');

const userTaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  assignedDate: { type: Date, default: () => new Date().setHours(0,0,0,0) },
  completed: { type: Boolean, default: false },
  completedAt: Date,
});

module.exports = mongoose.model('UserTask', userTaskSchema);
