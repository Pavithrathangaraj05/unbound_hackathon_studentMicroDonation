// import React, { useState, useEffect } from 'react';
// import {
//   Box, Grid, Card, CardContent, Typography, Button, Avatar, Chip, CircularProgress,
//   MenuItem, TextField, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions,
//   LinearProgress, ToggleButton, ToggleButtonGroup, Divider
// } from '@mui/material';
// import { DashboardRounded, HomeRounded, HistoryRounded, EmojiEventsRounded, CardGiftcardRounded, PersonRounded, QrCodeRounded } from '@mui/icons-material';
// import DashboardLayout from '../../components/common/DashboardLayout';
// import { API } from '../../context/AuthContext';
// import { formatRupee } from '../../utils/helpers';

// const menuItems = [
//   { path: '/student/dashboard', label: 'Dashboard', icon: <DashboardRounded /> },
//   { path: '/student/carehomes', label: 'Browse Care Homes', icon: <HomeRounded /> },
//   { path: '/student/wishlist', label: 'Wishlist Items', icon: <CardGiftcardRounded /> },
//   { path: '/student/history', label: 'Donation History', icon: <HistoryRounded /> },
//   { path: '/student/leaderboard', label: 'Leaderboard', icon: <EmojiEventsRounded /> },
//   { path: '/student/profile', label: 'My Profile', icon: <PersonRounded /> },
// ];

// const PRIORITY_COLORS = { high: '#f44336', medium: '#FF9800', low: '#4CAF50' };
// const CATEGORY_EMOJIS = { books: '📚', games: '🎮', clothing: '👗', food: '🍽️', medical: '💊', entertainment: '🎭', other: '🎁' };

// export default function StudentWishlist() {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('');
//   const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
//   const [selected, setSelected] = useState(null);
//   const [payDialog, setPayDialog] = useState(false);
//   const [payMode, setPayMode] = useState('half');
//   const [saving, setSaving] = useState(false);
//   const [payMsg, setPayMsg] = useState('');
//   const [isInPerson, setIsInPerson] = useState(false);

//   const load = () => API.get('/wishlist?fulfilled=false').then(r => setItems(r.data)).finally(() => setLoading(false));
//   useEffect(() => { load(); }, []);

//   const openPay = (item) => { setSelected(item); setPayMode('half'); setPayDialog(true); };

//   const handlePay = async () => {
//     if (!selected) return;
//     setSaving(true);
//     try {
//       const amountPaid = payMode === 'half' ? selected.price / 2 : selected.price;
//       await API.put(`/wishlist/${selected._id}/partial-fulfill`, {
//         amountPaid,
//         isInPerson,
//         message: payMsg,
//       });
//       setPayDialog(false);
//       setSnack({ open: true, msg: payMode === 'half' ? '🎉 Half payment recorded! Item now shows updated price.' : '🎉 Item fulfilled! Great job!', severity: 'success' });
//       await load();
//     } catch (err) {
//       setSnack({ open: true, msg: err.response?.data?.message || 'Failed', severity: 'error' });
//     }
//     setSaving(false);
//   };

//   const filtered = filter ? items.filter(i => i.category === filter) : items;

//   return (
//     <DashboardLayout menuItems={menuItems} role="student">
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="h5" fontWeight={800}>🎁 Care Home Wishlist</Typography>
//         <Typography color="text.secondary">Fulfill specific items care homes need for their residents</Typography>
//       </Box>

//       <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
//         <TextField select label="Filter Category" value={filter} onChange={e => setFilter(e.target.value)} size="small" sx={{ minWidth: 170, '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}>
//           <MenuItem value="">All Categories</MenuItem>
//           {Object.entries(CATEGORY_EMOJIS).map(([cat, emoji]) => (
//             <MenuItem key={cat} value={cat}>{emoji} {cat.charAt(0).toUpperCase() + cat.slice(1)}</MenuItem>
//           ))}
//         </TextField>
//       </Box>

