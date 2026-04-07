const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: String,
  studentEmail: String,
  studentUniversity: String,
  studentIdCardPhoto: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
  message: String,
});

const CampaignSchema = new mongoose.Schema({
  carehome: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['equipment', 'activities', 'comfort', 'nutrition', 'entertainment', 'medical', 'other'],
    default: 'other'
  },
  goalAmount: { type: Number, required: true, min: 1 },
  raisedAmount: { type: Number, default: 0 },
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isUrgent: { type: Boolean, default: false },
  deadline: { type: Date },
  donorCount: { type: Number, default: 0 },
  tags: [{ type: String }],

  // Volunteering fields
  needsVolunteers: { type: Boolean, default: false },
  volunteerDate: { type: Date },
  volunteerTime: { type: String, default: '' },
  volunteerWorkType: { type: String, default: '' },
  volunteerSlots: { type: Number, default: 5 },
  volunteerDetails: { type: String, default: '' },
  volunteers: [VolunteerSchema],

  updates: [{
    message: String,
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

CampaignSchema.virtual('progressPercent').get(function() {
  return Math.min(Math.round((this.raisedAmount / this.goalAmount) * 100), 100);
});

CampaignSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Campaign', CampaignSchema);
