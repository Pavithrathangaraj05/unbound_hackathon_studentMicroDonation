import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Card, CardContent, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, Divider, Avatar
} from '@mui/material';
import { EmailRounded, LockRounded, Visibility, VisibilityOff, HomeRounded } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/helpers';

export default function CareHomeLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(form.email)) return setError('Please enter a valid email address');
    setLoading(true);
    try {
      await login(form.email, form.password, 'carehome');
      navigate('/carehome/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF0F0 0%, #FFF5F0 100%)', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Button onClick={() => navigate('/')} sx={{ mb: 2, color: '#E8404A', fontWeight: 600 }}>← Back to Home</Button>
        <Card sx={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(232,64,74,0.15)' }}>
          <Box sx={{ background: 'linear-gradient(160deg, #E8404A, #FF7B54)', p: 4, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto', mb: 2, width: 72, height: 72 }}>
              <HomeRounded sx={{ fontSize: 40, color: 'white' }} />
            </Avatar>
            <Typography variant="h5" color="white" fontWeight={800}>Care Home Login</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5 }}>Manage campaigns and receive donations</Typography>
          </Box>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '15px' }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth label="Care Home Email" type="email" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                error={form.email.length > 0 && !validateEmail(form.email)}
                helperText={form.email.length > 0 && !validateEmail(form.email) ? 'Invalid email address' : ''}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailRounded sx={{ color: '#E8404A' }} /></InputAdornment> }}
                sx={{ mb: 2.5 }}
              />
              <TextField
                fullWidth label="Password" required type={showPass ? 'text' : 'password'}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockRounded sx={{ color: '#E8404A' }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPass(!showPass)}>{showPass ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                }}
                sx={{ mb: 3 }}
              />
              <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
                sx={{ py: 1.5, fontSize: 16, borderRadius: '15px', background: 'linear-gradient(135deg, #E8404A, #FF7B54)', fontWeight: 700, mb: 2 }}>
                {loading ? 'Signing in...' : '🏠 Sign In as Care Home'}
              </Button>
            </Box>
            <Divider sx={{ my: 2 }}><Typography variant="body2" color="text.secondary">New care home?</Typography></Divider>
            <Button fullWidth variant="outlined" onClick={() => navigate('/carehome/register')} sx={{ py: 1.2, borderRadius: '15px', borderColor: '#E8404A', color: '#E8404A', fontWeight: 600 }}>
              Register Your Care Home
            </Button>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Are you a student?{' '}
                <Link to="/student/login" style={{ color: '#6C63FF', fontWeight: 700, textDecoration: 'none' }}>Student Login →</Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
