import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Chip, Stack
} from '@mui/material';
import {
  FavoriteRounded, SchoolRounded, HomeRounded, VolunteerActivismRounded,
  EmojiEventsRounded, TrendingUpRounded, SecurityRounded, GroupsRounded
} from '@mui/icons-material';
import { Navbar, Nav, Container as BsContainer } from 'react-bootstrap';

const stats = [
  { label: 'Students Giving', value: '2,400+', icon: <SchoolRounded />, color: '#6C63FF' },
  { label: 'Care Homes Helped', value: '180+', icon: <HomeRounded />, color: '#FF6584' },
  { label: 'Total Donated', value: '₹48,00,000+', icon: <FavoriteRounded />, color: '#4CAF50' },
  { label: 'Donations Made', value: '12,000+', icon: <VolunteerActivismRounded />, color: '#FF9800' },
];

const features = [
  { icon: <VolunteerActivismRounded fontSize="large" />, title: 'Micro Donations', desc: 'Donate as little as ₹5 to care homes near you. Every penny counts toward improving lives.' },
  { icon: <EmojiEventsRounded fontSize="large" />, title: 'Earn Rewards', desc: 'Collect points and badges as you give. Climb the leaderboard and showcase your impact.' },
  { icon: <SecurityRounded fontSize="large" />, title: 'Safe & Secure', desc: 'Stripe-powered payments. All care homes verified. Your money goes exactly where you choose.' },
  { icon: <GroupsRounded fontSize="large" />, title: 'Wishlist Giving', desc: 'Browse specific items care homes need — from books to board games — and fulfill their wishes.' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navbar */}
      <Navbar bg="white" expand="lg" sticky="top" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <BsContainer>
          <Navbar.Brand style={{ fontWeight: 800, fontSize: 22, color: '#6C63FF', cursor: 'pointer' }} onClick={() => navigate('/')}>
            💜 MicroGive
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="ms-auto align-items-center gap-2">
              <Button variant="outlined" color="primary" onClick={() => navigate('/student/login')} sx={{ mr: 1 }}>
                Student Login
              </Button>
              <Button variant="contained" color="secondary" onClick={() => navigate('/carehome/login')}>
                Care Home Login
              </Button>
            </Nav>
          </Navbar.Collapse>
        </BsContainer>
      </Navbar>

      {/* Hero Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
        color: 'white', py: { xs: 8, md: 12 }, textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Chip label="🌟 Making a difference, one micro-gift at a time" sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
          <Typography variant="h2" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2rem', md: '3.5rem' } }}>
            Students Giving Back to<br />Care Home Residents
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 5, fontWeight: 400 }}>
            MicroGive connects university students with local care homes. Small donations, big smiles.
            Start giving today — even ₹10 brings joy.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/student/register')}
              sx={{ bgcolor: 'white', color: '#6C63FF', fontWeight: 700, px: 4, py: 1.5, fontSize: 16, '&:hover': { bgcolor: '#f0f0ff' } }}
            >
              🎓 I'm a Student
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/carehome/register')}
              sx={{ borderColor: 'white', color: 'white', fontWeight: 700, px: 4, py: 1.5, fontSize: 16, '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: 'white' } }}
            >
              🏠 Register Care Home
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Stats */}
      <Container maxWidth="lg" sx={{ mt: -4, mb: 6, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3}>
          {stats.map((stat, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Card sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: stat.color + '22', color: stat.color, mx: 'auto', mb: 1.5, width: 56, height: 56 }}>
                  {stat.icon}
                </Avatar>
                <Typography variant="h4" fontWeight={800} color="text.primary">{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" fontWeight={800} gutterBottom>How MicroGive Works</Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" mb={6}>
            Three simple steps to make a difference
          </Typography>
          <Grid container spacing={4} alignItems="center">
            {[
              { step: '01', title: 'Students Sign Up', desc: 'Create your free student account using your university email. Browse verified care homes near your campus.', color: '#6C63FF' },
              { step: '02', title: 'Choose & Give', desc: 'Pick a care home or specific campaign. Donate from as little as ₹5 or fulfill a wishlist item.', color: '#FF6584' },
              { step: '03', title: 'Track Your Impact', desc: 'Earn points and badges for every donation. See the real difference you\'re making in residents\' lives.', color: '#4CAF50' },
            ].map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h1" sx={{ fontSize: 80, fontWeight: 900, color: item.color + '22', lineHeight: 1, mb: -2 }}>
                    {item.step}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} gutterBottom>{item.title}</Typography>
                  <Typography color="text.secondary">{item.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight={800} gutterBottom>Why Students Love MicroGive</Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ p: 3, height: '100%', '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s' } }}>
                <Avatar sx={{ bgcolor: '#6C63FF22', color: '#6C63FF', mb: 2, width: 56, height: 56 }}>{f.icon}</Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)', py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" color="white" fontWeight={800} gutterBottom>
            Ready to Make a Difference?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4 }}>
            Join thousands of students already bringing joy to care home residents.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/student/register')}
              sx={{ bgcolor: 'white', color: '#6C63FF', fontWeight: 700, px: 4 }}
            >
              Get Started as Student
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/carehome/register')}
              sx={{ borderColor: 'white', color: 'white', fontWeight: 700, px: 4 }}
            >
              Register Your Care Home
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      {/* <Box sx={{ bgcolor: '#1a1a2e', color: 'rgba(255,255,255,0.7)', py: 4, textAlign: 'center' }}>
        <Typography variant="body2">
          © 2024 MicroGive. Made with 💜 to brighten care home residents' days.
        </Typography>
      </Box> */}
    </Box>
  );
}
