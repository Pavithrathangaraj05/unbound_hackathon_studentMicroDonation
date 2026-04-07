const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @GET /api/carehomes - Get all approved care homes
router.get('/', async (req, res) => {
  try {
    const { search, city } = req.query;
    const filter = { role: 'carehome', 'carehomeProfile.isApproved': true, isActive: true };
    if (city) filter['carehomeProfile.city'] = { $regex: city, $options: 'i' };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'carehomeProfile.facilityName': { $regex: search, $options: 'i' } },
      { 'carehomeProfile.city': { $regex: search, $options: 'i' } },
    ];

    const carehomes = await User.find(filter)
      .select('name email avatar carehomeProfile createdAt')
      .sort('-carehomeProfile.totalReceived');

    res.json(carehomes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/carehomes/:id
router.get('/:id', async (req, res) => {
  try {
    const carehome = await User.findOne({ _id: req.params.id, role: 'carehome' })
      .select('-password');
    if (!carehome) return res.status(404).json({ message: 'Care home not found' });
    res.json(carehome);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
