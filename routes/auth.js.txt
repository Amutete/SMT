const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

router.post('/signup',
  [
    body('username').isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password, phoneNumber, referrerUsername } = req.body;

    try {
      let user = await User.findOne({ $or: [{ username }, { email }] });
      if (user) return res.status(400).json({ message: 'Username or Email already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({
        username,
        email,
        phoneNumber,
        password: hashedPassword,
      });

      await user.save();

      if (referrerUsername) {
        const referrer = await User.findOne({ username: referrerUsername });
        if (referrer) {
          referrer.referrals.push(user._id);
          await referrer.save();

          user.referrer = referrer._id;
          await user.save();
        }
      }

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { username: user.username, email: user.email, investmentLevel: user.investmentLevel, isActive: user.isActive } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
