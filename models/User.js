const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
  investmentLevel: {
    type: String,
    enum: [
      'freelance_4000',
      'freelance_10000',
      'freelance_25000',
      'freelance_50000',
      'teamleader',
      'supervisor',
      'manager',
      null
    ],
    default: null,
  },
  investmentAmount: { type: Number, default: 0 },
  tasksCompletedToday: { type: Number, default: 0 },
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  earnings: {
    totalProfit: { type: Number, default: 0 },
    dailyProfit: { type: Number, default: 0 },
    referralBonus: { type: Number, default: 0 },
  },
  investmentLockedUntil: { type: Date, default: null },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
