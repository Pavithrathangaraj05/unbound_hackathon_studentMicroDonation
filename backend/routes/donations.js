const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Points calculation helper
const calculatePoints = (amount) => Math.floor(amount * 10);

// @POST /api/donations - Make a donation
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { carehome, campaign, amount, message, isAnonymous } = req.body;

    if (!carehome || !amount || amount < 0.5) {
      return res.status(400).json({ message: 'Invalid donation data' });
    }

    const pointsEarned = calculatePoints(amount);

    const donation = await Donation.create({
      student: req.user._id,
      carehome,
      campaign: campaign || undefined,
      amount,
      message,
      isAnonymous,
      pointsEarned,
      status: 'completed',
    });

    // Update student stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'studentProfile.totalDonated': amount,
        'studentProfile.donationCount': 1,
        'studentProfile.points': pointsEarned,
      }
    });

    // Update care home stats
    await User.findByIdAndUpdate(carehome, {
      $inc: { 'carehomeProfile.totalReceived': amount }
    });

    // Update campaign if provided
    if (campaign) {
      await Campaign.findByIdAndUpdate(campaign, {
        $inc: { raisedAmount: amount, donorCount: 1 }
      });
    }

    // Check and award badges
    const student = await User.findById(req.user._id);
    const badges = student.studentProfile.badges || [];
    const totalDonated = student.studentProfile.totalDonated;
    const donationCount = student.studentProfile.donationCount;

    const newBadges = [];
    if (donationCount >= 1 && !badges.includes('first_giver')) newBadges.push('first_giver');
    if (donationCount >= 5 && !badges.includes('regular_giver')) newBadges.push('regular_giver');
    if (donationCount >= 20 && !badges.includes('super_giver')) newBadges.push('super_giver');
    if (totalDonated >= 10 && !badges.includes('bronze_donor')) newBadges.push('bronze_donor');
    if (totalDonated >= 50 && !badges.includes('silver_donor')) newBadges.push('silver_donor');
    if (totalDonated >= 100 && !badges.includes('gold_donor')) newBadges.push('gold_donor');

    if (newBadges.length > 0) {
      await User.findByIdAndUpdate(req.user._id, { $push: { 'studentProfile.badges': { $each: newBadges } } });
    }

    const populated = await Donation.findById(donation._id)
      .populate('carehome', 'name carehomeProfile.facilityName')
      .populate('campaign', 'title');

    res.status(201).json({ donation: populated, pointsEarned, newBadges });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @GET /api/donations/my - Get my donations (student)
router.get('/my', protect, authorize('student'), async (req, res) => {
  try {
    const donations = await Donation.find({ student: req.user._id })
      .populate('carehome', 'name carehomeProfile.facilityName carehomeProfile.city')
      .populate('campaign', 'title image')
      .sort('-createdAt');
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/donations/received - Get received donations (carehome)
router.get('/received', protect, authorize('carehome'), async (req, res) => {
  try {
    const donations = await Donation.find({ carehome: req.user._id, status: 'completed' })
      .populate('student', 'name studentProfile.university avatar')
      .populate('campaign', 'title')
      .sort('-createdAt');
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/donations/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const students = await User.find({ role: 'student', 'studentProfile.totalDonated': { $gt: 0 } })
      .select('name avatar studentProfile.totalDonated studentProfile.donationCount studentProfile.badges studentProfile.university')
      .sort('-studentProfile.totalDonated')
      .limit(10);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/donations/stats - Platform stats
router.get('/stats', async (req, res) => {
  try {
    const [totalDonations, totalStudents, totalCareHomes, totalAmount] = await Promise.all([
      Donation.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'carehome' }),
      Donation.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);
    res.json({
      totalDonations,
      totalStudents,
      totalCareHomes,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
