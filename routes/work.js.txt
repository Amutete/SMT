const express = require('express');
const auth = require('../middleware/auth');
const UserTask = require('../models/UserTask');
const User = require('../models/User');

const router = express.Router();

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

router.get('/tasks/today', auth, async (req, res) => {
  try {
    const today = startOfToday();
    const tasks = await UserTask.find({ user: req.user.id, assignedDate: today }).populate('task');
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

router.post('/tasks/complete/:taskId', auth, async (req, res) => {
  try {
    const userTask = await UserTask.findById(req.params.taskId).populate('task');
    if (!userTask) return res.status(404).json({ message: 'Task not found' });
    if (userTask.user.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (userTask.completed) return res.status(400).json({ message: 'Task already completed' });

    userTask.completed = true;
    userTask.completedAt = new Date();
    await userTask.save();

    const user = await User.findById(req.user.id);

    const earningMap = {
      'freelance_4000': 16.25,
      'freelance_10000': 37.5,
      'freelance_25000': 133.3,
      'freelance_50000': 266.67,
      'teamleader': 825,
      'supervisor': 2200,
      'manager': 8300,
    };

    const earning = earningMap[user.investmentLevel] || 0;

    user.tasksCompletedToday += 1;
    user.earnings.dailyProfit += earning;
    user.earnings.totalProfit += earning;

    await user.save();

    res.json({ message: 'Task marked complete', dailyProfit: user.earnings.dailyProfit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error completing task' });
  }
});

module.exports = router;
