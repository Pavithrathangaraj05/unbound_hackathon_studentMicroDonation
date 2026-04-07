import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, Chip, Divider, CircularProgress,
  List, ListItem, ListItemAvatar, ListItemText, Grid
} from '@mui/material';
import {
  DashboardRounded, HomeRounded, FavoriteRounded, HistoryRounded,
  EmojiEventsRounded, CardGiftcardRounded, PersonRounded
} from '@mui/icons-material';
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

export default function StudentHistory() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/donations/my').then(r => setDonations(r.data)).finally(() => setLoading(false));
  }, []);

  const total = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <DashboardLayout menuItems={menuItems} role="student">
      <Typography variant="h5" fontWeight={700} gutterBottom>Donation History</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4}>
          <Card><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={800} color="primary">₹{total.toFixed(2)}</Typography>
            <Typography variant="caption" color="text.secondary">Total Donated</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Card><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={800} color="secondary">{donations.length}</Typography>
            <Typography variant="caption" color="text.secondary">Total Donations</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#4CAF50' }}>
              {new Set(donations.map(d => d.carehome?._id)).size}
            </Typography>
            <Typography variant="caption" color="text.secondary">Care Homes Supported</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          {loading ? <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
            : donations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <FavoriteRounded sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography color="text.secondary">No donations yet. Start giving today!</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {donations.map((d, i) => (
                  <React.Fragment key={d._id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#6C63FF22', color: '#6C63FF' }}>
                          {d.carehome?.name?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={600} variant="body2">
                            {d.carehome?.carehomeProfile?.facilityName || d.carehome?.name}
                          </Typography>
                          {d.isAnonymous && <Chip label="Anonymous" size="small" sx={{ height: 16, fontSize: 10 }} />}
                        </Box>}
                        secondary={<>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </Typography>
                          {d.campaign && <Typography variant="caption" sx={{ display: 'block', color: '#6C63FF' }}>📌 {d.campaign.title}</Typography>}
                          {d.message && <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic', color: 'text.secondary' }}>"{d.message}"</Typography>}
                        </>}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography fontWeight={800} color="primary" variant="h6">₹{d.amount.toFixed(2)}</Typography>
                        <Chip label={`+${d.pointsEarned} pts`} size="small" sx={{ bgcolor: '#6C63FF22', color: '#6C63FF', fontSize: 10 }} />
                      </Box>
                    </ListItem>
                    {i < donations.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
