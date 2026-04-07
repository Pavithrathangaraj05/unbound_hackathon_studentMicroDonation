import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Card, CardContent, TextField, Button, Typography, Alert,
  Avatar, Grid, MenuItem, Stepper, Step, StepLabel, LinearProgress
} from '@mui/material';
import { SchoolRounded, CloudUploadRounded } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, fileToBase64 } from '../../utils/helpers';

const steps = ['Account Details', 'Student Info & ID'];

export default function StudentRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [idPreview, setIdPreview] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    university: '', studentId: '', course: '', year: 1, bio: '',
    studentIdCardPhoto: ''
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleIdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setError('ID card image must be under 2MB');
    const b64 = await fileToBase64(file);
    setIdPreview(b64);
    setForm({ ...form, studentIdCardPhoto: b64 });
  };

  const handleNext = () => {
    setError('');
    if (!form.name) return setError('Full name is required');
    if (!form.email) return setError('Email is required');
    if (!validateEmail(form.email)) return setError('Please enter a valid email address');
    if (!form.password) return setError('Password is required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setActiveStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.university) return setError('University is required');
    setLoading(true);
    try {
      await register({ ...form, role: 'student' });
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EEF0FF 0%, #F9F0FF 100%)', display: 'flex', alignItems: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Button onClick={() => navigate('/')} sx={{ mb: 2, color: '#6C63FF', fontWeight: 600 }}>← Back to Home</Button>
        <Card sx={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(108,99,255,0.15)' }}>
          <Box sx={{ background: 'linear-gradient(160deg, #5A52E0, #8B85FF)', p: 4, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto', mb: 2, width: 72, height: 72 }}>
              <SchoolRounded sx={{ fontSize: 40, color: 'white' }} />
            </Avatar>
            <Typography variant="h5" color="white" fontWeight={800}>Join as Student</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5 }}>Start giving back to your community</Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '15px' }}>{error}</Alert>}

            {activeStep === 0 ? (
              <Box>
                <TextField fullWidth label="Full Name *" value={form.name} onChange={set('name')} sx={{ mb: 2 }} />
                <TextField
                  fullWidth label="Email Address *" type="email" value={form.email}
                  onChange={set('email')}
                  error={form.email.length > 0 && !validateEmail(form.email)}
                  helperText={form.email.length > 0 && !validateEmail(form.email) ? 'Invalid email address' : ''}
                  sx={{ mb: 2 }}
                />
                <TextField fullWidth label="Password *" type="password" value={form.password} onChange={set('password')} sx={{ mb: 2 }} helperText="Minimum 6 characters" />
                <TextField fullWidth label="Confirm Password *" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} sx={{ mb: 3 }} />
                <Button fullWidth variant="contained" size="large" onClick={handleNext}
                  sx={{ py: 1.5, borderRadius: '15px', background: 'linear-gradient(135deg, #5A52E0, #8B85FF)', fontWeight: 700 }}>
                  Continue →
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                <TextField fullWidth label="University / College *" value={form.university} onChange={set('university')} sx={{ mb: 2 }} />
                <TextField fullWidth label="Student ID *" value={form.studentId} onChange={set('studentId')} sx={{ mb: 2 }} />
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={8}><TextField fullWidth label="Course / Subject" value={form.course} onChange={set('course')} /></Grid>
                  <Grid item xs={4}>
                    <TextField fullWidth label="Year" select value={form.year} onChange={set('year')}>
                      {[1,2,3,4,5].map(y => <MenuItem key={y} value={y}>Year {y}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>
                <TextField fullWidth label="Bio (optional)" multiline rows={2} value={form.bio} onChange={set('bio')} sx={{ mb: 2 }} />

                {/* Student ID Card Upload */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>🪪 Student ID Card Photo *</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Upload a photo of your student ID card for verification
                  </Typography>
                  <Box
                    component="label"
                    sx={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      border: '2px dashed #6C63FF', borderRadius: '15px', p: 3, cursor: 'pointer',
                      bgcolor: idPreview ? 'transparent' : '#6C63FF08',
                      '&:hover': { bgcolor: '#6C63FF12' }, transition: 'all 0.2s',
                      minHeight: idPreview ? 'auto' : 100,
                    }}
                  >
                    {idPreview ? (
                      <img src={idPreview} alt="ID card" style={{ maxHeight: 160, borderRadius: 10, objectFit: 'contain' }} />
                    ) : (
                      <>
                        <CloudUploadRounded sx={{ fontSize: 40, color: '#6C63FF', mb: 1 }} />
                        <Typography variant="body2" color="#6C63FF" fontWeight={600}>Click to upload ID Card</Typography>
                        <Typography variant="caption" color="text.secondary">JPG, PNG up to 2MB</Typography>
                      </>
                    )}
                    <input type="file" accept="image/*" hidden onChange={handleIdUpload} />
                  </Box>
                  {idPreview && (
                    <Button size="small" onClick={() => { setIdPreview(''); setForm({ ...form, studentIdCardPhoto: '' }); }} sx={{ mt: 1, color: 'error.main' }}>
                      Remove
                    </Button>
                  )}
                </Box>

                {loading && <LinearProgress sx={{ mb: 2, borderRadius: '15px' }} />}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button fullWidth variant="outlined" onClick={() => setActiveStep(0)} sx={{ borderRadius: '15px' }}>← Back</Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button fullWidth variant="contained" type="submit" disabled={loading}
                      sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #5A52E0, #8B85FF)', fontWeight: 700 }}>
                      {loading ? 'Creating...' : 'Create Account 🎉'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to="/student/login" style={{ color: '#6C63FF', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
