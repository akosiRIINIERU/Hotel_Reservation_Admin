import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (isLogin) => {
    // This check prevents the "Anonymous sign-ins are disabled" error
    if (!email || !password) {
      alert("Please enter both an email and a password.");
      return; 
    }

    setLoading(true);
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
      
    if (error) {
      alert(error.message);
    } else if (!isLogin) {
      alert('Admin registered! You can now log in.');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      maxWidth: '450px', 
      margin: '100px auto', 
      padding: '40px', 
      background: 'var(--bg-card)', 
      borderRadius: '4px', 
      border: '1px solid var(--gold-accent)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      textAlign: 'center'
    }}>
      <h2 style={{ marginBottom: '10px', fontSize: '2.2rem' }}>Admin Access</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>
        Authorized Personnel Only
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input 
          type="email" 
          placeholder="Admin Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={{ padding: '15px', fontSize: '1rem' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ padding: '15px', fontSize: '1rem' }}
        />
        
        <button 
          onClick={() => handleAuth(true)} 
          disabled={loading}
          style={{ padding: '15px', fontSize: '1rem', marginTop: '10px' }}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
        
        <button 
          onClick={() => handleAuth(false)} 
          disabled={loading} 
          style={{ 
            background: 'transparent', 
            color: 'var(--text-muted)', 
            borderColor: 'var(--border-color)',
            padding: '15px',
            fontSize: '0.85rem'
          }}
        >
          Register New Admin
        </button>
      </div>
    </div>
  );
}