const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// @GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [students, carehomes, donations, campaigns] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'carehome' }),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Campaign.countDocuments({ isActive: true }),
    ]);
    res.json({
      students,
      carehomes,
      totalDonated: donations[0]?.total || 0,
      donationCount: donations[0]?.count || 0,
      activeCampaigns: campaigns,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @PUT /api/admin/carehomes/:id/approve
router.put('/carehomes/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 'carehomeProfile.isApproved': req.body.approved },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @PUT /api/admin/users/:id/toggle
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/admin/donations
router.get('/donations', async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('student', 'name email')
      .populate('carehome', 'name carehomeProfile.facilityName')
      .populate('campaign', 'title')
      .sort('-createdAt')
      .limit(100);
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
