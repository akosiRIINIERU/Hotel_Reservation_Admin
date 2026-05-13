import { Link, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function DashboardLayout() {
  const location = useLocation();

  const navStyle = (path) => ({
    padding: '10px 20px', marginRight: '10px', textDecoration: 'none',
    color: location.pathname.includes(path) ? 'var(--gold-accent)' : 'var(--text-muted)',
    borderBottom: location.pathname.includes(path) ? '2px solid var(--gold-accent)' : 'none',
    fontWeight: location.pathname.includes(path) ? '600' : 'normal',
    fontFamily: 'Montserrat, sans-serif'
  });

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Hotel Admin Dashboard</h1>
        <button onClick={() => supabase.auth.signOut()} style={{ borderColor: '#ff4444', color: '#ff4444' }}>Logout</button>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <nav style={{ marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <Link to="/reservations" style={navStyle('/reservations')}>Reservations</Link>
          <Link to="/rooms" style={navStyle('/rooms')}>Manage Rooms</Link>
          <Link to="/settings" style={navStyle('/settings')}>Settings</Link>
          <Link to="/walk-in">Walk-In Booking</Link>
        </nav>
        <main><Outlet /></main>
      </div>
    </div>
  );
}