//       {loading ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
//         : filtered.length === 0 ? (
//           <Box sx={{ textAlign: 'center', py: 8 }}>
//             <CardGiftcardRounded sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
//             <Typography color="text.secondary">No wishlist items available right now</Typography>
//           </Box>
//         ) : (
//           <Grid container spacing={3}>
//             {filtered.map(item => {
//               const totalPaid = item.originalPrice - item.price;
//               const pct = item.originalPrice > 0 ? Math.round((totalPaid / item.originalPrice) * 100) : 0;
//               return (
//                 <Grid item xs={12} sm={6} md={4} key={item._id}>
//                   <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '15px',
//                     '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transition: 'all 0.25s' } }}>
//                     <CardContent sx={{ flex: 1 }}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
//                         <Typography variant="h3" sx={{ fontSize: 36 }}>{CATEGORY_EMOJIS[item.category]}</Typography>
//                         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
//                           <Chip label={item.priority} size="small"
//                             sx={{ bgcolor: PRIORITY_COLORS[item.priority] + '22', color: PRIORITY_COLORS[item.priority], fontWeight: 700, height: 20, fontSize: 10 }} />
//                           {item.isHalfFulfilled && <Chip label="Half Paid" size="small" sx={{ bgcolor: '#FF980022', color: '#FF9800', height: 18, fontSize: 9 }} />}
//                         </Box>
//                       </Box>
//                       <Typography variant="h6" fontWeight={800} gutterBottom>{item.name}</Typography>
//                       {item.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{item.description}</Typography>}

//                       {/* Price info */}
//                       <Box sx={{ mb: 1.5 }}>
//                         {item.isHalfFulfilled ? (
//                           <>
//                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                               <Typography variant="h5" fontWeight={800} color="primary">{formatRupee(item.price)}</Typography>
//                               <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>{formatRupee(item.originalPrice)}</Typography>
//                             </Box>
//                             <Typography variant="caption" sx={{ color: '#FF9800', fontWeight: 600 }}>Remaining after partial payment</Typography>
//                           </>
//                         ) : (
//                           <Typography variant="h5" fontWeight={800} color="primary">{formatRupee(item.price)}</Typography>
//                         )}
//                       </Box>

//                       {pct > 0 && (
//                         <Box sx={{ mb: 1.5 }}>
//                           <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
//                             <Typography variant="caption" color="success.main" fontWeight={700}>{formatRupee(totalPaid)} paid</Typography>
//                             <Typography variant="caption" color="text.secondary">{pct}%</Typography>
//                           </Box>
//                           <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 5, '& .MuiLinearProgress-bar': { bgcolor: '#4CAF50' } }} />
//                         </Box>
//                       )}

//                       {/* QR code */}
//                       {item.qrCode && (
//                         <Box sx={{ mt: 1, p: 1.5, bgcolor: '#6C63FF08', borderRadius: '15px', textAlign: 'center' }}>
//                           <QrCodeRounded sx={{ fontSize: 14, color: '#6C63FF', mr: 0.5 }} />
//                           <Typography variant="caption" color="primary" fontWeight={600}>QR Payment Available</Typography>
//                           <img src={item.qrCode} alt="QR" style={{ display: 'block', width: 90, height: 90, objectFit: 'contain', margin: '4px auto', borderRadius: 8 }} />
//                         </Box>
//                       )}

//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
//                         <Avatar sx={{ width: 24, height: 24, bgcolor: '#FF658422', color: '#FF6584', fontSize: 10 }}>
//                           {item.carehome?.carehomeProfile?.facilityName?.charAt(0) || item.carehome?.name?.charAt(0)}
//                         </Avatar>
//                         <Typography variant="caption" color="text.secondary" noWrap>
//                           {item.carehome?.carehomeProfile?.facilityName || item.carehome?.name} • {item.carehome?.carehomeProfile?.city}
//                         </Typography>
//                       </Box>
//                     </CardContent>
//                     <Box sx={{ p: 2, pt: 0 }}>
//                       <Button fullWidth variant="contained" onClick={() => openPay(item)}
//                         sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #5A52E0, #8B85FF)', fontWeight: 700 }}>
//                         🎁 Fulfill This Wish
//                       </Button>
//                     </Box>
//                   </Card>
//                 </Grid>
//               );
//             })}
//           </Grid>
//         )}

