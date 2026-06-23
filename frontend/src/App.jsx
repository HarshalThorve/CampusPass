import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';

// Layout Component
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthLoading from './components/AuthLoading';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import MyTickets from './pages/MyTickets';
import Admin from './pages/Admin';
import Payment from './pages/Payment';
import TicketView from './pages/TicketView';
import Scanner from './pages/Scanner';
import Analytics from './pages/Analytics';

// Secure Route Guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const StudentRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
};

// Page transition wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="flex-1 flex flex-col"
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();
  const { } = useAuth();
  
  const hideNavRoutes = ['/login', '/register'];
  const hideFooterRoutes = ['/login', '/register'];
  const shouldHideNav    = hideNavRoutes.includes(location.pathname);
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#1A1612] text-[#FAF7F2] relative select-none">

      {/* Animated background blobs — actual DOM elements */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {/* Blob 1 — top left warm orange */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '55vw',
          height: '55vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,184,108,0.09) 0%, transparent 65%)',
          filter: 'blur(60px)',
          animation: 'blobFloat1 10s ease-in-out infinite',
        }} />
        
        {/* Blob 2 — bottom right golden sand */}
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(233,196,106,0.07) 0%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'blobFloat2 13s ease-in-out infinite',
        }} />
        
        {/* Blob 3 — center subtle glow */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '30%',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,162,97,0.04) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'blobFloat3 16s ease-in-out infinite',
        }} />
      </div>

      {/* Main content wrapper — sits above blobs */}
      <div className="flex flex-col min-h-screen relative" style={{ zIndex: 1 }}>
        {!shouldHideNav && <Navbar />}
        {!shouldHideNav && <div style={{ height: '100px', flexShrink: 0 }} />}
        <main className="flex-1 flex flex-col relative">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/events" element={<PageWrapper><Events /></PageWrapper>} />
              <Route path="/event/:id" element={<PageWrapper><EventDetails /></PageWrapper>} />
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />

              {/* Student Protected Routes */}
              <Route 
                path="/my-tickets" 
                element={
                  <StudentRoute>
                    <PageWrapper><MyTickets /></PageWrapper>
                  </StudentRoute>
                } 
              />
              <Route 
                path="/payment" 
                element={
                  <ProtectedRoute>
                    <PageWrapper><Payment /></PageWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ticket/:id" 
                element={
                  <ProtectedRoute>
                    <PageWrapper><TicketView /></PageWrapper>
                  </ProtectedRoute>
                } 
              />

              {/* Admin Protected Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <PageWrapper><Admin /></PageWrapper>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/scanner" 
                element={
                  <AdminRoute>
                    <PageWrapper><Scanner /></PageWrapper>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <AdminRoute>
                    <PageWrapper><Analytics /></PageWrapper>
                  </AdminRoute>
                } 
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
        {!shouldHideFooter && <Footer />}
      </div>
    </div>
  );
}

export default App;
