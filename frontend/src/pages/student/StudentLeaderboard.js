import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, Chip, CircularProgress, List,
  ListItem, ListItemAvatar, ListItemText, Divider
} from '@mui/material';
import { DashboardRounded, HomeRounded, HistoryRounded, EmojiEventsRounded, CardGiftcardRounded, PersonRounded } from '@mui/icons-material';
import DashboardLayout from '../../components/common/DashboardLayout';
import { API } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { path: '/student/dashboard', label: 'Dashboard', icon: <DashboardRounded /> },
  { path: '/student/carehomes', label: 'Browse Care Homes', icon: <HomeRounded /> },
  { path: '/student/wishlist', label: 'Wishlist Items', icon: <CardGiftcardRounded /> },
  { path: '/student/history', label: 'Donation History', icon: <HistoryRounded /> },
  { path: '/student/leaderboard', label: 'Leaderboard', icon: <EmojiEventsRounded /> },
  { path: '/student/profile', label: 'My Profile', icon: <PersonRounded /> },
];

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

export default function StudentLeaderboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/students/leaderboard').then(r => setStudents(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout menuItems={menuItems} role="student">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>🏆 Giving Leaderboard</Typography>
        <Typography color="text.secondary">Top student donors making a difference</Typography>
      </Box>

      {/* Top 3 podium */}
      {students.length >= 3 && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #6C63FF, #8B85FF)', color: 'white', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 2 }}>
            {[1, 0, 2].map(idx => (
              <Box key={idx} sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h4">{RANK_EMOJIS[idx]}</Typography>
                <Avatar sx={{ mx: 'auto', mb: 1, width: idx === 0 ? 70 : 54, height: idx === 0 ? 70 : 54, bgcolor: RANK_COLORS[idx], fontSize: idx === 0 ? 28 : 22, fontWeight: 700, border: '3px solid white' }}>
                  {students[idx]?.name?.charAt(0)}
                </Avatar>
                <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 100, mx: 'auto' }}>{students[idx]?.name}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>₹{students[idx]?.studentProfile?.totalDonated?.toFixed(2)}</Typography>
              </Box>
            ))}
          </Box>
        </Card>
      )}

      <Card>
        <CardContent>
          {loading ? <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box> : (
            <List disablePadding>
              {students.map((s, i) => {
                const isMe = s._id === user?._id;
                return (
                  <React.Fragment key={s._id}>
                    <ListItem sx={{ px: 0, py: 1.5, bgcolor: isMe ? '#6C63FF11' : 'transparent', borderRadius: 2, px: isMe ? 1 : 0 }}>
                      <Box sx={{ minWidth: 40, textAlign: 'center', mr: 1 }}>
                        {i < 3 ? (
                          <Typography variant="h5">{RANK_EMOJIS[i]}</Typography>
                        ) : (
                          <Typography fontWeight={700} color="text.secondary">#{i + 1}</Typography>
                        )}
                      </Box>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: i < 3 ? RANK_COLORS[i] : '#6C63FF22', color: i < 3 ? 'white' : '#6C63FF', fontWeight: 700 }}>
                          {s.name?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={700} variant="body2">{s.name} {isMe && <Chip label="You" size="small" sx={{ height: 16, fontSize: 10, bgcolor: '#6C63FF', color: 'white' }} />}</Typography>
                        </Box>}
                        secondary={<>
                          <Typography variant="caption" color="text.secondary">{s.studentProfile?.university || 'Student'}</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {(s.studentProfile?.badges || []).slice(0, 3).map(b => (
                              <Chip key={b} label={b.replace('_', ' ')} size="small" sx={{ height: 14, fontSize: 9 }} />
                            ))}
                          </Box>
                        </>}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography fontWeight={800} color="primary">₹{(s.studentProfile?.totalDonated || 0).toFixed(2)}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.studentProfile?.donationCount || 0} gifts</Typography>
                      </Box>
                    </ListItem>
                    {i < students.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
