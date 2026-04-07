import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Alert,
  Chip, LinearProgress, CircularProgress, Switch, FormControlLabel, Snackbar,
  IconButton, Divider, List, ListItem, ListItemAvatar, ListItemText, Tab, Tabs
} from '@mui/material';
import {
  DashboardRounded, CampaignRounded, CardGiftcardRounded, ReceiptRounded,
  PersonRounded, AddRounded, DeleteRounded, GroupsRounded, CheckRounded, CloseRounded,
  EventRounded, VolunteerActivismRounded
} from '@mui/icons-material';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../context/AuthContext';
import { formatRupee } from '../../utils/helpers';

const menuItems = [
  { path: '/carehome/dashboard', label: 'Dashboard', icon: <DashboardRounded /> },
  { path: '/carehome/campaigns', label: 'My Campaigns', icon: <CampaignRounded /> },
  { path: '/carehome/wishlist', label: 'Wishlist', icon: <CardGiftcardRounded /> },
  { path: '/carehome/donations', label: 'Donations Received', icon: <ReceiptRounded /> },
  { path: '/carehome/profile', label: 'Profile', icon: <PersonRounded /> },
];

const CATEGORIES = ['equipment', 'activities', 'comfort', 'nutrition', 'entertainment', 'medical', 'other'];

const emptyForm = {
  title: '', description: '', category: 'other', goalAmount: '', isUrgent: false,
  needsVolunteers: false, volunteerDate: '', volunteerTime: '', volunteerWorkType: '',
  volunteerSlots: 5, volunteerDetails: '', tags: ''
};


