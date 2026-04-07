import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, TextField, Avatar, Alert,
  Chip, Grid, ToggleButton, ToggleButtonGroup, FormControlLabel, Switch,
  CircularProgress, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  Tab, Tabs
} from '@mui/material';
import {
  FavoriteRounded, DashboardRounded, HomeRounded, HistoryRounded, EmojiEventsRounded,
  CardGiftcardRounded, PersonRounded, CheckCircleRounded, QrCodeRounded,
  VerifiedRounded, LocationOnRounded, PhoneRounded, PeopleRounded, ArticleRounded
} from '@mui/icons-material';
import DashboardLayout from '../../components/common/DashboardLayout';
import { API } from '../../context/AuthContext';
import { formatRupee, CAREHOME_TYPES } from '../../utils/helpers';

const menuItems = [
  { path: '/student/dashboard', label: 'Dashboard', icon: <DashboardRounded /> },
  { path: '/student/carehomes', label: 'Browse Care Homes', icon: <HomeRounded /> },
  { path: '/student/wishlist', label: 'Wishlist Items', icon: <CardGiftcardRounded /> },
  { path: '/student/history', label: 'Donation History', icon: <HistoryRounded /> },
  { path: '/student/leaderboard', label: 'Leaderboard', icon: <EmojiEventsRounded /> },
  { path: '/student/profile', label: 'My Profile', icon: <PersonRounded /> },
];

const PRESET_AMOUNTS = ['50', '100', '200', '500', '1000', '2000'];

