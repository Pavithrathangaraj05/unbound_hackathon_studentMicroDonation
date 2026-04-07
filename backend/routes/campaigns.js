const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { category, search, sort = '-createdAt', carehome } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (carehome) filter.carehome = carehome;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const campaigns = await Campaign.find(filter)
      .populate('carehome', 'name carehomeProfile')
      .populate('volunteers.student', 'name studentProfile.university studentProfile.studentIdCardPhoto')
      .sort(sort).limit(50);
    res.json(campaigns);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('carehome', 'name carehomeProfile email')
      .populate('volunteers.student', 'name studentProfile email avatar');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', protect, authorize('carehome'), async (req, res) => {
  try {
    const campaign = await Campaign.create({ ...req.body, carehome: req.user._id });
    res.status(201).json(campaign);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

router.put('/:id', protect, authorize('carehome', 'admin'), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (req.user.role === 'carehome' && campaign.carehome.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', protect, authorize('carehome', 'admin'), async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ message: 'Campaign deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Volunteer for campaign
router.post('/:id/volunteer', protect, authorize('student'), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    const alreadyApplied = campaign.volunteers.find(v => v.student?.toString() === req.user._id.toString());
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied' });

    campaign.volunteers.push({
      student: req.user._id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      studentUniversity: req.user.studentProfile?.university || '',
      studentIdCardPhoto: req.user.studentProfile?.studentIdCardPhoto || '',
      message: req.body.message || '',
      status: 'pending',
    });
    await campaign.save();
    res.json({ message: 'Volunteer application submitted!' });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// Accept/reject volunteer
router.put('/:id/volunteer/:volId', protect, authorize('carehome'), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    const vol = campaign.volunteers.id(req.params.volId);
    if (!vol) return res.status(404).json({ message: 'Volunteer not found' });
    vol.status = req.body.status;
    await campaign.save();
    res.json(campaign);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/:id/updates', protect, authorize('carehome'), async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $push: { updates: { message: req.body.message } } },
      { new: true }
    );
    res.json(campaign);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
