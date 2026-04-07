import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import StudentLogin from './pages/auth/StudentLogin';
import StudentRegister from './pages/auth/StudentRegister';
import CareHomeLogin from './pages/auth/CareHomeLogin';
import CareHomeRegister from './pages/auth/CareHomeRegister';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCareHomes from './pages/student/StudentCareHomes';
import StudentCareHomeDetail from './pages/student/StudentCareHomeDetail';
import StudentDonate from './pages/student/StudentDonate';
import StudentHistory from './pages/student/StudentHistory';
import StudentLeaderboard from './pages/student/StudentLeaderboard';
import StudentWishlist from './pages/student/StudentWishlist';
import StudentProfile from './pages/student/StudentProfile';

// Care Home pages
import CareHomeDashboard from './pages/carehome/CareHomeDashboard';
import CareHomeCampaigns from './pages/carehome/CareHomeCampaigns';
import CareHomeWishlist from './pages/carehome/CareHomeWishlist';
import CareHomeDonations from './pages/carehome/CareHomeDonations';
import CareHomeProfile from './pages/carehome/CareHomeProfile';

// MUI Theme
const theme = createTheme({
  palette: {
    primary: { main: '#6C63FF', light: '#8B85FF', dark: '#4B44CC' },
    secondary: { main: '#E8404A', light: '#FF7B54', dark: '#CC2030' },
    success: { main: '#4CAF50' },
    background: { default: '#F8F9FF', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(108,99,255,0.3)' } },
      }
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' } }
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 16 } }
    }
  }
});

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/carehome/login" element={<CareHomeLogin />} />
      <Route path="/carehome/register" element={<CareHomeRegister />} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/carehomes" element={<ProtectedRoute requiredRole="student"><StudentCareHomes /></ProtectedRoute>} />
      <Route path="/student/carehomes/:id" element={<ProtectedRoute requiredRole="student"><StudentCareHomeDetail /></ProtectedRoute>} />
      <Route path="/student/donate/:carehomeId" element={<ProtectedRoute requiredRole="student"><StudentDonate /></ProtectedRoute>} />
      <Route path="/student/history" element={<ProtectedRoute requiredRole="student"><StudentHistory /></ProtectedRoute>} />
      <Route path="/student/leaderboard" element={<ProtectedRoute requiredRole="student"><StudentLeaderboard /></ProtectedRoute>} />
      <Route path="/student/wishlist" element={<ProtectedRoute requiredRole="student"><StudentWishlist /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute requiredRole="student"><StudentProfile /></ProtectedRoute>} />

      {/* Care Home Routes */}
      <Route path="/carehome/dashboard" element={<ProtectedRoute requiredRole="carehome"><CareHomeDashboard /></ProtectedRoute>} />
      <Route path="/carehome/campaigns" element={<ProtectedRoute requiredRole="carehome"><CareHomeCampaigns /></ProtectedRoute>} />
      <Route path="/carehome/wishlist" element={<ProtectedRoute requiredRole="carehome"><CareHomeWishlist /></ProtectedRoute>} />
      <Route path="/carehome/donations" element={<ProtectedRoute requiredRole="carehome"><CareHomeDonations /></ProtectedRoute>} />
      <Route path="/carehome/profile" element={<ProtectedRoute requiredRole="carehome"><CareHomeProfile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
