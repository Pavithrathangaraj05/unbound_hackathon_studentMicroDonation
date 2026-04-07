const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'microgive_secret', { expiresIn: '30d' });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, ...profileData } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const userData = { name, email, password, role };

    if (role === 'student') {
      userData.studentProfile = {
        university: profileData.university || '',
        studentId: profileData.studentId || '',
        course: profileData.course || '',
        year: profileData.year || 1,
        bio: profileData.bio || '',
      };
    } else if (role === 'carehome') {
      userData.carehomeProfile = {
        facilityName: profileData.facilityName || name,
        address: profileData.address || '',
        city: profileData.city || '',
        postcode: profileData.postcode || '',
        phone: profileData.phone || '',
        registrationNumber: profileData.registrationNumber || '',
        description: profileData.description || '',
        residentCount: profileData.residentCount || 0,
      };
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        studentProfile: user.studentProfile,
        carehomeProfile: user.carehomeProfile,
        isVerified: user.isVerified,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (role && user.role !== role) {
      return res.status(401).json({ message: `No ${role} account found with this email` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ message: 'Account suspended. Contact support.' });

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        studentProfile: user.studentProfile,
        carehomeProfile: user.carehomeProfile,
        isVerified: user.isVerified,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, avatar, studentProfile, carehomeProfile } = req.body;
    const update = { name, avatar, updatedAt: Date.now() };
    if (studentProfile) update.studentProfile = studentProfile;
    if (carehomeProfile) update.carehomeProfile = carehomeProfile;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