//       {/* Payment dialog */}
//       <Dialog open={payDialog} onClose={() => setPayDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '15px' } }}>
//         <DialogTitle fontWeight={800}>Fulfill: {selected?.name}</DialogTitle>
//         <DialogContent>
//           {selected?.qrCode && (
//             <Box sx={{ textAlign: 'center', mb: 2 }}>
//               <Typography variant="body2" fontWeight={700} gutterBottom>Scan to Pay</Typography>
//               <img src={selected.qrCode} alt="QR" style={{ width: 150, height: 150, objectFit: 'contain', borderRadius: 10, border: '1px solid #eee' }} />
//               {selected?.carehome?.carehomeProfile?.upiId && (
//                 <Typography variant="caption" color="primary" display="block" fontWeight={600}>UPI: {selected.carehome.carehomeProfile.upiId}</Typography>
//               )}
//             </Box>
//           )}
//           <Divider sx={{ mb: 2 }} />
//           <Typography variant="subtitle2" fontWeight={700} gutterBottom>How much would you like to pay?</Typography>
//           <ToggleButtonGroup value={payMode} exclusive onChange={(e, v) => { if (v) setPayMode(v); }} fullWidth sx={{ mb: 2 }}>
//             <ToggleButton value="half" sx={{ borderRadius: '15px !important', fontWeight: 600 }}>
//               Half ({formatRupee((selected?.price || 0) / 2)})
//             </ToggleButton>
//             <ToggleButton value="full" sx={{ borderRadius: '15px !important', fontWeight: 600 }}>
//               Full ({formatRupee(selected?.price || 0)})
//             </ToggleButton>
//           </ToggleButtonGroup>
//           {payMode === 'half' && (
//             <Alert severity="info" sx={{ mb: 2, borderRadius: '15px', fontSize: 12 }}>
//               The remaining {formatRupee((selected?.price || 0) / 2)} will remain on the wishlist for another student to fulfill.
//             </Alert>
//           )}
//           <ToggleButtonGroup value={isInPerson ? 'person' : 'online'} exclusive onChange={(e, v) => setIsInPerson(v === 'person')} fullWidth sx={{ mb: 2 }}>
//             <ToggleButton value="online" sx={{ borderRadius: '15px !important', fontWeight: 600, fontSize: 12 }}>💳 Pay Online</ToggleButton>
//             <ToggleButton value="person" sx={{ borderRadius: '15px !important', fontWeight: 600, fontSize: 12 }}>🤝 In Person</ToggleButton>
//           </ToggleButtonGroup>
//           <TextField fullWidth label="Message (optional)" multiline rows={2} value={payMsg} onChange={e => setPayMsg(e.target.value)} placeholder="Leave a note for the care home..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
//         </DialogContent>
//         <DialogActions sx={{ p: 3, pt: 0 }}>
//           <Button onClick={() => setPayDialog(false)} sx={{ borderRadius: '15px' }}>Cancel</Button>
//           <Button variant="contained" onClick={handlePay} disabled={saving}
//             sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #5A52E0, #8B85FF)', fontWeight: 700 }}>
//             {saving ? 'Processing...' : 'Confirm Payment'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
//         <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: '15px' }}>{snack.msg}</Alert>
//       </Snackbar> */}
//     </DashboardLayout>
//   );
// }
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Avatar, Chip,
  CircularProgress, MenuItem, TextField, Alert, Snackbar, Dialog,
  DialogTitle, DialogContent, DialogActions, LinearProgress,
  ToggleButton, ToggleButtonGroup, Divider, Stepper, Step, StepLabel
} from '@mui/material';
import {
  DashboardRounded, HomeRounded, HistoryRounded, EmojiEventsRounded,
  CardGiftcardRounded, PersonRounded, QrCodeRounded, CheckCircleRounded,
  ContentCopyRounded
} from '@mui/icons-material';
import DashboardLayout from '../../components/common/DashboardLayout';
import { API } from '../../context/AuthContext';
import { formatRupee } from '../../utils/helpers';

