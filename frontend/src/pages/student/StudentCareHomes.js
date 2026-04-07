import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField, Avatar,
  Chip, InputAdornment, CircularProgress, CardActions
} from '@mui/material';
import { SearchRounded, LocationOnRounded, HomeRounded, DashboardRounded,
  FavoriteRounded, HistoryRounded, EmojiEventsRounded, CardGiftcardRounded, PersonRounded } from '@mui/icons-material';
import DashboardLayout from '../../components/common/DashboardLayout';
import { API } from '../../context/AuthContext';

const menuItems = [
  { path: '/student/dashboard', label: 'Dashboard', icon: <DashboardRounded /> },
  { path: '/student/carehomes', label: 'Browse Care Homes', icon: <HomeRounded /> },
  { path: '/student/wishlist', label: 'Wishlist Items', icon: <CardGiftcardRounded /> },
  { path: '/student/history', label: 'Donation History', icon: <HistoryRounded /> },
  { path: '/student/leaderboard', label: 'Leaderboard', icon: <EmojiEventsRounded /> },
  { path: '/student/profile', label: 'My Profile', icon: <PersonRounded /> },
];

export default function StudentCareHomes() {
  const navigate = useNavigate();
  const [carehomes, setCareHomes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/carehomes').then(r => { setCareHomes(r.data); setFiltered(r.data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) return setFiltered(carehomes);
    const q = search.toLowerCase();
    setFiltered(carehomes.filter(c =>
      c.carehomeProfile?.facilityName?.toLowerCase().includes(q) ||
      c.carehomeProfile?.city?.toLowerCase().includes(q) ||
      c.name?.toLowerCase().includes(q)
    ));
  }, [search, carehomes]);

  return (
    <DashboardLayout menuItems={menuItems} role="student">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Browse Care Homes</Typography>
        <Typography color="text.secondary">Find and support care homes near you</Typography>
      </Box>

      <TextField
        fullWidth placeholder="Search by name or city..."
        value={search} onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> }}
        sx={{ mb: 3 }}
      />

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <HomeRounded sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography color="text.secondary">No care homes found</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map(c => {
            const profile = c.carehomeProfile || {};
            return (
              <Grid item xs={12} sm={6} md={4} key={c._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transition: 'all 0.3s' } }}
                  onClick={() => navigate(`/student/carehomes/${c._id}`)}>
                  <Box sx={{ background: 'linear-gradient(135deg, #FF6584, #FF8FA3)', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white', width: 60, height: 60, fontSize: 28, fontWeight: 700 }}>
                      {(profile.facilityName || c.name)?.charAt(0)}
                    </Avatar>
                  </Box>
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
                      {profile.facilityName || c.name}
                    </Typography>
                    {profile.city && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <LocationOnRounded sx={{ fontSize: 14, color: '#FF6584' }} />
                        <Typography variant="body2" color="text.secondary">{profile.city} {profile.postcode}</Typography>
                      </Box>
                    )}
                    {profile.residentCount > 0 && (
                      <Chip label={`👥 ${profile.residentCount} residents`} size="small" sx={{ mb: 1, bgcolor: '#6C63FF22', color: '#6C63FF', fontSize: 11 }} />
                    )}
                    {profile.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {profile.description}
                      </Typography>
                    )}
                    {profile.totalReceived > 0 && (
                      <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600, mt: 1, display: 'block' }}>
                        💚 ₹{profile.totalReceived.toFixed(2)} received from students
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                    <Button
                      variant="contained" fullWidth size="small"
                      sx={{ background: 'linear-gradient(135deg, #6C63FF, #8B85FF)' }}
                      onClick={e => { e.stopPropagation(); navigate(`/student/donate/${c._id}`); }}
                      startIcon={<FavoriteRounded />}
                    >
                      Donate
                    </Button>
                    <Button variant="outlined" size="small" fullWidth onClick={e => { e.stopPropagation(); navigate(`/student/carehomes/${c._id}`); }}>
                      View
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </DashboardLayout>
  );
}
