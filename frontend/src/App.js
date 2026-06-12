import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SplashScreen from './components/SplashScreen';
import AuroraBackground from './components/AuroraBackground';
import MobileBottomNav from './components/MobileBottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileSelector from './pages/ProfileSelector';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import MyListPage from './pages/MyListPage';
import AdminPanel from './pages/AdminPanel';
import CategoriesPage from './pages/CategoriesPage';
import { useViewport } from './hooks/useViewport';
import { isAdminUser } from './mock';

function Protected({ children, requireProfile = true, adminOnly = false }) {
  const { user, profile, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (requireProfile && !profile) return <Navigate to="/profiles" replace />;
  if (adminOnly && !isAdminUser(user)) return <Navigate to="/browse" replace />;
  return children;
}

function RootRedirect() {
  const { user, profile, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <Navigate to="/profiles" replace />;
  return <Navigate to="/browse" replace />;
}

function AppShell() {
  const [splash, setSplash] = useState(true);
  const vp = useViewport();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('is-ios', vp.isIOS);
    root.classList.toggle('is-android', vp.isAndroid);
    root.classList.toggle('is-mobile', vp.isMobile);
    root.classList.toggle('is-tablet', vp.isTablet);
    root.classList.toggle('is-desktop', vp.isDesktop);
    root.classList.toggle('is-standalone', vp.isStandalone);
  }, [vp.isIOS, vp.isAndroid, vp.isMobile, vp.isTablet, vp.isDesktop, vp.isStandalone]);

  useEffect(() => {
    const seen = sessionStorage.getItem('jly_splash_done');
    if (seen) setSplash(false);
  }, []);
  const done = () => { sessionStorage.setItem('jly_splash_done', '1'); setSplash(false); };

  return (
    <div className="App">
      <AuroraBackground />
      {splash && <SplashScreen onDone={done}/>}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage/>} />
          <Route path="/profiles" element={<Protected requireProfile={false}><ProfileSelector/></Protected>} />
          <Route path="/browse" element={<Protected><HomePage mode="all"/></Protected>} />
          <Route path="/browse/movies" element={<Protected><HomePage mode="movies"/></Protected>} />
          <Route path="/browse/series" element={<Protected><HomePage mode="series"/></Protected>} />
          <Route path="/browse/new" element={<Protected><HomePage mode="new"/></Protected>} />
          <Route path="/search" element={<Protected><SearchPage/></Protected>} />
          <Route path="/my-list" element={<Protected><MyListPage/></Protected>} />
          <Route path="/categories" element={<Protected><CategoriesPage/></Protected>} />
          <Route path="/categories/:id" element={<Protected><CategoriesPage/></Protected>} />
          <Route path="/admin" element={<Protected adminOnly><AdminPanel/></Protected>} />
          <Route path="*" element={<Navigate to="/" replace/>} />
        </Routes>
        <MobileBottomNav />
        <PWAInstallPrompt />
      </BrowserRouter>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppShell/>
      </AuthProvider>
    </ErrorBoundary>
  );
}
