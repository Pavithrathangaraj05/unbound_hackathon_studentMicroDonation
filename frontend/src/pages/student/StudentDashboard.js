import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Avatar, Chip, LinearProgress,
  List, ListItem, ListItemAvatar, ListItemText, Divider, CircularProgress
} from '@mui/material';
import {
  DashboardRounded, HomeRounded, FavoriteRounded, HistoryRounded,
  EmojiEventsRounded, CardGiftcardRounded, PersonRounded, TrendingUpRounded,
  VolunteerActivismRounded
} from '@mui/icons-material';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../context/AuthContext';

const menuItems = [
  { path: '/student/dashboard', label: 'Dashboard', icon: <DashboardRounded /> },
  { path: '/student/carehomes', label: 'Browse Care Homes', icon: <HomeRounded /> },
  { path: '/student/wishlist', label: 'Wishlist Items', icon: <CardGiftcardRounded /> },
  { path: '/student/history', label: 'Donation History', icon: <HistoryRounded /> },
  { path: '/student/leaderboard', label: 'Leaderboard', icon: <EmojiEventsRounded /> },
  { path: '/student/profile', label: 'My Profile', icon: <PersonRounded /> },
];

const BADGE_CONFIG = {
  first_giver: { label: 'First Gift', emoji: '🌟', color: '#FFD700' },
  regular_giver: { label: 'Regular Giver', emoji: '💚', color: '#4CAF50' },
  super_giver: { label: 'Super Giver', emoji: '🦸', color: '#6C63FF' },
  bronze_donor: { label: 'Bronze Donor', emoji: '🥉', color: '#CD7F32' },
  silver_donor: { label: 'Silver Donor', emoji: '🥈', color: '#C0C0C0' },
  gold_donor: { label: 'Gold Donor', emoji: '🥇', color: '#FFD700' },
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [carehomes, setCareHomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/donations/my'),
      API.get('/donations/stats'),
      API.get('/carehomes'),
    ]).then(([d, s, c]) => {
      setDonations(d.data.slice(0, 5));
      setStats(s.data);
      setCareHomes(c.data.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  const profile = user?.studentProfile || {};
  const badges = profile.badges || [];
  const nextLevelPoints = Math.ceil((profile.points || 0) / 100) * 100 + 100;

  return (
    <DashboardLayout menuItems={menuItems} role="student">
      {/* Welcome */}
      <Box sx={{ background: 'linear-gradient(135deg, #6C63FF, #8B85FF)', borderRadius: 4, p: 3, mb: 3, color: 'white' }}>
        <Typography variant="h5" fontWeight={700}>Welcome back, {user?.name?.split(' ')[0]}! 👋</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          You've donated ₹{(profile.totalDonated || 0).toFixed(2)} and earned {profile.points || 0} points. Keep it up!
        </Typography>
        <Button
          variant="contained" sx={{ mt: 2, bgcolor: 'white', color: '#6C63FF', fontWeight: 700, '&:hover': { bgcolor: '#f0f0ff' } }}
          onClick={() => navigate('/student/carehomes')}
          startIcon={<FavoriteRounded />}
        >
          Donate Now
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Donated', value: `₹${(profile.totalDonated || 0).toFixed(2)}`, icon: <FavoriteRounded />, color: '#6C63FF' },
          { label: 'Donations Made', value: profile.donationCount || 0, icon: <VolunteerActivismRounded />, color: '#FF6584' },
          { label: 'Points Earned', value: profile.points || 0, icon: <TrendingUpRounded />, color: '#4CAF50' },
          { label: 'Badges', value: badges.length, icon: <EmojiEventsRounded />, color: '#FF9800' },
        ].map((s, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: s.color + '22', color: s.color, mx: 'auto', mb: 1, width: 44, height: 44 }}>{s.icon}</Avatar>
                <Typography variant="h5" fontWeight={800}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Points Progress */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>🎯 Points Progress</Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{profile.points || 0} points</Typography>
                  <Typography variant="body2" color="text.secondary">{nextLevelPoints} for next level</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((profile.points || 0) % 100), 100)}
                  sx={{ height: 10, borderRadius: 5, '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #6C63FF, #8B85FF)' } }}
                />
              </Box>

              <Typography variant="subtitle2" fontWeight={600} gutterBottom>🏆 Your Badges</Typography>
              {badges.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Make your first donation to earn a badge!</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {badges.map(b => (
                    <Chip
                      key={b} size="small"
                      label={`${BADGE_CONFIG[b]?.emoji} ${BADGE_CONFIG[b]?.label || b}`}
                      sx={{ bgcolor: (BADGE_CONFIG[b]?.color || '#6C63FF') + '22', color: BADGE_CONFIG[b]?.color || '#6C63FF', fontWeight: 600 }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Donations */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Recent Donations</Typography>
                <Button size="small" onClick={() => navigate('/student/history')}>View all</Button>
              </Box>
              {loading ? <CircularProgress size={24} /> : donations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">No donations yet. Be the first to give!</Typography>
                  <Button variant="contained" size="small" sx={{ mt: 2 }} onClick={() => navigate('/student/carehomes')}>
                    Browse Care Homes
                  </Button>
                </Box>
              ) : (
                <List dense disablePadding>
                  {donations.map((d, i) => (
                    <React.Fragment key={d._id}>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#6C63FF22', color: '#6C63FF', width: 36, height: 36, fontSize: 14 }}>
                            {d.carehome?.name?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={d.carehome?.carehomeProfile?.facilityName || d.carehome?.name}
                          secondary={new Date(d.createdAt).toLocaleDateString()}
                          primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                          secondaryTypographyProps={{ fontSize: 12 }}
                        />
                        <Chip label={`₹${d.amount}`} size="small" sx={{ bgcolor: '#4CAF5022', color: '#4CAF50', fontWeight: 700 }} />
                      </ListItem>
                      {i < donations.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Featured Care Homes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>🏠 Featured Care Homes</Typography>
                <Button size="small" onClick={() => navigate('/student/carehomes')}>View all</Button>
              </Box>
              <Grid container spacing={2}>
                {carehomes.map(c => (
                  <Grid item xs={12} sm={4} key={c._id}>
                    <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { borderColor: '#6C63FF', transform: 'translateY(-2px)', transition: 'all 0.2s' } }}
                      onClick={() => navigate(`/student/carehomes/${c._id}`)}>
                      <CardContent>
                        <Avatar sx={{ bgcolor: '#FF658422', color: '#FF6584', mb: 1 }}>{c.carehomeProfile?.facilityName?.charAt(0) || c.name?.charAt(0)}</Avatar>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>{c.carehomeProfile?.facilityName || c.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.carehomeProfile?.city}</Typography>
                        <Box sx={{ mt: 1 }}>
                          <Button size="small" variant="contained" fullWidth onClick={e => { e.stopPropagation(); navigate(`/student/donate/${c._id}`); }}
                            sx={{ background: 'linear-gradient(135deg, #6C63FF, #8B85FF)', fontSize: 12 }}>
                            Donate
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
