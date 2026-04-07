import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Avatar, Grid, Chip,
  LinearProgress, CircularProgress, Tab, Tabs, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Snackbar, Divider
} from '@mui/material';
import {
  LocationOnRounded, PhoneRounded, PeopleRounded, FavoriteRounded,
  DashboardRounded, HomeRounded, HistoryRounded, EmojiEventsRounded,
  CardGiftcardRounded, PersonRounded, VolunteerActivismRounded,
  EventRounded, ArticleRounded, QrCodeRounded, VerifiedRounded
} from '@mui/icons-material';
import DashboardLayout from '../../components/common/DashboardLayout';
import { API } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { formatRupee, CAREHOME_TYPES } from '../../utils/helpers';

const menuItems = [
  { path: '/student/dashboard', label: 'Dashboard', icon: <DashboardRounded /> },
  { path: '/student/carehomes', label: 'Browse Care Homes', icon: <HomeRounded /> },
  { path: '/student/wishlist', label: 'Wishlist Items', icon: <CardGiftcardRounded /> },
  { path: '/student/history', label: 'Donation History', icon: <HistoryRounded /> },
  { path: '/student/leaderboard', label: 'Leaderboard', icon: <EmojiEventsRounded /> },
  { path: '/student/profile', label: 'My Profile', icon: <PersonRounded /> },
];

