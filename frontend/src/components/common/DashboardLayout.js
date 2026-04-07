import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem,
  ListItemIcon, ListItemText, Avatar, Divider, Chip, useTheme, useMediaQuery, Tooltip
} from '@mui/material';
import { MenuRounded, LogoutRounded } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { CAREHOME_TYPES } from '../../utils/helpers';

const DRAWER_WIDTH = 255;

export default function DashboardLayout({ children, menuItems, role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const isStudent = role === 'student';
  const primaryColor = isStudent ? '#6C63FF' : '#E8404A';
  const gradient = isStudent
    ? 'linear-gradient(160deg, #5A52E0 0%, #8B85FF 100%)'
    : 'linear-gradient(160deg, #E8404A 0%, #FF7B54 100%)';

  const handleLogout = () => { logout(); navigate('/'); };

  const carehomeType = user?.carehomeProfile?.carehomeType;
  const typeInfo = carehomeType ? CAREHOME_TYPES[carehomeType] : null;

  const DrawerContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      {/* Logo */}
      <Box sx={{ background: gradient, p: 2.5, color: 'white', flexShrink: 0 }}>
        <Typography
          variant="h6" fontWeight={800}
          sx={{ cursor: 'pointer', letterSpacing: '-0.5px', fontSize: 20 }}
          onClick={() => navigate('/')}
        >
          💜 MicroGive
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8, fontSize: 11 }}>
          {isStudent ? 'Student Portal' : 'Care Home Portal'}
        </Typography>
      </Box>

      {/* User info */}
      <Box sx={{ p: 2, bgcolor: primaryColor + '0D', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isStudent ? (
            <Avatar sx={{ bgcolor: primaryColor, width: 42, height: 42, fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          ) : (
            <Avatar
              src={user?.carehomeProfile?.profilePhoto || ''}
              sx={{ bgcolor: primaryColor, width: 42, height: 42, fontSize: 16, fontWeight: 700, flexShrink: 0 }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 155 }}>{user?.name}</Typography>
            {typeInfo ? (
              <Chip
                label={`${typeInfo.emoji} ${typeInfo.label}`}
                size="small"
                sx={{ height: 18, fontSize: 9, bgcolor: typeInfo.color + '22', color: typeInfo.color, maxWidth: 155 }}
              />
            ) : (
              <Chip
                label={isStudent ? '🎓 Student' : '🏠 Care Home'}
                size="small"
                sx={{ height: 18, fontSize: 10, bgcolor: primaryColor + '22', color: primaryColor }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Menu */}
      <List sx={{ flex: 1, pt: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem
              key={item.path}
              button
              onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
              sx={{
                mx: 1, mb: 0.5, borderRadius: '15px',
                bgcolor: active ? primaryColor + '18' : 'transparent',
                color: active ? primaryColor : 'text.secondary',
                '&:hover': { bgcolor: primaryColor + '10' },
                transition: 'all 0.15s',
              }}
            >
              <ListItemIcon sx={{ color: active ? primaryColor : 'text.disabled', minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: 13.5, noWrap: true }}
              />
            </ListItem>
          );
        })}
      </List>

      <Divider />
      <List sx={{ flexShrink: 0 }}>
        <ListItem
          button onClick={handleLogout}
          sx={{ mx: 1, mb: 1, borderRadius: '15px', color: 'error.main', '&:hover': { bgcolor: '#ff000010' } }}
        >
          <ListItemIcon sx={{ color: 'error.main', minWidth: 36 }}><LogoutRounded /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, fontSize: 13.5 }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F6FA' }}>
      {isMobile ? (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, overflowX: 'hidden' } }}
        >
          <DrawerContent />
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              borderRight: '1px solid #EAEAF0',
              overflowX: 'hidden',
            }
          }}
        >
          <DrawerContent />
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {isMobile && (
          <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #EAEAF0' }}>
            <Toolbar sx={{ minHeight: 56 }}>
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: primaryColor }}>
                <MenuRounded />
              </IconButton>
              <Typography variant="h6" fontWeight={800} sx={{ ml: 1, color: primaryColor }}>💜 MicroGive</Typography>
              <Box sx={{ flex: 1 }} />
              <Tooltip title="Logout">
                <IconButton onClick={handleLogout} color="error"><LogoutRounded /></IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>
        )}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
