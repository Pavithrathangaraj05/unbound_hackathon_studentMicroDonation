import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, Chip, Divider, CircularProgress,
  List, ListItem, ListItemAvatar, ListItemText, Grid
} from '@mui/material';
import { DashboardRounded, CampaignRounded, CardGiftcardRounded, ReceiptRounded, PersonRounded } from '@mui/icons-material';
import DashboardLayout from '../../components/common/DashboardLayout';
import { API } from '../../context/AuthContext';

const menuItems = [
  { path: '/carehome/dashboard', label: 'Dashboard', icon: <DashboardRounded /> },
  { path: '/carehome/campaigns', label: 'My Campaigns', icon: <CampaignRounded /> },
  { path: '/carehome/wishlist', label: 'Wishlist', icon: <CardGiftcardRounded /> },
  { path: '/carehome/donations', label: 'Donations Received', icon: <ReceiptRounded /> },
  { path: '/carehome/profile', label: 'Profile', icon: <PersonRounded /> },
];

export default function CareHomeDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/donations/received').then(r => setDonations(r.data)).finally(() => setLoading(false));
  }, []);

  const total = donations.reduce((s, d) => s + d.amount, 0);
  const uniqueStudents = new Set(donations.map(d => d.student?._id)).size;

  return (
    <DashboardLayout menuItems={menuItems} role="carehome">
      <Typography variant="h5" fontWeight={700} gutterBottom>Donations Received</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Received', value: `₹${total.toFixed(2)}`, color: '#4CAF50' },
          { label: 'Total Donations', value: donations.length, color: '#FF6584' },
          { label: 'Unique Students', value: uniqueStudents, color: '#6C63FF' },
          { label: 'Avg Donation', value: donations.length ? `₹${(total / donations.length).toFixed(2)}` : '₹0', color: '#FF9800' },
        ].map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>All Donations</Typography>
          {loading ? <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
            : donations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <ReceiptRounded sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography color="text.secondary">No donations received yet</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {donations.map((d, i) => (
                  <React.Fragment key={d._id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: d.isAnonymous ? '#bbb' : '#6C63FF22', color: '#6C63FF' }}>
                          {d.isAnonymous ? '?' : d.student?.name?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={600} variant="body2">
                            {d.isAnonymous ? 'Anonymous Student' : d.student?.name}
                          </Typography>
                          {d.campaign && <Chip label={d.campaign.title} size="small" sx={{ height: 16, fontSize: 9, bgcolor: '#6C63FF22', color: '#6C63FF' }} />}
                        </Box>}
                        secondary={<>
                          <Typography variant="caption" color="text.secondary">
                            {!d.isAnonymous && d.student?.studentProfile?.university && `${d.student.studentProfile.university} • `}
                            {new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </Typography>
                          {d.message && <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic', color: 'text.secondary', mt: 0.3 }}>
                            💬 "{d.message}"
                          </Typography>}
                        </>}
                      />
                      <Typography fontWeight={800} color="success.main" variant="h6">₹{d.amount.toFixed(2)}</Typography>
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
