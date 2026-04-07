const express = require('express');
const router = express.Router();
const WishlistItem = require('../models/WishlistItem');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { carehome, category, fulfilled } = req.query;
    const filter = {};
    if (carehome) filter.carehome = carehome;
    if (category) filter.category = category;
    if (fulfilled !== undefined) filter.isFulfilled = fulfilled === 'true';
    const items = await WishlistItem.find(filter)
      .populate('carehome', 'name carehomeProfile')
      .populate('fulfilledBy', 'name')
      .populate('partialFulfillments.student', 'name')
      .sort('-createdAt');
    res.json(items);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', protect, authorize('carehome'), async (req, res) => {
  try {
    const { price, qrCode, ...rest } = req.body;
    const item = await WishlistItem.create({
      ...rest,
      price: parseFloat(price),
      originalPrice: parseFloat(price),
      qrCode: qrCode || req.user.carehomeProfile?.qrCode || '',
      carehome: req.user._id,
    });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// Partial fulfillment - student pays half
router.put('/:id/partial-fulfill', protect, authorize('student'), async (req, res) => {
  try {
    const item = await WishlistItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.isFulfilled) return res.status(400).json({ message: 'Item already fully fulfilled' });

    const { amountPaid, isInPerson, message } = req.body;
    const paid = parseFloat(amountPaid);

    item.partialFulfillments.push({
      student: req.user._id,
      studentName: req.user.name,
      amountPaid: paid,
      isInPerson: isInPerson || false,
      message: message || '',
    });

    item.price = Math.max(0, item.price - paid);

    if (item.price <= 0) {
      item.isFulfilled = true;
      item.fulfilledBy = req.user._id;
      item.fulfilledAt = new Date();
    } else if (paid >= item.originalPrice / 2) {
      item.isHalfFulfilled = true;
    }

    await item.save();
    const populated = await WishlistItem.findById(item._id)
      .populate('carehome', 'name carehomeProfile')
      .populate('partialFulfillments.student', 'name');
    res.json(populated);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// Full fulfillment
router.put('/:id/fulfill', protect, authorize('student'), async (req, res) => {
  try {
    const item = await WishlistItem.findByIdAndUpdate(
      req.params.id,
      { isFulfilled: true, fulfilledBy: req.user._id, fulfilledAt: Date.now(), price: 0 },
      { new: true }
    ).populate('carehome', 'name carehomeProfile');
    res.json(item);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', protect, authorize('carehome'), async (req, res) => {
  try {
    await WishlistItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
