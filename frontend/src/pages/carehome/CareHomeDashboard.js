import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Avatar, Chip, Alert,
  List, ListItem, ListItemAvatar, ListItemText, Divider, CircularProgress
} from '@mui/material';
import {
  DashboardRounded, CampaignRounded, CardGiftcardRounded, ReceiptRounded,
  PersonRounded, TrendingUpRounded, FavoriteRounded, PeopleRounded, MonetizationOnRounded
} from '@mui/icons-material';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../context/AuthContext';

const menuItems = [
  { path: '/carehome/dashboard', label: 'Dashboard', icon: <DashboardRounded /> },
  { path: '/carehome/campaigns', label: 'My Campaigns', icon: <CampaignRounded /> },
  { path: '/carehome/wishlist', label: 'Wishlist', icon: <CardGiftcardRounded /> },
  { path: '/carehome/donations', label: 'Donations Received', icon: <ReceiptRounded /> },
  { path: '/carehome/profile', label: 'Profile', icon: <PersonRounded /> },
];

export default function CareHomeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/donations/received'),
      API.get(`/campaigns?carehome=${user?._id}`)
    ]).then(([d, c]) => {
      setDonations(d.data.slice(0, 5));
      setCampaigns(c.data);
    }).finally(() => setLoading(false));
  }, [user]);

  const profile = user?.carehomeProfile || {};
  const isApproved = profile.isApproved;

  return (
    <DashboardLayout menuItems={menuItems} role="carehome">
      {/* Approval notice */}
      {!isApproved && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          ⏳ Your care home profile is pending approval. You can set up your profile and campaigns, but students won't see you until approved.
        </Alert>
      )}

      {/* Welcome */}
      <Box sx={{ background: 'linear-gradient(135deg, #FF6584, #FF8FA3)', borderRadius: 4, p: 3, mb: 3, color: 'white' }}>
        <Typography variant="h5" fontWeight={700}>Welcome, {profile.facilityName || user?.name}! 🏠</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          You've received ₹{(profile.totalReceived || 0).toFixed(2)} from students. Create campaigns to inspire more giving!
        </Typography>
        <Button
          variant="contained" sx={{ mt: 2, bgcolor: 'white', color: '#FF6584', fontWeight: 700, '&:hover': { bgcolor: '#fff5f7' } }}
          onClick={() => navigate('/carehome/campaigns')}
        >
          Create Campaign
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Received', value: `₹${(profile.totalReceived || 0).toFixed(2)}`, icon: <MonetizationOnRounded />, color: '#4CAF50' },
          { label: 'Active Campaigns', value: campaigns.filter(c => c.isActive).length, icon: <CampaignRounded />, color: '#6C63FF' },
          { label: 'Donations', value: donations.length, icon: <FavoriteRounded />, color: '#FF6584' },
          { label: 'Residents', value: profile.residentCount || 0, icon: <PeopleRounded />, color: '#FF9800' },
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
        {/* Recent Donations */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Recent Donations</Typography>
                <Button size="small" onClick={() => navigate('/carehome/donations')}>View all</Button>
              </Box>
              {loading ? <CircularProgress size={24} /> : donations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <FavoriteRounded sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No donations yet. Complete your profile to attract students!</Typography>
                </Box>
              ) : (
                <List dense disablePadding>
                  {donations.map((d, i) => (
                    <React.Fragment key={d._id}>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#6C63FF22', color: '#6C63FF', width: 36, height: 36 }}>
                            {d.isAnonymous ? '?' : d.student?.name?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={d.isAnonymous ? 'Anonymous Student' : d.student?.name}
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

        {/* Campaigns Overview */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Active Campaigns</Typography>
                <Button size="small" onClick={() => navigate('/carehome/campaigns')}>Manage</Button>
              </Box>
              {campaigns.filter(c => c.isActive).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CampaignRounded sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No active campaigns. Create one to inspire students!</Typography>
                  <Button variant="contained" size="small" sx={{ mt: 2, background: 'linear-gradient(135deg, #FF6584, #FF8FA3)' }} onClick={() => navigate('/carehome/campaigns')}>
                    Create Campaign
                  </Button>
                </Box>
              ) : (
                <List dense disablePadding>
                  {campaigns.filter(c => c.isActive).slice(0, 4).map((c, i) => {
                    const pct = Math.min(Math.round((c.raisedAmount / c.goalAmount) * 100), 100);
                    return (
                      <React.Fragment key={c._id}>
                        <ListItem disablePadding sx={{ py: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>{c.title}</Typography>
                            <Typography variant="caption" color="primary" fontWeight={600}>{pct}%</Typography>
                          </Box>
                          <Box sx={{ width: '100%', bgcolor: '#f0f0f0', borderRadius: 5, height: 6 }}>
                            <Box sx={{ width: `${pct}%`, bgcolor: '#FF6584', height: 6, borderRadius: 5 }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">₹{c.raisedAmount.toFixed(2)} / ₹{c.goalAmount}</Typography>
                        </ListItem>
                        {i < campaigns.filter(c => c.isActive).length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
