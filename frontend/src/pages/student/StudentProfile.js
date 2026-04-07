import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Avatar, Grid, Alert, Chip, MenuItem
} from '@mui/material';
import { DashboardRounded, HomeRounded, HistoryRounded, EmojiEventsRounded, CardGiftcardRounded, PersonRounded, EditRounded, SaveRounded } from '@mui/icons-material';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { path: '/student/dashboard', label: 'Dashboard', icon: <DashboardRounded /> },
  { path: '/student/carehomes', label: 'Browse Care Homes', icon: <HomeRounded /> },
  { path: '/student/wishlist', label: 'Wishlist Items', icon: <CardGiftcardRounded /> },
  { path: '/student/history', label: 'Donation History', icon: <HistoryRounded /> },
  { path: '/student/leaderboard', label: 'Leaderboard', icon: <EmojiEventsRounded /> },
  { path: '/student/profile', label: 'My Profile', icon: <PersonRounded /> },
];

const BADGE_CONFIG = {
  first_giver: { label: 'First Gift', emoji: '🌟' },
  regular_giver: { label: 'Regular Giver', emoji: '💚' },
  super_giver: { label: 'Super Giver', emoji: '🦸' },
  bronze_donor: { label: 'Bronze Donor', emoji: '🥉' },
  silver_donor: { label: 'Silver Donor', emoji: '🥈' },
  gold_donor: { label: 'Gold Donor', emoji: '🥇' },
};

export default function StudentProfile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    studentProfile: { ...user?.studentProfile }
  });

  const set = (k) => (e) => setForm({ ...form, studentProfile: { ...form.studentProfile, [k]: e.target.value } });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {}
    setSaving(false);
  };

  const profile = user?.studentProfile || {};
  const badges = profile.badges || [];

  return (
    <DashboardLayout menuItems={menuItems} role="student">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>My Profile</Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Avatar sx={{ bgcolor: '#6C63FF', width: 90, height: 90, mx: 'auto', fontSize: 36, fontWeight: 700, mb: 2 }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            <Chip label="🎓 Student" sx={{ mt: 1, bgcolor: '#6C63FF22', color: '#6C63FF' }} />

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around' }}>
              <Box><Typography fontWeight={800} color="primary">₹{(profile.totalDonated || 0).toFixed(2)}</Typography><Typography variant="caption" color="text.secondary">Donated</Typography></Box>
              <Box><Typography fontWeight={800} color="secondary">{profile.donationCount || 0}</Typography><Typography variant="caption" color="text.secondary">Gifts</Typography></Box>
              <Box><Typography fontWeight={800} sx={{ color: '#4CAF50' }}>{profile.points || 0}</Typography><Typography variant="caption" color="text.secondary">Points</Typography></Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Badges</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                {badges.length === 0 ? <Typography variant="caption" color="text.secondary">No badges yet</Typography>
                  : badges.map(b => <Chip key={b} size="small" label={`${BADGE_CONFIG[b]?.emoji} ${BADGE_CONFIG[b]?.label}`} />)}
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Profile Details</Typography>
                {!editing ? (
                  <Button startIcon={<EditRounded />} onClick={() => setEditing(true)}>Edit</Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={() => setEditing(false)}>Cancel</Button>
                    <Button variant="contained" startIcon={<SaveRounded />} onClick={handleSave} disabled={saving}>Save</Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Full Name" value={form.name} disabled={!editing} onChange={e => setForm({ ...form, name: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Email" value={user?.email} disabled />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="University" value={form.studentProfile?.university || ''} disabled={!editing} onChange={set('university')} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Student ID" value={form.studentProfile?.studentId || ''} disabled={!editing} onChange={set('studentId')} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Course" value={form.studentProfile?.course || ''} disabled={!editing} onChange={set('course')} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Year" select value={form.studentProfile?.year || 1} disabled={!editing} onChange={set('year')}>
                    {[1,2,3,4,5].map(y => <MenuItem key={y} value={y}>Year {y}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Bio" multiline rows={3} value={form.studentProfile?.bio || ''} disabled={!editing} onChange={set('bio')} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
