import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Card, CardContent, TextField, Button, Typography, Alert,
  Avatar, Grid, Stepper, Step, StepLabel, MenuItem, LinearProgress, Chip
} from '@mui/material';
import { HomeRounded, CloudUploadRounded } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, fileToBase64, CAREHOME_TYPES } from '../../utils/helpers';

const steps = ['Account Details', 'Facility Info', 'Documents & Payment'];

export default function CareHomeRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState({ profilePhoto: '', ngoCertificate: '', qrCode: '' });
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    facilityName: '', carehomeType: 'elderly_care', address: '', city: '', postcode: '', phone: '',
    registrationNumber: '', description: '', residentCount: '',
    profilePhoto: '', ngoCertificate: '', qrCode: '', upiId: ''
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleFileUpload = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return setError('File must be under 3MB');
    const b64 = await fileToBase64(file);
    setPreviews(p => ({ ...p, [field]: b64 }));
    setForm(f => ({ ...f, [field]: b64 }));
  };

  const handleNext = () => {
    setError('');
    if (activeStep === 0) {
      if (!form.name || !form.email || !form.password) return setError('Please fill all required fields');
      if (!validateEmail(form.email)) return setError('Please enter a valid email address');
      if (form.password.length < 6) return setError('Password must be at least 6 characters');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    }
    if (activeStep === 1) {
      if (!form.address || !form.city) return setError('Address and city are required');
    }
    setActiveStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        ...form,
        role: 'carehome',
        residentCount: parseInt(form.residentCount) || 0,
      });
      navigate('/carehome/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const UploadBox = ({ field, label, accept, preview }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>{label}</Typography>
      <Box
        component="label"
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          border: '2px dashed #E8404A', borderRadius: '15px', p: 2.5, cursor: 'pointer',
          bgcolor: preview ? 'transparent' : '#E8404A08',
          '&:hover': { bgcolor: '#E8404A12' }, transition: 'all 0.2s', minHeight: 90,
        }}
      >
        {preview ? (
          <img src={preview} alt={label} style={{ maxHeight: 130, borderRadius: 10, objectFit: 'contain' }} />
        ) : (
          <>
            <CloudUploadRounded sx={{ fontSize: 32, color: '#E8404A', mb: 0.5 }} />
            <Typography variant="body2" color="#E8404A" fontWeight={600}>Upload {label}</Typography>
            <Typography variant="caption" color="text.secondary">Max 3MB</Typography>
          </>
        )}
        <input type="file" accept={accept} hidden onChange={e => handleFileUpload(field, e)} />
      </Box>
      {preview && <Button size="small" onClick={() => { setPreviews(p => ({ ...p, [field]: '' })); setForm(f => ({ ...f, [field]: '' })); }} sx={{ mt: 0.5, color: 'error.main', fontSize: 11 }}>Remove</Button>}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF0F0 0%, #FFF5F0 100%)', display: 'flex', alignItems: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Button onClick={() => navigate('/')} sx={{ mb: 2, color: '#E8404A', fontWeight: 600 }}>← Back to Home</Button>
        <Card sx={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(232,64,74,0.15)' }}>
          <Box sx={{ background: 'linear-gradient(160deg, #E8404A, #FF7B54)', p: 4, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto', mb: 2, width: 72, height: 72 }}>
              <HomeRounded sx={{ fontSize: 40, color: 'white' }} />
            </Avatar>
            <Typography variant="h5" color="white" fontWeight={800}>Register Care Home</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5 }}>Connect with students who care</Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }} alternativeLabel>
              {steps.map(label => <Step key={label}><StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: 12 } }}>{label}</StepLabel></Step>)}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '15px' }}>{error}</Alert>}

            {activeStep === 0 && (
              <Box>
                <TextField fullWidth label="Contact Person Name *" value={form.name} onChange={set('name')} sx={{ mb: 2 }} />
                <TextField fullWidth label="Email Address *" type="email" value={form.email} onChange={set('email')}
                  error={form.email.length > 0 && !validateEmail(form.email)}
                  helperText={form.email.length > 0 && !validateEmail(form.email) ? 'Invalid email address' : ''} sx={{ mb: 2 }} />
                <TextField fullWidth label="Password *" type="password" value={form.password} onChange={set('password')} sx={{ mb: 2 }} helperText="Min 6 characters" />
                <TextField fullWidth label="Confirm Password *" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} sx={{ mb: 3 }} />
                <Button fullWidth variant="contained" size="large" onClick={handleNext}
                  sx={{ py: 1.5, borderRadius: '15px', background: 'linear-gradient(135deg, #E8404A, #FF7B54)', fontWeight: 700 }}>
                  Continue →
                </Button>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <TextField fullWidth label="Care Home Name *" value={form.facilityName} onChange={set('facilityName')} sx={{ mb: 2 }} />
                <TextField fullWidth label="Type of Care Home *" select value={form.carehomeType} onChange={set('carehomeType')} sx={{ mb: 2 }}>
                  {Object.entries(CAREHOME_TYPES).map(([val, info]) => (
                    <MenuItem key={val} value={val}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{info.emoji}</span> {info.label}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                <TextField fullWidth label="Registration / NGO Number" value={form.registrationNumber} onChange={set('registrationNumber')} sx={{ mb: 2 }} placeholder="CQC / NGO registration number" />
                <TextField fullWidth label="Full Address *" value={form.address} onChange={set('address')} sx={{ mb: 2 }} />
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={7}><TextField fullWidth label="City *" value={form.city} onChange={set('city')} /></Grid>
                  <Grid item xs={5}><TextField fullWidth label="Postcode" value={form.postcode} onChange={set('postcode')} /></Grid>
                </Grid>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={7}><TextField fullWidth label="Phone Number" value={form.phone} onChange={set('phone')} /></Grid>
                  <Grid item xs={5}><TextField fullWidth label="No. of Residents" type="number" value={form.residentCount} onChange={set('residentCount')} /></Grid>
                </Grid>
                <TextField fullWidth label="About Your Care Home" multiline rows={3} value={form.description} onChange={set('description')} sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}><Button fullWidth variant="outlined" onClick={() => setActiveStep(0)} sx={{ borderRadius: '15px', borderColor: '#E8404A', color: '#E8404A' }}>← Back</Button></Grid>
                  <Grid item xs={6}><Button fullWidth variant="contained" onClick={handleNext} sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #E8404A, #FF7B54)', fontWeight: 700 }}>Continue →</Button></Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 2 && (
              <Box component="form" onSubmit={handleSubmit}>
                <UploadBox field="profilePhoto" label="📸 Care Home Profile Photo" accept="image/*" preview={previews.profilePhoto} />
                <UploadBox field="ngoCertificate" label="📜 NGO Certificate / Registration Proof" accept="image/*,.pdf" preview={previews.ngoCertificate} />
                <UploadBox field="qrCode" label="📱 UPI Payment QR Code" accept="image/*" preview={previews.qrCode} />
                <TextField fullWidth label="UPI ID (optional)" value={form.upiId} onChange={set('upiId')} sx={{ mb: 2 }} placeholder="yourname@upi" />
                <Alert severity="info" sx={{ mb: 3, borderRadius: '15px', fontSize: 12 }}>
                  📋 Your account will be reviewed before being visible to students. Upload NGO certificate to speed up approval.
                </Alert>
                {loading && <LinearProgress sx={{ mb: 2, borderRadius: '15px' }} />}
                <Grid container spacing={2}>
                  <Grid item xs={6}><Button fullWidth variant="outlined" onClick={() => setActiveStep(1)} sx={{ borderRadius: '15px', borderColor: '#E8404A', color: '#E8404A' }}>← Back</Button></Grid>
                  <Grid item xs={6}><Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #E8404A, #FF7B54)', fontWeight: 700 }}>{loading ? 'Submitting...' : 'Register 🏠'}</Button></Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already registered?{' '}
                <Link to="/carehome/login" style={{ color: '#E8404A', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
