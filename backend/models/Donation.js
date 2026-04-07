const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carehome: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  amount: { type: Number, required: true, min: 0.5 },
  message: { type: String, default: '', trim: true },
  isAnonymous: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'completed' },
  stripePaymentId: { type: String, default: '' },
  pointsEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Donation', DonationSchema);
