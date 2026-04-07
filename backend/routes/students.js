const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @GET /api/students/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name avatar studentProfile.totalDonated studentProfile.donationCount studentProfile.badges studentProfile.university studentProfile.points')
      .sort('-studentProfile.totalDonated')
      .limit(20);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/students/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