export default function StudentDonate() {
  const { carehomeId } = useParams();
  const navigate = useNavigate();
  const [carehome, setCareHome] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState('100');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [qrOpen, setQrOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [infoTab, setInfoTab] = useState(0);

  useEffect(() => {
    Promise.all([
      API.get(`/carehomes/${carehomeId}`),
      API.get(`/campaigns?carehome=${carehomeId}`)
    ]).then(([c, camp]) => {
      setCareHome(c.data);
      setCampaigns(camp.data);
    }).finally(() => setFetchLoading(false));
  }, [carehomeId]);

  const finalAmount = customAmount || selectedAmount;

  const handleDonate = async () => {
    const amt = parseFloat(finalAmount);
    if (!amt || amt < 5) return setError('Minimum donation is ₹5');
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/donations', {
        carehome: carehomeId,
        campaign: selectedCampaign || undefined,
        amount: amt, message, isAnonymous
      });
      setSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Donation failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (fetchLoading) return (
    <DashboardLayout menuItems={menuItems} role="student">
      <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
    </DashboardLayout>
  );

  const profile = carehome?.carehomeProfile || {};
  const typeInfo = profile.carehomeType ? CAREHOME_TYPES[profile.carehomeType] : null;

  return (
    <DashboardLayout menuItems={menuItems} role="student">
      <Button onClick={() => navigate(-1)} sx={{ mb: 2, color: '#6C63FF', fontWeight: 600 }}>← Back</Button>

      {success ? (
        <Card sx={{ maxWidth: 520, mx: 'auto', textAlign: 'center', p: 4, borderRadius: '15px' }}>
          <CheckCircleRounded sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h5" fontWeight={800} gutterBottom>Thank You! 💜</Typography>
          <Typography color="text.secondary" gutterBottom>
            Your donation of {formatRupee(parseFloat(finalAmount))} to {profile.facilityName || carehome?.name} has been received!
          </Typography>
          {success.pointsEarned > 0 && (
            <Chip label={`+${success.pointsEarned} points earned! 🌟`} sx={{ bgcolor: '#6C63FF22', color: '#6C63FF', fontWeight: 700, my: 2 }} />
          )}
          {success.newBadges?.length > 0 && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: '15px' }}>🏆 New badge unlocked: {success.newBadges.join(', ')}</Alert>
          )}
          {profile.qrCode && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>Scan QR to complete payment:</Typography>
              <img src={profile.qrCode} alt="Payment QR" style={{ width: 180, height: 180, objectFit: 'contain', borderRadius: 10, border: '1px solid #eee' }} />
              {profile.upiId && <Typography variant="caption" display="block" color="text.secondary">UPI: {profile.upiId}</Typography>}
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/student/carehomes')} sx={{ borderRadius: '15px' }}>Browse More</Button>
            <Button variant="contained" onClick={() => navigate('/student/dashboard')} sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #5A52E0, #8B85FF)' }}>Dashboard</Button>
          </Box>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {/* Left: Care home info */}
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: '15px', overflow: 'hidden', mb: 2 }}>
              {/* Care home header */}
              <Box sx={{ background: 'linear-gradient(135deg, #E8404A, #FF7B54)', p: 3, color: 'white', textAlign: 'center' }}>
                {profile.profilePhoto ? (
                  <Avatar src={profile.profilePhoto} sx={{ width: 80, height: 80, mx: 'auto', mb: 1.5, border: '3px solid rgba(255,255,255,0.5)' }} />
                ) : (
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 80, height: 80, mx: 'auto', mb: 1.5, fontSize: 32, fontWeight: 800, color: 'white' }}>
                    {(profile.facilityName || carehome?.name)?.charAt(0)}
                  </Avatar>
                )}
                <Typography variant="h6" fontWeight={800}>{profile.facilityName || carehome?.name}</Typography>
                {typeInfo && <Chip label={`${typeInfo.emoji} ${typeInfo.label}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', mt: 0.5, fontSize: 11 }} />}
              </Box>

              <Tabs value={infoTab} onChange={(e, v) => setInfoTab(v)} variant="fullWidth" sx={{ borderBottom: '1px solid #eee' }}>
                <Tab label="About" sx={{ fontSize: 12, fontWeight: 600 }} />
                <Tab label="Certificate" sx={{ fontSize: 12, fontWeight: 600 }} />
                <Tab label="Pay QR" sx={{ fontSize: 12, fontWeight: 600 }} />
              </Tabs>

              <CardContent sx={{ p: 2 }}>
                {infoTab === 0 && (
                  <Box>
                    {profile.city && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOnRounded sx={{ fontSize: 16, color: '#E8404A' }} />
                      <Typography variant="body2">{profile.city} {profile.postcode}</Typography>
                    </Box>}
                    {profile.phone && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PhoneRounded sx={{ fontSize: 16, color: '#E8404A' }} />
                      <Typography variant="body2">{profile.phone}</Typography>
                    </Box>}
                    {profile.residentCount > 0 && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PeopleRounded sx={{ fontSize: 16, color: '#E8404A' }} />
                      <Typography variant="body2">{profile.residentCount} residents</Typography>
                    </Box>}
                    {profile.registrationNumber && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <VerifiedRounded sx={{ fontSize: 16, color: '#4CAF50' }} />
                      <Typography variant="body2">Reg: {profile.registrationNumber}</Typography>
                    </Box>}
                    {profile.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{profile.description}</Typography>}
                    {profile.totalReceived > 0 && (
                      <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#4CAF5011', borderRadius: '15px' }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#4CAF50' }}>
                          💚 {formatRupee(profile.totalReceived)} received from students
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
                {infoTab === 1 && (
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    {profile.ngoCertificate ? (
                      <>
                        <ArticleRounded sx={{ fontSize: 36, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="body2" fontWeight={700} color="success.main" gutterBottom>NGO Certificate Available</Typography>
                        <img
                          src={profile.ngoCertificate} alt="NGO Certificate"
                          style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 10, objectFit: 'contain', cursor: 'pointer', border: '1px solid #eee' }}
                          onClick={() => setCertOpen(true)}
                        />
                        <Typography variant="caption" color="text.secondary" display="block">Click to view full certificate</Typography>
                      </>
                    ) : (
                      <Box sx={{ py: 3 }}>
                        <ArticleRounded sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">Certificate not uploaded yet</Typography>
                      </Box>
                    )}
                  </Box>
                )}
                {infoTab === 2 && (
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    {profile.qrCode ? (
                      <>
                        <Typography variant="body2" fontWeight={700} gutterBottom>Scan to Pay</Typography>
                        <img src={profile.qrCode} alt="Payment QR" style={{ width: 160, height: 160, objectFit: 'contain', borderRadius: 10, border: '1px solid #eee' }} />
                        {profile.upiId && <Typography variant="caption" color="primary" display="block" fontWeight={600} sx={{ mt: 1 }}>UPI: {profile.upiId}</Typography>}
                      </>
                    ) : (
                      <Box sx={{ py: 3 }}>
                        <QrCodeRounded sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">QR code not uploaded yet</Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right: Donation form */}
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: '15px' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>Make a Donation</Typography>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '15px' }}>{error}</Alert>}

                {campaigns.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>Support a Campaign (optional)</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip label="General Donation" onClick={() => setSelectedCampaign('')}
                        variant={!selectedCampaign ? 'filled' : 'outlined'}
                        sx={{ cursor: 'pointer', bgcolor: !selectedCampaign ? '#6C63FF22' : undefined, color: !selectedCampaign ? '#6C63FF' : undefined, borderRadius: '15px' }} />
                      {campaigns.map(c => (
                        <Chip key={c._id} label={c.title} onClick={() => setSelectedCampaign(c._id)}
                          variant={selectedCampaign === c._id ? 'filled' : 'outlined'}
                          sx={{ cursor: 'pointer', bgcolor: selectedCampaign === c._id ? '#6C63FF22' : undefined, color: selectedCampaign === c._id ? '#6C63FF' : undefined, borderRadius: '15px' }} />
                      ))}
                    </Box>
                  </Box>
                )}

                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Select Amount (₹)</Typography>
                <ToggleButtonGroup value={selectedAmount} exclusive onChange={(e, v) => { if (v) { setSelectedAmount(v); setCustomAmount(''); } }} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {PRESET_AMOUNTS.map(amt => (
                    <ToggleButton key={amt} value={amt}
                      sx={{ borderRadius: '15px !important', border: '1.5px solid #ddd !important', px: 2, py: 1, fontWeight: 600,
                        '&.Mui-selected': { bgcolor: '#6C63FF22', color: '#6C63FF', borderColor: '#6C63FF !important' } }}>
                      ₹{amt}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>

                <TextField fullWidth label="Custom amount (₹)" type="number" value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(''); }}
                  inputProps={{ min: 5, step: 1 }} sx={{ mb: 2 }} helperText="Minimum ₹5" />

                <Divider sx={{ my: 2 }} />

                <TextField fullWidth label="Personal message (optional)" multiline rows={2}
                  value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Write a kind message to the residents..." sx={{ mb: 2 }} />
                <FormControlLabel
                  control={<Switch checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} color="primary" />}
                  label="Donate anonymously" sx={{ mb: 3 }} />

                <Box sx={{ bgcolor: '#6C63FF0D', p: 2, borderRadius: '15px', mb: 3 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Donation: <span style={{ color: '#6C63FF', fontSize: 22, fontWeight: 800 }}>{formatRupee(parseFloat(finalAmount || 0))}</span>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    You'll earn ~{Math.floor(parseFloat(finalAmount || 0) / 10)} points 🌟
                  </Typography>
                </Box>

                {profile.qrCode && (
                  <Box sx={{ mb: 3, p: 2, border: '1.5px solid #6C63FF33', borderRadius: '15px', textAlign: 'center' }}>
                    <Typography variant="body2" fontWeight={700} gutterBottom>📱 Pay via QR / UPI</Typography>
                    <img src={profile.qrCode} alt="QR" style={{ width: 130, height: 130, objectFit: 'contain', borderRadius: 10 }} />
                    {profile.upiId && <Typography variant="caption" color="primary" display="block" fontWeight={600}>UPI: {profile.upiId}</Typography>}
                    <Typography variant="caption" color="text.secondary" display="block">Scan and pay {formatRupee(parseFloat(finalAmount || 0))}</Typography>
                  </Box>
                )}

                <Button fullWidth variant="contained" size="large" onClick={handleDonate}
                  disabled={loading || !parseFloat(finalAmount)}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <FavoriteRounded />}
                  sx={{ py: 1.5, fontSize: 16, borderRadius: '15px', background: 'linear-gradient(135deg, #5A52E0, #8B85FF)', fontWeight: 700 }}>
                  {loading ? 'Processing...' : `Donate ${formatRupee(parseFloat(finalAmount || 0))}`}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Certificate full view */}
      <Dialog open={certOpen} onClose={() => setCertOpen(false)} maxWidth="md">
        <DialogTitle fontWeight={700}>NGO Certificate</DialogTitle>
        <DialogContent>
          <img src={profile.ngoCertificate} alt="NGO Certificate" style={{ maxWidth: '100%', borderRadius: 10 }} />
        </DialogContent>
        <DialogActions><Button onClick={() => setCertOpen(false)}>Close</Button></DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