const menuItems = [
  { path: '/student/dashboard', label: 'Dashboard', icon: <DashboardRounded /> },
  { path: '/student/carehomes', label: 'Browse Care Homes', icon: <HomeRounded /> },
  { path: '/student/wishlist', label: 'Wishlist Items', icon: <CardGiftcardRounded /> },
  { path: '/student/history', label: 'Donation History', icon: <HistoryRounded /> },
  { path: '/student/leaderboard', label: 'Leaderboard', icon: <EmojiEventsRounded /> },
  { path: '/student/profile', label: 'My Profile', icon: <PersonRounded /> },
];

const PRIORITY_COLORS = { high: '#f44336', medium: '#FF9800', low: '#4CAF50' };
const CATEGORY_EMOJIS = {
  books: '📚', games: '🎮', clothing: '👗',
  food: '🍽️', medical: '💊', entertainment: '🎭', other: '🎁'
};

/* ─────────────────────────────────────────────────────────────────────────────
   3-step dialog
   Step 0 → Choose amount + method
   Step 1 → Confirm summary
   Step 2 → Payment QR revealed  ← QR only shown AFTER API success
───────────────────────────────────────────────────────────────────────────── */
function FulfillDialog({ open, item, onClose, onDone }) {
  const [step, setStep] = useState(0);
  const [payMode, setPayMode] = useState('half');
  const [payMethod, setPayMethod] = useState('online');
  const [payMsg, setPayMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0); setPayMode('half'); setPayMethod('online');
      setPayMsg(''); setSaving(false); setError(''); setCopied(false);
    }
  }, [open]);

  if (!item) return null;

  const amountToPay = payMode === 'half' ? item.price / 2 : item.price;
  const upiId = item.carehome?.carehomeProfile?.upiId || '';
  const qrCode = item.qrCode || item.carehome?.carehomeProfile?.qrCode || '';
  const facilityName = item.carehome?.carehomeProfile?.facilityName || item.carehome?.name || 'Care Home';

  const handleConfirm = async () => {
    setSaving(true);
    setError('');
    try {
      await API.put(`/wishlist/${item._id}/partial-fulfill`, {
        amountPaid: amountToPay,
        isInPerson: payMethod === 'person',
        message: payMsg,
      });
      onDone();   // refresh parent list silently
      setStep(2); // only go to QR step on success
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const copyUpi = () => {
    if (upiId) {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={step === 2 ? onClose : undefined}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: '15px' } }}
    >
      {/* ── Title + stepper ── */}
      <DialogTitle sx={{ pb: 0 }}>
        <Typography fontWeight={800} variant="h6">🎁 {item.name}</Typography>
        <Typography variant="caption" color="text.secondary">{facilityName}</Typography>
        <Stepper activeStep={step} sx={{ mt: 2 }} alternativeLabel>
          {['Choose', 'Confirm', 'Pay'].map(l => (
            <Step key={l}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: 11 } }}>{l}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>

        {/* ── STEP 0 : choose amount & method ── */}
        {step === 0 && (
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              How much would you like to contribute?
            </Typography>
            <ToggleButtonGroup
              value={payMode} exclusive
              onChange={(_, v) => { if (v) setPayMode(v); }}
              fullWidth sx={{ mb: 2 }}
            >
              <ToggleButton value="half"
                sx={{ borderRadius: '15px !important', fontWeight: 700, flexDirection: 'column', py: 1.5 }}>
                <Typography variant="body2" fontWeight={800} color="primary">{formatRupee(item.price / 2)}</Typography>
                <Typography variant="caption" color="text.secondary">Half</Typography>
              </ToggleButton>
              <ToggleButton value="full"
                sx={{ borderRadius: '15px !important', fontWeight: 700, flexDirection: 'column', py: 1.5 }}>
                <Typography variant="body2" fontWeight={800} color="primary">{formatRupee(item.price)}</Typography>
                <Typography variant="caption" color="text.secondary">Full</Typography>
              </ToggleButton>
            </ToggleButtonGroup>

            {payMode === 'half' && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: '15px', fontSize: 12 }}>
                Remaining {formatRupee(item.price / 2)} stays on the wishlist for another student.
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={700} gutterBottom>How will you pay?</Typography>
            <ToggleButtonGroup
              value={payMethod} exclusive
              onChange={(_, v) => { if (v) setPayMethod(v); }}
              fullWidth sx={{ mb: 2 }}
            >
              <ToggleButton value="online"
                sx={{ borderRadius: '15px !important', fontWeight: 600, fontSize: 13 }}>
                📱 Online / UPI
              </ToggleButton>
              <ToggleButton value="person"
                sx={{ borderRadius: '15px !important', fontWeight: 600, fontSize: 13 }}>
                🤝 In Person
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField
              fullWidth multiline rows={2}
              label="Message for care home (optional)"
              value={payMsg} onChange={e => setPayMsg(e.target.value)}
              placeholder="e.g. Happy to help! 😊"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}
            />
          </Box>
        )}

        {/* ── STEP 1 : confirm ── */}
        {step === 1 && (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '15px' }}>{error}</Alert>
            )}

            <Box sx={{ p: 2, bgcolor: '#F5F6FA', borderRadius: '15px', mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Item</Typography>
              <Typography fontWeight={700}>{item.name}</Typography>
              <Typography variant="caption" color="text.secondary">{facilityName}</Typography>
            </Box>

            <Box sx={{ p: 2, bgcolor: '#6C63FF0D', borderRadius: '15px', mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">You're paying</Typography>
                <Typography fontWeight={800} color="primary" variant="h6">
                  {formatRupee(amountToPay)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Method</Typography>
                <Chip
                  label={payMethod === 'online' ? '📱 Online / UPI' : '🤝 In Person'}
                  size="small" sx={{ borderRadius: '15px', fontWeight: 600 }}
                />
              </Box>
              {payMode === 'half' && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Remaining after this</Typography>
                  <Typography variant="body2" fontWeight={700} color="warning.main">
                    {formatRupee(item.price / 2)}
                  </Typography>
                </Box>
              )}
            </Box>

            <Alert severity="warning" sx={{ borderRadius: '15px', fontSize: 12 }}>
              {payMethod === 'online'
                ? '⚡ After confirming, the care home QR will appear to complete payment.'
                : '🤝 After confirming, visit the care home in person to deliver the amount.'}
            </Alert>
          </Box>
        )}

        {/* ── STEP 2 : QR revealed after API success ── */}
        {step === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleRounded sx={{ fontSize: 56, color: '#4CAF50', mb: 1 }} />
            <Typography variant="h6" fontWeight={800} gutterBottom>
              {payMethod === 'online' ? 'Now complete payment!' : 'Contribution recorded! 🤝'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {payMethod === 'online'
                ? `Scan the QR or copy the UPI ID to pay ${formatRupee(amountToPay)} to ${facilityName}.`
                : `Your contribution of ${formatRupee(amountToPay)} has been recorded. Visit ${facilityName} in person to complete.`}
            </Typography>

            {payMethod === 'online' && (
              <>
                {qrCode ? (
                  <Box sx={{
                    display: 'inline-block', p: 2,
                    border: '2px solid #6C63FF33', borderRadius: '15px', mb: 2
                  }}>
                    <img
                      src={qrCode} alt="UPI QR Code"
                      style={{ width: 200, height: 200, objectFit: 'contain', borderRadius: 10, display: 'block' }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Scan with any UPI app
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ p: 3, bgcolor: '#F5F6FA', borderRadius: '15px', mb: 2 }}>
                    <QrCodeRounded sx={{ fontSize: 64, color: '#ccc', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      QR not uploaded by care home yet. Use UPI ID below.
                    </Typography>
                  </Box>
                )}

                {upiId ? (
                  <Box
                    onClick={copyUpi}
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 1, p: 1.5, bgcolor: '#6C63FF0D', borderRadius: '15px',
                      cursor: 'pointer', mb: 1,
                      '&:hover': { bgcolor: '#6C63FF1A' }
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} color="primary">{upiId}</Typography>
                    <ContentCopyRounded sx={{ fontSize: 16, color: '#6C63FF' }} />
                    {copied && (
                      <Chip label="Copied!" size="small" color="success"
                        sx={{ height: 18, fontSize: 10, borderRadius: '15px' }} />
                    )}
                  </Box>
                ) : null}

                <Typography variant="caption" color="text.secondary">
                  Pay exactly <strong>{formatRupee(amountToPay)}</strong>
                </Typography>
              </>
            )}

            {payMethod === 'person' && (
              <Box sx={{ p: 2, bgcolor: '#4CAF5011', borderRadius: '15px' }}>
                <Typography variant="body2" fontWeight={700} color="success.main">✅ Recorded!</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  The care home has been notified of your contribution.
                </Typography>
              </Box>
            )}
          </Box>
        )}

      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
        {step === 0 && (
          <>
            <Button onClick={onClose} sx={{ borderRadius: '15px' }}>Cancel</Button>
            <Button
              variant="contained" onClick={() => setStep(1)}
              sx={{
                borderRadius: '15px', flex: 1, fontWeight: 700,
                background: 'linear-gradient(135deg, #5A52E0, #8B85FF)'
              }}
            >
              Continue →
            </Button>
          </>
        )}
        {step === 1 && (
          <>
            <Button
              onClick={() => { setError(''); setStep(0); }}
              sx={{ borderRadius: '15px' }}
            >
              ← Back
            </Button>
            <Button
              variant="contained" onClick={handleConfirm} disabled={saving}
              sx={{
                borderRadius: '15px', flex: 1, fontWeight: 700,
                background: 'linear-gradient(135deg, #5A52E0, #8B85FF)'
              }}
            >
              {saving ? 'Confirming…' : '✅ Confirm & Pay'}
            </Button>
          </>
        )}
        {step === 2 && (
          <Button
            fullWidth variant="contained" onClick={onClose}
            sx={{
              borderRadius: '15px', fontWeight: 700,
              background: 'linear-gradient(135deg, #4CAF50, #66BB6A)'
            }}
          >
            Done 🎉
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────────────── */
export default function StudentWishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const load = () => {
    setLoading(true);
    API.get('/wishlist?fulfilled=false')
      .then(r => setItems(r.data))
      .catch(() => setSnack({ open: true, msg: 'Failed to load wishlist', severity: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openDialog = (item) => { setSelected(item); setDialogOpen(true); };

  const handleDone = () => {
    // Silently refresh list; QR step stays visible
    API.get('/wishlist?fulfilled=false')
      .then(r => setItems(r.data))
      .catch(() => {});
    setSnack({ open: true, msg: '✅ Contribution recorded! Complete payment using the QR.', severity: 'success' });
  };

  const handleClose = () => { setDialogOpen(false); setSelected(null); };

  const filtered = filter ? items.filter(i => i.category === filter) : items;

  return (
    <DashboardLayout menuItems={menuItems} role="student">

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>🎁 Care Home Wishlist</Typography>
        <Typography color="text.secondary">Fulfill specific items care homes need for their residents</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          select label="Filter by Category" value={filter}
          onChange={e => setFilter(e.target.value)} size="small"
          sx={{ minWidth: 190, '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {Object.entries(CATEGORY_EMOJIS).map(([cat, emoji]) => (
            <MenuItem key={cat} value={cat}>
              {emoji} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <CardGiftcardRounded sx={{ fontSize: 72, color: '#ddd', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>No wishlist items right now</Typography>
          <Typography variant="body2" color="text.disabled">Check back later!</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map(item => {
            const totalPaid = (item.originalPrice || item.price) - item.price;
            const pct = item.originalPrice > 0
              ? Math.round((totalPaid / item.originalPrice) * 100) : 0;
            const hasQR = !!(item.qrCode || item.carehome?.carehomeProfile?.qrCode);

            return (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card sx={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  borderRadius: '15px', border: '1.5px solid #F0F0F5',
                  transition: 'all 0.25s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(108,99,255,0.12)',
                    borderColor: '#6C63FF44'
                  }
                }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography sx={{ fontSize: 38 }}>{CATEGORY_EMOJIS[item.category]}</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                        <Chip
                          label={item.priority} size="small"
                          sx={{
                            bgcolor: PRIORITY_COLORS[item.priority] + '20',
                            color: PRIORITY_COLORS[item.priority],
                            fontWeight: 700, height: 20, fontSize: 10, borderRadius: '15px'
                          }}
                        />
                        {item.isHalfFulfilled && (
                          <Chip
                            label="Half Paid" size="small"
                            sx={{ bgcolor: '#FF980018', color: '#FF9800', height: 18, fontSize: 9, borderRadius: '15px' }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ lineHeight: 1.2 }}>
                      {item.name}
                    </Typography>
                    {item.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: 13 }}>
                        {item.description}
                      </Typography>
                    )}

                    {/* Price */}
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h5" fontWeight={800} color="primary">
                          {formatRupee(item.price)}
                        </Typography>
                        {item.isHalfFulfilled && item.originalPrice && (
                          <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#bbb' }}>
                            {formatRupee(item.originalPrice)}
                          </Typography>
                        )}
                      </Box>
                      {item.isHalfFulfilled && (
                        <Typography variant="caption" sx={{ color: '#FF9800', fontWeight: 600 }}>
                          Remaining — someone already paid half!
                        </Typography>
                      )}
                    </Box>

                    {/* Progress */}
                    {pct > 0 && (
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="success.main" fontWeight={700}>
                            {formatRupee(totalPaid)} paid
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{pct}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate" value={pct}
                          sx={{
                            height: 6, borderRadius: '15px',
                            '& .MuiLinearProgress-bar': { bgcolor: '#4CAF50', borderRadius: '15px' }
                          }}
                        />
                      </Box>
                    )}

                    {/* QR hint — no actual QR shown yet */}
                    {hasQR && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        <QrCodeRounded sx={{ fontSize: 14, color: '#6C63FF' }} />
                        <Typography variant="caption" color="primary" fontWeight={600}>
                          QR available — shown after you confirm payment
                        </Typography>
                      </Box>
                    )}

                    {/* Care home tag */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                      <Avatar
                        src={item.carehome?.carehomeProfile?.profilePhoto || ''}
                        sx={{ width: 22, height: 22, bgcolor: '#E8404A22', color: '#E8404A', fontSize: 10 }}
                      >
                        {(item.carehome?.carehomeProfile?.facilityName || item.carehome?.name || '?').charAt(0)}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.carehome?.carehomeProfile?.facilityName || item.carehome?.name}
                        {item.carehome?.carehomeProfile?.city ? ` • ${item.carehome.carehomeProfile.city}` : ''}
                      </Typography>
                    </Box>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth variant="contained"
                      onClick={() => openDialog(item)}
                      sx={{
                        borderRadius: '15px', fontWeight: 700, py: 1.1,
                        background: 'linear-gradient(135deg, #5A52E0, #8B85FF)'
                      }}
                    >
                      🎁 Fulfill This Wish
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <FulfillDialog
        open={dialogOpen}
        item={selected}
        onClose={handleClose}
        onDone={handleDone}
      />

      <Snackbar
        open={snack.open} autoHideDuration={5000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{ borderRadius: '15px' }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}