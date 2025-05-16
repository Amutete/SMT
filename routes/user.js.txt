const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('referrals', 'username email investmentLevel isActive');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/profile', auth, async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

router.post('/activate', auth, async (req, res) => {
  const { investmentLevel, investmentAmount } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.investmentLevel = investmentLevel;
    user.investmentAmount = investmentAmount;
    user.isActive = true;
    user.investmentLockedUntil = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

    if (user.referrer) {
      const referrer = await User.findById(user.referrer);
      if (referrer) {
        const bonus = investmentAmount * 0.05;
        referrer.earnings.referralBonus += bonus;
        referrer.earnings.totalProfit += bonus;
        await referrer.save();
      }
    }

    await user.save();

    res.json({ message: 'Investment activated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/earnings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      dailyProfit: user.earnings.dailyProfit,
      referralBonus: user.earnings.referralBonus,
      totalProfit: user.earnings.totalProfit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching earnings' });
  }
});

router.get('/contract-days-left', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.investmentLockedUntil) return res.json({ daysLeft: 0 });

    const now = new Date();
    const diffTime = user.investmentLockedUntil.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    res.json({ daysLeft: diffDays > 0 ? diffDays : 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching contract days' });
  }
});

module.exports = router;
