import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Settings() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  
  // New Hotel-Specific Settings
  const [isLightMode, setIsLightMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);

  // Handle Theme Switching
  useEffect(() => {
    // Check if the user previously set a theme in this session
    const currentTheme = document.body.classList.contains('light-mode');
    setIsLightMode(currentTheme);
    fetchCategories(); 
  }, []);

  const toggleTheme = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    if (newMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('room_categories').select('*').order('created_at', { ascending: true });
    setCategories(data || []);
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    const { error } = await supabase.from('room_categories').insert([{ name: newCategory.trim() }]);
    if (error) alert(error.message);
    else {
      setNewCategory('');
      fetchCategories();
    }
  };

  const deleteCategory = async (id, name) => {
    if(window.confirm(`Delete the "${name}" room category?`)) {
      await supabase.from('room_categories').delete().eq('id', id);
      fetchCategories();
    }
  };

  // Reusable toggle button component for a cleaner layout
  const ToggleButton = ({ active, onClick }) => (
    <button 
      onClick={onClick}
      style={{ 
        background: active ? 'var(--gold-accent)' : 'transparent', 
        color: active ? '#ffffff' : 'var(--text-muted)', 
        borderColor: active ? 'var(--gold-accent)' : 'var(--border-color)',
        minWidth: '100px'
      }}
    >
      {active ? 'ON' : 'OFF'}
    </button>
  );

  return (
    <div>
      {/* Dynamic Room Name Configuration */}
      <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '30px', transition: 'all 0.3s' }}>
        <h2 style={{ margin: '0 0 20px 0' }}>Room Categories</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Manage the default room names that appear as selectable buttons when adding a new room.
        </p>
        
        <form onSubmit={addCategory} style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
          <input 
            placeholder="New Room Type (e.g. Ocean View Suite)" 
            value={newCategory} 
            onChange={e => setNewCategory(e.target.value)} 
            style={{ maxWidth: '400px' }}
          />
          <button type="submit">Add Category</button>
        </form>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <div key={cat.id} style={{ 
              display: 'flex', alignItems: 'center', background: 'var(--bg-dark)', 
              border: '1px solid var(--border-color)', padding: '8px 15px', borderRadius: '2px' 
            }}>
              <span style={{ marginRight: '15px', color: 'var(--text-main)' }}>{cat.name}</span>
              <button 
                onClick={() => deleteCategory(cat.id, cat.name)}
                style={{ padding: '4px 8px', fontSize: '0.7rem', borderColor: '#ff4444', color: '#ff4444' }}
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System Preferences */}
      <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '4px', border: '1px solid var(--border-color)', transition: 'all 0.3s' }}>
        <h2 style={{ margin: '0 0 20px 0' }}>System Preferences</h2>
        
        {/* Theme Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-main)', fontFamily: 'Montserrat, sans-serif' }}>Appearance: Light Mode</h4>
            <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Switch the admin dashboard to a brighter color palette.</p>
          </div>
          <ToggleButton active={isLightMode} onClick={toggleTheme} />
        </div>

        {/* Email Alerts Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-main)', fontFamily: 'Montserrat, sans-serif' }}>New Booking Notifications</h4>
            <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Send an email to the admin account whenever a guest submits a new reservation.</p>
          </div>
          <ToggleButton active={emailAlerts} onClick={() => setEmailAlerts(!emailAlerts)} />
        </div>

        {/* Auto-Approve Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-main)', fontFamily: 'Montserrat, sans-serif' }}>Auto-Approve Reservations</h4>
            <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Bypass the "Pending" state and instantly confirm all incoming guest bookings.</p>
          </div>
          <ToggleButton active={autoApprove} onClick={() => setAutoApprove(!autoApprove)} />
        </div>
        
      </div>
    </div>
  );
}