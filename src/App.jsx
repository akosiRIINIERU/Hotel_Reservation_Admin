import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import DashboardLayout from './components/DashboardLayout';
import ManageRooms from './pages/ManageRooms';
import ManageReservations from './pages/ManageReservations';
import Settings from './pages/Settings';
import AboutUs from './pages/AboutUs';
import WalkInBooking from './pages/WalkInBooking'; // <-- 1. NEW IMPORT
import './App.css';

function PublicNav() {
  return (
    <header>
      <h1>Villa Gianna d'Oro</h1>
      <nav>
        <Link to="/about" style={{ color: 'var(--gold-accent)', textDecoration: 'none', marginRight: '20px' }}>About Us</Link>
        <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Admin Login</Link>
      </nav>
    </header>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/about" element={<><PublicNav /><AboutUs /></>} />
          <Route path="/login" element={!session ? <><PublicNav /><Auth /></> : <Navigate to="/" />} />

          <Route path="/" element={session ? <DashboardLayout /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to="/reservations" />} />
            <Route path="reservations" element={<ManageReservations />} />
            <Route path="rooms" element={<ManageRooms />} />
            <Route path="walk-in" element={<WalkInBooking />} /> {/* <-- 2. NEW ROUTE */}
            <Route path="settings" element={<Settings />} /> 
          </Route>
        </Routes>
      </div>
    </Router>
  );
}