const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String,
  estimatedTimeMinutes: Number,
});

module.exports = mongoose.model('Task', taskSchema);
