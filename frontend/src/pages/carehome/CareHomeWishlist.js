import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, CircularProgress,
  Snackbar, Alert, IconButton, LinearProgress
} from '@mui/material';
import {
  DashboardRounded, CampaignRounded, CardGiftcardRounded, ReceiptRounded,
  PersonRounded, AddRounded, DeleteRounded, QrCodeRounded
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

const CATEGORIES = ['books', 'games', 'clothing', 'food', 'medical', 'entertainment', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = { high: '#f44336', medium: '#FF9800', low: '#4CAF50' };
const CATEGORY_EMOJIS = { books: '📚', games: '🎮', clothing: '👗', food: '🍽️', medical: '💊', entertainment: '🎭', other: '🎁' };

const emptyForm = { name: '', description: '', price: '', category: 'other', priority: 'medium' };

export default function CareHomeWishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('active');
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [qrDialog, setQrDialog] = useState({ open: false, item: null });

  const carehomeQR = user?.carehomeProfile?.qrCode || '';
  const upiId = user?.carehomeProfile?.upiId || '';

  const load = () => API.get(`/wishlist?carehome=${user?._id}`).then(r => setItems(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      await API.post('/wishlist', {
        ...form,
        price: parseFloat(form.price),
        qrCode: carehomeQR,
      });
      setDialog(false);
      setForm(emptyForm);
      await load();
      setSnack({ open: true, msg: 'Wishlist item added! QR code attached for student payments.', severity: 'success' });
    } catch { setSnack({ open: true, msg: 'Failed to add item', severity: 'error' }); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/wishlist/${id}`);
      setItems(items.filter(i => i._id !== id));
      setSnack({ open: true, msg: 'Item removed', severity: 'success' });
    } catch { setSnack({ open: true, msg: 'Failed to remove', severity: 'error' }); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const active = items.filter(i => !i.isFulfilled);
  const fulfilled = items.filter(i => i.isFulfilled);
  const displayed = tab === 'active' ? active : fulfilled;

  return (
    <DashboardLayout menuItems={menuItems} role="carehome">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>🎁 Wishlist</Typography>
          <Typography color="text.secondary">Add items students can fulfill for your residents</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialog(true)}
          sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #E8404A, #FF7B54)', fontWeight: 700 }}>
          Add Item
        </Button>
      </Box>

      {!carehomeQR && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: '15px' }}>
          ⚠️ You haven't uploaded a UPI QR code yet. Students won't be able to scan and pay for wishlist items. <Button size="small" href="/carehome/profile">Upload QR in Profile →</Button>
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Chip label={`Active (${active.length})`} onClick={() => setTab('active')} variant={tab === 'active' ? 'filled' : 'outlined'}
          sx={tab === 'active' ? { bgcolor: '#E8404A22', color: '#E8404A', borderRadius: '15px' } : { borderRadius: '15px' }} />
        <Chip label={`Fulfilled (${fulfilled.length})`} onClick={() => setTab('fulfilled')} variant={tab === 'fulfilled' ? 'filled' : 'outlined'}
          sx={tab === 'fulfilled' ? { bgcolor: '#4CAF5022', color: '#4CAF50', borderRadius: '15px' } : { borderRadius: '15px' }} />
      </Box>

      {loading ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
        : displayed.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CardGiftcardRounded sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
            <Typography color="text.secondary">{tab === 'active' ? 'No wishlist items. Add something for students to fulfill!' : 'No fulfilled items yet'}</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {displayed.map(item => {
              const totalPaid = item.originalPrice - item.price;
              const pct = item.originalPrice > 0 ? Math.round((totalPaid / item.originalPrice) * 100) : 0;
              return (
                <Grid item xs={12} sm={6} md={4} key={item._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '15px', opacity: item.isFulfilled ? 0.75 : 1 }}>
                    <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h3" sx={{ fontSize: 36 }}>{CATEGORY_EMOJIS[item.category]}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                          <Chip label={item.priority} size="small"
                            sx={{ bgcolor: PRIORITY_COLORS[item.priority] + '22', color: PRIORITY_COLORS[item.priority], fontSize: 10, height: 18, borderRadius: '15px' }} />
                          {item.isFulfilled && <Chip label="✅ Fulfilled" size="small" color="success" sx={{ fontSize: 10, height: 18 }} />}
                          {item.isHalfFulfilled && !item.isFulfilled && <Chip label="Half Paid" size="small" sx={{ bgcolor: '#FF980022', color: '#FF9800', fontSize: 9, height: 18 }} />}
                        </Box>
                      </Box>
                      <Typography variant="h6" fontWeight={800}>{item.name}</Typography>
                      {item.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{item.description}</Typography>}

                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h5" fontWeight={800} color="primary">{formatRupee(item.price)}</Typography>
                          {item.isHalfFulfilled && <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>{formatRupee(item.originalPrice)}</Typography>}
                        </Box>
                        {item.isHalfFulfilled && <Typography variant="caption" sx={{ color: '#FF9800', fontWeight: 600 }}>remaining</Typography>}
                      </Box>

                      {pct > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="success.main" fontWeight={700}>{formatRupee(totalPaid)} received</Typography>
                            <Typography variant="caption" color="text.secondary">{pct}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: '15px', '& .MuiLinearProgress-bar': { bgcolor: '#4CAF50' } }} />
                        </Box>
                      )}

                      {/* Show QR for this item */}
                      {item.qrCode && !item.isFulfilled && (
                        <Box sx={{ mt: 1, p: 1.5, bgcolor: '#6C63FF08', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                          onClick={() => setQrDialog({ open: true, item })}>
                          <QrCodeRounded sx={{ fontSize: 18, color: '#6C63FF' }} />
                          <Typography variant="caption" color="primary" fontWeight={700}>QR Attached for Student Payment</Typography>
                        </Box>
                      )}

                      {item.partialFulfillments?.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" fontWeight={700} color="text.secondary">Contributions:</Typography>
                          {item.partialFulfillments.map((p, i) => (
                            <Typography key={i} variant="caption" color="text.secondary" display="block">
                              • {p.studentName}: {formatRupee(p.amountPaid)} {p.isInPerson ? '(In Person)' : '(Online)'}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                    {!item.isFulfilled && (
                      <Box sx={{ p: 2, pt: 0 }}>
                        <IconButton size="small" color="error" onClick={() => handleDelete(item._id)}><DeleteRounded /></IconButton>
                      </Box>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

      {/* Add item dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '15px' } }}>
        <DialogTitle fontWeight={800}>Add Wishlist Item</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField fullWidth label="Item Name *" value={form.name} onChange={set('name')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
            <TextField fullWidth label="Description" value={form.description} onChange={set('description')} multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="Price (₹) *" type="number" value={form.price} onChange={set('price')} inputProps={{ min: 1, step: 1 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
              <TextField fullWidth label="Category" select value={form.category} onChange={set('category')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{CATEGORY_EMOJIS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>)}
              </TextField>
            </Box>
            <TextField fullWidth label="Priority" select value={form.priority} onChange={set('priority')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}>
              {PRIORITIES.map(p => <MenuItem key={p} value={p} sx={{ color: PRIORITY_COLORS[p] }}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>)}
            </TextField>
            {carehomeQR ? (
              <Box sx={{ p: 2, bgcolor: '#4CAF5011', borderRadius: '15px', display: 'flex', gap: 2, alignItems: 'center' }}>
                <img src={carehomeQR} alt="QR" style={{ width: 70, height: 70, borderRadius: 10 }} />
                <Box>
                  <Typography variant="body2" fontWeight={700} color="success.main">✅ Your UPI QR will be shown to students</Typography>
                  {upiId && <Typography variant="caption" color="text.secondary">UPI: {upiId}</Typography>}
                  <Typography variant="caption" color="text.secondary" display="block">Students can scan this QR or inform the care home they'll come in person</Typography>
                </Box>
              </Box>
            ) : (
              <Alert severity="warning" sx={{ borderRadius: '15px', fontSize: 12 }}>
                No QR code uploaded. Students can still mark items as fulfilled in-person. Upload your UPI QR in Profile settings.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDialog(false)} sx={{ borderRadius: '15px' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name || !form.price}
            sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #E8404A, #FF7B54)', fontWeight: 700 }}>
            {saving ? 'Adding...' : 'Add to Wishlist'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR view dialog */}
      <Dialog open={qrDialog.open} onClose={() => setQrDialog({ open: false, item: null })} maxWidth="xs" PaperProps={{ sx: { borderRadius: '15px' } }}>
        <DialogTitle fontWeight={800}>Payment QR — {qrDialog.item?.name}</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {qrDialog.item?.qrCode && <img src={qrDialog.item.qrCode} alt="QR" style={{ width: 220, height: 220, objectFit: 'contain', borderRadius: 10, border: '1px solid #eee' }} />}
          {upiId && <Typography color="primary" fontWeight={700} sx={{ mt: 1 }}>UPI: {upiId}</Typography>}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Item price: {formatRupee(qrDialog.item?.price)}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setQrDialog({ open: false, item: null })} sx={{ borderRadius: '15px' }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: '15px' }}>{snack.msg}</Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
