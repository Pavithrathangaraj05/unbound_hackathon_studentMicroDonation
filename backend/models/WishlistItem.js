const mongoose = require('mongoose');

const PartialFulfillmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: String,
  amountPaid: Number,
  paidAt: { type: Date, default: Date.now },
  isInPerson: { type: Boolean, default: false },
  message: String,
});

const WishlistItemSchema = new mongoose.Schema({
  carehome: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  originalPrice: { type: Number, required: true },
  price: { type: Number, required: true },         // current remaining price
  category: { type: String, enum: ['books', 'games', 'clothing', 'food', 'medical', 'entertainment', 'other'], default: 'other' },
  image: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  isFulfilled: { type: Boolean, default: false },
  isHalfFulfilled: { type: Boolean, default: false },
  fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fulfilledAt: { type: Date },
  partialFulfillments: [PartialFulfillmentSchema],
  qrCode: { type: String, default: '' },           // QR shown to student for payment
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WishlistItem', WishlistItemSchema);