export default function StudentCareHomeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [carehome, setCareHome] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [volDialog, setVolDialog] = useState({ open: false, campaign: null });
  const [volMsg, setVolMsg] = useState('');
  const [applying, setApplying] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [certOpen, setCertOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get(`/carehomes/${id}`),
      API.get(`/campaigns?carehome=${id}`)
    ]).then(([c, camp]) => {
      setCareHome(c.data);
      setCampaigns(camp.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleVolunteer = async () => {
    if (!volDialog.campaign) return;
    setApplying(true);
    try {
      await API.post(`/campaigns/${volDialog.campaign._id}/volunteer`, { message: volMsg });
      setVolDialog({ open: false, campaign: null });
      setVolMsg('');
      setSnack({ open: true, msg: '🎉 Volunteer application submitted! The care home will review it.', severity: 'success' });
      const updated = await API.get(`/campaigns?carehome=${id}`);
      setCampaigns(updated.data);
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || 'Failed to apply', severity: 'error' });
    }
    setApplying(false);
  };

  if (loading) return (
    <DashboardLayout menuItems={menuItems} role="student">
      <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
    </DashboardLayout>
  );

  const profile = carehome?.carehomeProfile || {};
  const typeInfo = profile.carehomeType ? CAREHOME_TYPES[profile.carehomeType] : null;

  return (
    <DashboardLayout menuItems={menuItems} role="student">
      <Button onClick={() => navigate('/student/carehomes')} sx={{ mb: 2, color: '#6C63FF', fontWeight: 600 }}>← Back to Care Homes</Button>

      <Card sx={{ mb: 3, borderRadius: '15px', overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #E8404A, #FF7B54)', p: { xs: 2, md: 3 }, color: 'white' }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              {profile.profilePhoto ? (
                <Avatar src={profile.profilePhoto} sx={{ width: 80, height: 80, border: '3px solid rgba(255,255,255,0.5)' }} />
              ) : (
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.25)', width: 80, height: 80, fontSize: 32, fontWeight: 800, color: 'white' }}>
                  {(profile.facilityName || carehome?.name)?.charAt(0)}
                </Avatar>
              )}
            </Grid>
            <Grid item xs>
              <Typography variant="h5" fontWeight={800}>{profile.facilityName || carehome?.name}</Typography>
              {typeInfo && <Chip label={`${typeInfo.emoji} ${typeInfo.label}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', mt: 0.5, borderRadius: '15px' }} />}
              {profile.city && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <LocationOnRounded fontSize="small" />
                  <Typography variant="body2">{profile.city} {profile.postcode}</Typography>
                </Box>
              )}
            </Grid>
            <Grid item>
              <Button variant="contained" size="large" startIcon={<FavoriteRounded />}
                onClick={() => navigate(`/student/donate/${id}`)}
                sx={{ bgcolor: 'white', color: '#E8404A', fontWeight: 800, borderRadius: '15px', '&:hover': { bgcolor: '#fff5f5' } }}>
                Donate Now
              </Button>
            </Grid>
          </Grid>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {profile.residentCount > 0 && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PeopleRounded sx={{ color: '#E8404A', fontSize: 18 }} /><Typography variant="body2">{profile.residentCount} residents</Typography></Box>}
                {profile.phone && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PhoneRounded sx={{ color: '#E8404A', fontSize: 18 }} /><Typography variant="body2">{profile.phone}</Typography></Box>}
                {profile.registrationNumber && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><VerifiedRounded sx={{ color: '#4CAF50', fontSize: 18 }} /><Typography variant="body2">NGO: {profile.registrationNumber}</Typography></Box>}
              </Box>
              {profile.description && <Typography variant="body2" color="text.secondary">{profile.description}</Typography>}
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {profile.ngoCertificate && (
                <Box sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setCertOpen(true)}>
                  <img src={profile.ngoCertificate} alt="NGO Cert" style={{ height: 70, borderRadius: 10, objectFit: 'cover', border: '1px solid #eee' }} />
                  <Typography variant="caption" color="success.main" display="block" fontWeight={700}>📜 NGO Certificate</Typography>
                </Box>
              )}
              {profile.qrCode && (
                <Box sx={{ textAlign: 'center' }}>
                  <img src={profile.qrCode} alt="QR" style={{ height: 70, borderRadius: 10, objectFit: 'cover', border: '1px solid #eee' }} />
                  <Typography variant="caption" color="primary" display="block" fontWeight={700}>📱 Pay QR</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
          {profile.totalReceived > 0 && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#4CAF5011', borderRadius: '15px', display: 'inline-block' }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#4CAF50' }}>💚 {formatRupee(profile.totalReceived)} received from students</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 700 } }}>
        <Tab label={`Campaigns (${campaigns.length})`} />
        <Tab label={`Volunteer Opportunities (${campaigns.filter(c => c.needsVolunteers).length})`} />
      </Tabs>

      {tab === 0 && (
        campaigns.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>No active campaigns at the moment</Typography>
            <Button variant="contained" sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #5A52E0, #8B85FF)' }} onClick={() => navigate(`/student/donate/${id}`)}>
              Make General Donation
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {campaigns.map(c => {
              const progress = Math.min(Math.round((c.raisedAmount / c.goalAmount) * 100), 100);
              return (
                <Grid item xs={12} sm={6} key={c._id}>
                  <Card sx={{ borderRadius: '15px', '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.2s' } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }} noWrap>{c.title}</Typography>
                        {c.isUrgent && <Chip label="Urgent" size="small" color="error" sx={{ ml: 1, borderRadius: '15px' }} />}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={700}>{formatRupee(c.raisedAmount)} raised</Typography>
                          <Typography variant="caption" color="text.secondary">{formatRupee(c.goalAmount)} goal</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: '15px', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #5A52E0, #8B85FF)' } }} />
                        <Typography variant="caption" color="primary" fontWeight={700}>{progress}% funded</Typography>
                      </Box>
                      <Button fullWidth variant="outlined" color="primary" onClick={() => navigate(`/student/donate/${id}`)} sx={{ borderRadius: '15px' }}>
                        Support This Campaign
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )
      )}

      {tab === 1 && (
        campaigns.filter(c => c.needsVolunteers).length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <VolunteerActivismRounded sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography color="text.secondary">No volunteer opportunities available right now</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {campaigns.filter(c => c.needsVolunteers).map(c => {
              const myApp = (c.volunteers || []).find(v => v.student === user?._id || v.studentEmail === user?.email);
              const acceptedVols = (c.volunteers || []).filter(v => v.status === 'accepted');
              return (
                <Grid item xs={12} sm={6} key={c._id}>
                  <Card sx={{ borderRadius: '15px' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={800} gutterBottom>{c.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{c.description}</Typography>

                      <Box sx={{ p: 2, bgcolor: '#6C63FF0D', borderRadius: '15px', mb: 2 }}>
                        {c.volunteerDate && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <EventRounded sx={{ fontSize: 16, color: '#6C63FF' }} />
                          <Typography variant="body2" fontWeight={600}>{new Date(c.volunteerDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at {c.volunteerTime}</Typography>
                        </Box>}
                        {c.volunteerWorkType && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <VolunteerActivismRounded sx={{ fontSize: 16, color: '#6C63FF' }} />
                          <Typography variant="body2">{c.volunteerWorkType}</Typography>
                        </Box>}
                        <Typography variant="caption" color="text.secondary">
                          Slots: {c.volunteerSlots} total • {acceptedVols.length} filled
                        </Typography>
                        {c.volunteerDetails && <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>{c.volunteerDetails}</Typography>}
                      </Box>

                      {/* Accepted volunteers */}
                      {acceptedVols.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" fontWeight={700} color="text.secondary" gutterBottom>Accepted Volunteers:</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {acceptedVols.map(v => (
                              <Chip key={v._id} size="small" label={`🙋 ${v.studentName}`}
                                sx={{ bgcolor: '#4CAF5022', color: '#4CAF50', borderRadius: '15px', fontSize: 11 }} />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {myApp ? (
                        <Chip
                          label={myApp.status === 'accepted' ? '✅ You are accepted as volunteer!' : myApp.status === 'rejected' ? '❌ Application not accepted' : '⏳ Application under review'}
                          color={myApp.status === 'accepted' ? 'success' : myApp.status === 'rejected' ? 'error' : 'warning'}
                          sx={{ width: '100%', borderRadius: '15px' }}
                        />
                      ) : (
                        <Button fullWidth variant="contained" startIcon={<VolunteerActivismRounded />}
                          onClick={() => setVolDialog({ open: true, campaign: c })}
                          sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #5A52E0, #8B85FF)', fontWeight: 700 }}>
                          Apply to Volunteer
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )
      )}

      {/* Volunteer application dialog */}
      <Dialog open={volDialog.open} onClose={() => setVolDialog({ open: false, campaign: null })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '15px' } }}>
        <DialogTitle fontWeight={800}>Apply to Volunteer</DialogTitle>
        <DialogContent>
          {volDialog.campaign && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#F5F6FA', borderRadius: '15px' }}>
              <Typography variant="body2" fontWeight={700}>{volDialog.campaign.title}</Typography>
              {volDialog.campaign.volunteerDate && (
                <Typography variant="caption" color="text.secondary">
                  📅 {new Date(volDialog.campaign.volunteerDate).toLocaleDateString('en-IN')} at {volDialog.campaign.volunteerTime}
                </Typography>
              )}
              {volDialog.campaign.volunteerWorkType && (
                <Typography variant="caption" color="text.secondary" display="block">🔧 {volDialog.campaign.volunteerWorkType}</Typography>
              )}
            </Box>
          )}
          <TextField fullWidth label="Why do you want to volunteer? (optional)" multiline rows={3} value={volMsg}
            onChange={e => setVolMsg(e.target.value)} placeholder="Tell the care home about yourself and why you'd like to help..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
          <Alert severity="info" sx={{ mt: 2, borderRadius: '15px', fontSize: 12 }}>
            Your name, email, university, and student ID card will be shared with the care home.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setVolDialog({ open: false, campaign: null })} sx={{ borderRadius: '15px' }}>Cancel</Button>
          <Button variant="contained" onClick={handleVolunteer} disabled={applying}
            sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #5A52E0, #8B85FF)', fontWeight: 700 }}>
            {applying ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: '15px' }}>{snack.msg}</Alert>
      </Snackbar>

      {/* NGO cert fullscreen */}
      {certOpen && profile.ngoCertificate && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }} onClick={() => setCertOpen(false)}>
          <img src={profile.ngoCertificate} alt="Certificate" style={{ maxWidth: '90%', maxHeight: '90vh', borderRadius: 15, objectFit: 'contain' }} />
        </Box>
      )}
    </DashboardLayout>
  );
}
