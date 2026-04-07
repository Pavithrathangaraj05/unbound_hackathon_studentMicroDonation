import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Avatar, Grid, Alert, Chip, MenuItem, Divider
} from '@mui/material';
import {
  DashboardRounded, CampaignRounded, CardGiftcardRounded, ReceiptRounded,
  PersonRounded, EditRounded, SaveRounded, CloudUploadRounded, VerifiedRounded
} from '@mui/icons-material';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { fileToBase64, CAREHOME_TYPES, formatRupee } from '../../utils/helpers';

const menuItems = [
  { path: '/carehome/dashboard', label: 'Dashboard', icon: <DashboardRounded /> },
  { path: '/carehome/campaigns', label: 'My Campaigns', icon: <CampaignRounded /> },
  { path: '/carehome/wishlist', label: 'Wishlist', icon: <CardGiftcardRounded /> },
  { path: '/carehome/donations', label: 'Donations Received', icon: <ReceiptRounded /> },
  { path: '/carehome/profile', label: 'Profile', icon: <PersonRounded /> },
];

export default function CareHomeProfile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    carehomeProfile: { ...user?.carehomeProfile }
  });

  const set = (k) => (e) => setForm({ ...form, carehomeProfile: { ...form.carehomeProfile, [k]: e.target.value } });

  const handleFileUpload = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return alert('File must be under 3MB');
    const b64 = await fileToBase64(file);
    setForm(f => ({ ...f, carehomeProfile: { ...f.carehomeProfile, [field]: b64 } }));
  };

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

  const profile = user?.carehomeProfile || {};
  const typeInfo = profile.carehomeType ? CAREHOME_TYPES[profile.carehomeType] : null;

  const UploadField = ({ field, label, currentVal }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" gutterBottom>{label}</Typography>
      {currentVal ? (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <img src={currentVal} alt={label} style={{ maxHeight: 80, maxWidth: 120, borderRadius: 10, objectFit: 'contain', border: '1px solid #eee', cursor: 'pointer' }}
            onClick={() => field === 'ngoCertificate' ? setCertOpen(true) : undefined} />
          {editing && (
            <Box component="label" sx={{ cursor: 'pointer' }}>
              <Button size="small" variant="outlined" component="span" sx={{ borderRadius: '15px', fontSize: 11 }}>Replace</Button>
              <input type="file" accept="image/*" hidden onChange={e => handleFileUpload(field, e)} />
            </Box>
          )}
        </Box>
      ) : editing ? (
        <Box component="label" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2,
          border: '2px dashed #E8404A', borderRadius: '15px', cursor: 'pointer', bgcolor: '#E8404A08', '&:hover': { bgcolor: '#E8404A12' } }}>
          <CloudUploadRounded sx={{ color: '#E8404A', mb: 0.5 }} />
          <Typography variant="caption" color="#E8404A" fontWeight={600}>Upload {label}</Typography>
          <input type="file" accept="image/*" hidden onChange={e => handleFileUpload(field, e)} />
        </Box>
      ) : (
        <Typography variant="caption" color="text.disabled">Not uploaded</Typography>
      )}
    </Box>
  );

  return (
    <DashboardLayout menuItems={menuItems} role="carehome">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Care Home Profile</Typography>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '15px' }}>Profile updated successfully!</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '15px', textAlign: 'center', p: 3 }}>
            {/* Profile photo */}
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                src={form.carehomeProfile?.profilePhoto || profile.profilePhoto || ''}
                sx={{ bgcolor: '#E8404A', width: 96, height: 96, fontSize: 38, fontWeight: 800 }}
              >
                {(profile.facilityName || user?.name)?.charAt(0)?.toUpperCase()}
              </Avatar>
              {editing && (
                <Box component="label" sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#E8404A', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <CloudUploadRounded sx={{ fontSize: 14, color: 'white' }} />
                  <input type="file" accept="image/*" hidden onChange={e => handleFileUpload('profilePhoto', e)} />
                </Box>
              )}
            </Box>
            <Typography variant="h6" fontWeight={800}>{profile.facilityName || user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
              {typeInfo && <Chip label={`${typeInfo.emoji} ${typeInfo.label}`} size="small" sx={{ bgcolor: typeInfo.color + '22', color: typeInfo.color, borderRadius: '15px' }} />}
              <Chip label={profile.isApproved ? '✅ Approved' : '⏳ Pending'} color={profile.isApproved ? 'success' : 'warning'} size="small" sx={{ borderRadius: '15px' }} />
            </Box>

            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography fontWeight={800} variant="h6" sx={{ color: '#4CAF50' }}>{formatRupee(profile.totalReceived || 0)}</Typography>
              <Typography variant="caption" color="text.secondary">Total Received</Typography>
            </Box>
            <Box>
              <Typography fontWeight={800} variant="h6" color="primary">{profile.residentCount || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Residents</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />
            {/* Documents */}
            <UploadField field="ngoCertificate" label="📜 NGO Certificate" currentVal={form.carehomeProfile?.ngoCertificate || profile.ngoCertificate} />
            <UploadField field="qrCode" label="📱 UPI Payment QR" currentVal={form.carehomeProfile?.qrCode || profile.qrCode} />
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: '15px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={800}>Facility Details</Typography>
                {!editing ? (
                  <Button startIcon={<EditRounded />} onClick={() => setEditing(true)} sx={{ borderRadius: '15px' }}>Edit</Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={() => setEditing(false)} sx={{ borderRadius: '15px' }}>Cancel</Button>
                    <Button variant="contained" startIcon={<SaveRounded />} onClick={handleSave} disabled={saving}
                      sx={{ borderRadius: '15px', background: 'linear-gradient(135deg, #E8404A, #FF7B54)', fontWeight: 700 }}>Save</Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Contact Name" value={form.name} disabled={!editing} onChange={e => setForm({ ...form, name: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Care Home Name" value={form.carehomeProfile?.facilityName || ''} disabled={!editing} onChange={set('facilityName')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} /></Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Type of Care Home" select value={form.carehomeProfile?.carehomeType || 'elderly_care'} disabled={!editing} onChange={set('carehomeType')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}>
                    {Object.entries(CAREHOME_TYPES).map(([val, info]) => (
                      <MenuItem key={val} value={val}>{info.emoji} {info.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}><TextField fullWidth label="Email" value={user?.email} disabled sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} /></Grid>
                <Grid item xs={8}><TextField fullWidth label="Address" value={form.carehomeProfile?.address || ''} disabled={!editing} onChange={set('address')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} /></Grid>
                <Grid item xs={4}><TextField fullWidth label="Postcode" value={form.carehomeProfile?.postcode || ''} disabled={!editing} onChange={set('postcode')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="City" value={form.carehomeProfile?.city || ''} disabled={!editing} onChange={set('city')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Phone" value={form.carehomeProfile?.phone || ''} disabled={!editing} onChange={set('phone')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="NGO / Reg. Number" value={form.carehomeProfile?.registrationNumber || ''} disabled={!editing} onChange={set('registrationNumber')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="No. of Residents" type="number" value={form.carehomeProfile?.residentCount || ''} disabled={!editing} onChange={set('residentCount')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="UPI ID" value={form.carehomeProfile?.upiId || ''} disabled={!editing} onChange={set('upiId')} placeholder="yourname@upi" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="About Your Care Home" multiline rows={4} value={form.carehomeProfile?.description || ''} disabled={!editing} onChange={set('description')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* NGO cert full view */}
      {certOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }} onClick={() => setCertOpen(false)}>
          <img src={profile.ngoCertificate} alt="Certificate" style={{ maxWidth: '90%', maxHeight: '90vh', borderRadius: 15, objectFit: 'contain' }} />
        </Box>
      )}
    </DashboardLayout>
  );
}
