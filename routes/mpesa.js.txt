const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/mpesa/callback', async (req, res) => {
  try {
    const callbackData = req.body;

    const resultCode = callbackData.Body.stkCallback.ResultCode;
    const resultDesc = callbackData.Body.stkCallback.ResultDesc;

    if (resultCode === 0) {
      const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata.Item;

      const amountItem = callbackMetadata.find(item => item.Name === 'Amount');
      const phoneItem = callbackMetadata.find(item => item.Name === 'PhoneNumber');

      const amount = amountItem?.Value;
      const phoneNumber = phoneItem?.Value?.toString();

      const user = await User.findOne({ phoneNumber });

      if (user) {
        user.isActive = true;
        user.investmentLockedUntil = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
        await user.save();

        console.log(`Payment confirmed for user ${user.username}, amount: ${amount}`);
      } else {
        console.warn(`User not found for phone number: ${phoneNumber}`);
      }
    } else {
      console.warn(`Payment failed: ${resultDesc}`);
    }

    res.status(200).send('Received');
  } catch (err) {
    console.error('Error processing M-Pesa callback:', err);
    res.status(500).send('Error');
  }
});

module.exports = router;
