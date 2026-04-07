const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'carehome', 'admin'], required: true },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  studentProfile: {
    university: { type: String, default: '' },
    studentId: { type: String, default: '' },
    studentIdCardPhoto: { type: String, default: '' },
    course: { type: String, default: '' },
    year: { type: Number, default: 1 },
    totalDonated: { type: Number, default: 0 },
    donationCount: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    bio: { type: String, default: '' },
  },

  carehomeProfile: {
    facilityName: { type: String, default: '' },
    carehomeType: {
      type: String,
      enum: ['elderly_care', 'child_care', 'physically_challenged', 'mentally_challenged', 'other'],
      default: 'elderly_care'
    },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    postcode: { type: String, default: '' },
    phone: { type: String, default: '' },
    registrationNumber: { type: String, default: '' },
    description: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    ngoCertificate: { type: String, default: '' },
    qrCode: { type: String, default: '' },
    upiId: { type: String, default: '' },
    residentCount: { type: Number, default: 0 },
    totalReceived: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