export default function CareHomeCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [volDialog, setVolDialog] = useState({ open: false, campaign: null });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const load = () => API.get(`/campaigns?carehome=${user?._id}`).then(r => setCampaigns(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.goalAmount) return;
    setSaving(true);
    try {
      await API.post('/campaigns', {
        ...form,
        goalAmount: parseFloat(form.goalAmount),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        volunteerDate: form.needsVolunteers && form.volunteerDate ? new Date(form.volunteerDate) : undefined,
        volunteerSlots: parseInt(form.volunteerSlots) || 5,
      });
      setDialog(false);
      setForm(emptyForm);
      await load();
      setSnack({ open: true, msg: 'Campaign created!', severity: 'success' });
    } catch { setSnack({ open: true, msg: 'Failed to create campaign', severity: 'error' }); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/campaigns/${id}`);
      setCampaigns(campaigns.filter(c => c._id !== id));
      setSnack({ open: true, msg: 'Campaign deleted', severity: 'success' });
    } catch { setSnack({ open: true, msg: 'Failed to delete', severity: 'error' }); }
  };

  const handleToggle = async (c) => {
    await API.put(`/campaigns/${c._id}`, { isActive: !c.isActive });
    setCampaigns(campaigns.map(x => x._id === c._id ? { ...x, isActive: !x.isActive } : x));
  };

  const handleVolunteerAction = async (campaignId, volId, status) => {
    try {
      await API.put(`/campaigns/${campaignId}/volunteer/${volId}`, { status });
      await load();
      setSnack({ open: true, msg: `Volunteer ${status}!`, severity: status === 'accepted' ? 'success' : 'warning' });
      const updated = await API.get(`/campaigns/${campaignId}`);
      setVolDialog({ open: true, campaign: updated.data });
    } catch { setSnack({ open: true, msg: 'Action failed', severity: 'error' }); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <DashboardLayout menuItems={menuItems} role="carehome">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>My Campaigns</Typography>
          <Typography color="text.secondary">Create campaigns and accept student volunteers</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialog(true)}
          sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #E8404A, #FF7B54)', fontWeight: 700 }}>
          New Campaign
        </Button>
      </Box>

      {loading ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
        : campaigns.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CampaignRounded sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No campaigns yet</Typography>
            <Button variant="contained" sx={{ mt: 2, borderRadius: '15px', background: 'linear-gradient(135deg, #E8404A, #FF7B54)' }} onClick={() => setDialog(true)}>
              Create Your First Campaign
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {campaigns.map(c => {
              const pct = Math.min(Math.round((c.raisedAmount / c.goalAmount) * 100), 100);
              const pendingVols = (c.volunteers || []).filter(v => v.status === 'pending').length;
              const acceptedVols = (c.volunteers || []).filter(v => v.status === 'accepted').length;
              return (
                <Grid item xs={12} sm={6} md={4} key={c._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '15px', opacity: c.isActive ? 1 : 0.65 }}>
                    <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip label={c.category} size="small" sx={{ fontSize: 10, borderRadius: '15px' }} />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {c.isUrgent && <Chip label="Urgent" size="small" color="error" sx={{ fontSize: 10 }} />}
                          <Chip label={c.isActive ? 'Active' : 'Paused'} size="small" color={c.isActive ? 'success' : 'default'} sx={{ fontSize: 10 }} />
                        </Box>
                      </Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom noWrap>{c.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.description}
                      </Typography>
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={700} color="success.main">{formatRupee(c.raisedAmount)}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatRupee(c.goalAmount)}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: '15px', '& .MuiLinearProgress-bar': { bgcolor: '#E8404A', borderRadius: '15px' } }} />
                        <Typography variant="caption" color="text.secondary">{pct}% • {c.donorCount} donors</Typography>
                      </Box>

                      {c.needsVolunteers && (
                        <Box sx={{ p: 1.5, bgcolor: '#6C63FF0D', borderRadius: '15px', mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <VolunteerActivismRounded sx={{ fontSize: 14, color: '#6C63FF' }} />
                            <Typography variant="caption" fontWeight={700} color="primary">Volunteers Needed</Typography>
                          </Box>
                          {c.volunteerDate && <Typography variant="caption" color="text.secondary">📅 {new Date(c.volunteerDate).toLocaleDateString('en-IN')} {c.volunteerTime}</Typography>}
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            {pendingVols > 0 && <Chip label={`${pendingVols} pending`} size="small" color="warning" sx={{ height: 18, fontSize: 9 }} />}
                            {acceptedVols > 0 && <Chip label={`${acceptedVols} accepted`} size="small" color="success" sx={{ height: 18, fontSize: 9 }} />}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                      {c.needsVolunteers && (c.volunteers || []).length > 0 && (
                        <Button size="small" variant="outlined" startIcon={<GroupsRounded />}
                          onClick={() => setVolDialog({ open: true, campaign: c })}
                          sx={{ flex: 1, borderRadius: '15px', fontSize: 11 }}>
                          Volunteers ({(c.volunteers || []).length})
                        </Button>
                      )}
                      <Button size="small" variant="outlined" onClick={() => handleToggle(c)}
                        sx={{ flex: 1, borderRadius: '15px', borderColor: '#E8404A', color: '#E8404A', fontSize: 11 }}>
                        {c.isActive ? 'Pause' : 'Activate'}
                      </Button>
                      <IconButton size="small" color="error" onClick={() => handleDelete(c._id)}><DeleteRounded fontSize="small" /></IconButton>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

      {/* Create Campaign Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '15px' } }}>
        <DialogTitle fontWeight={800}>Create New Campaign</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField fullWidth label="Campaign Title *" value={form.title} onChange={set('title')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
            <TextField fullWidth label="Description *" multiline rows={3} value={form.description} onChange={set('description')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="Category" select value={form.category} onChange={set('category')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>)}
              </TextField>
              <TextField fullWidth label="Goal Amount (₹) *" type="number" value={form.goalAmount} onChange={set('goalAmount')} inputProps={{ min: 100 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
            </Box>
            <TextField fullWidth label="Tags (comma separated)" value={form.tags} onChange={set('tags')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
            <Box sx={{ display: 'flex', gap: 3 }}>
              <FormControlLabel control={<Switch checked={form.isUrgent} onChange={e => setForm({ ...form, isUrgent: e.target.checked })} />} label="Mark as Urgent" />
              <FormControlLabel control={<Switch checked={form.needsVolunteers} onChange={e => setForm({ ...form, needsVolunteers: e.target.checked })} color="primary" />} label="Need Volunteers?" />
            </Box>

            {form.needsVolunteers && (
              <Box sx={{ p: 2, border: '1.5px solid #6C63FF33', borderRadius: '15px' }}>
                <Typography variant="subtitle2" fontWeight={700} color="primary" gutterBottom>🙋 Volunteer Details</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField fullWidth label="Date" type="date" value={form.volunteerDate} onChange={set('volunteerDate')} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
                  <TextField fullWidth label="Time" type="time" value={form.volunteerTime} onChange={set('volunteerTime')} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
                </Box>
                <TextField fullWidth label="Type of Work *" value={form.volunteerWorkType} onChange={set('volunteerWorkType')} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} placeholder="e.g. Teaching, Feeding, Entertainment, Medical assistance" />
                <TextField fullWidth label="No. of Volunteer Slots" type="number" value={form.volunteerSlots} onChange={set('volunteerSlots')} inputProps={{ min: 1 }} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
                <TextField fullWidth label="Additional Volunteer Details" multiline rows={2} value={form.volunteerDetails} onChange={set('volunteerDetails')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} placeholder="What should volunteers bring? Any requirements?" />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDialog(false)} sx={{ borderRadius: '15px' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.title || !form.goalAmount}
            sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #E8404A, #FF7B54)', fontWeight: 700 }}>
            {saving ? 'Creating...' : 'Create Campaign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Volunteers Dialog */}
      <Dialog open={volDialog.open} onClose={() => setVolDialog({ open: false, campaign: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '15px' } }}>
        <DialogTitle fontWeight={800}>
          Volunteers — {volDialog.campaign?.title}
          {volDialog.campaign?.volunteerDate && (
            <Typography variant="caption" display="block" color="text.secondary">
              📅 {new Date(volDialog.campaign.volunteerDate).toLocaleDateString('en-IN')} {volDialog.campaign.volunteerTime} • {volDialog.campaign?.volunteerWorkType}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {(volDialog.campaign?.volunteers || []).length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>No volunteers yet</Typography>
          ) : (
            <List disablePadding>
              {(volDialog.campaign?.volunteers || []).map((v, i) => (
                <React.Fragment key={v._id}>
                  <ListItem sx={{ px: 0, py: 1.5, flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 1.5 }}>
                      {v.studentIdCardPhoto ? (
                        <Avatar src={v.studentIdCardPhoto} sx={{ width: 52, height: 36, borderRadius: '8px', objectFit: 'cover' }} variant="rounded" />
                      ) : (
                        <Avatar sx={{ bgcolor: '#6C63FF22', color: '#6C63FF', width: 44, height: 44, fontWeight: 700 }}>
                          {v.studentName?.charAt(0)}
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700} variant="body2">{v.studentName}</Typography>
                        <Typography variant="caption" color="text.secondary">{v.studentEmail}</Typography>
                        {v.studentUniversity && <Typography variant="caption" color="text.secondary" display="block">{v.studentUniversity}</Typography>}
                        {v.message && <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>"{v.message}"</Typography>}
                      </Box>
                      <Box>
                        <Chip
                          label={v.status}
                          size="small"
                          color={v.status === 'accepted' ? 'success' : v.status === 'rejected' ? 'error' : 'warning'}
                          sx={{ mb: 0.5, display: 'block' }}
                        />
                      </Box>
                    </Box>
                    {v.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, ml: 7 }}>
                        <Button size="small" variant="contained" color="success" startIcon={<CheckRounded />}
                          onClick={() => handleVolunteerAction(volDialog.campaign._id, v._id, 'accepted')}
                          sx={{ borderRadius: '15px', fontSize: 11 }}>Accept</Button>
                        <Button size="small" variant="outlined" color="error" startIcon={<CloseRounded />}
                          onClick={() => handleVolunteerAction(volDialog.campaign._id, v._id, 'rejected')}
                          sx={{ borderRadius: '15px', fontSize: 11 }}>Decline</Button>
                      </Box>
                    )}
                    {v.studentIdCardPhoto && (
                      <Box sx={{ mt: 1, ml: 7 }}>
                        <img src={v.studentIdCardPhoto} alt="Student ID" style={{ maxHeight: 60, borderRadius: 8, objectFit: 'contain', border: '1px solid #eee' }} />
                        <Typography variant="caption" color="text.secondary" display="block">Student ID Card</Typography>
                      </Box>
                    )}
                  </ListItem>
                  {i < (volDialog.campaign?.volunteers || []).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setVolDialog({ open: false, campaign: null })} sx={{ borderRadius: '15px' }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: '15px' }}>{snack.msg}</Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
