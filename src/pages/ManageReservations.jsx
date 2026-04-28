import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ManageReservations() {
  const [reservations, setReservations] = useState([]);
  const [selectedRes, setSelectedRes] = useState(null); // State for the Details Modal

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, rooms(*)') // Join with rooms to get all room details
      .order('created_at', { ascending: false });
    
    if (error) console.error("Error fetching reservations:", error.message);
    else setReservations(data);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
    if (error) alert(error.message);
    else fetchReservations();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Guest Reservations</h2>
        <button onClick={fetchReservations} style={{ fontSize: '0.8rem' }}>Refresh List</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Guest Name</th>
            <th>Room Type</th>
            <th>Check-in / Out</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No reservations found in the system.
              </td>
            </tr>
          ) : (
            reservations.map(res => (
              <tr key={res.id}>
                <td>
                  <span style={{ fontWeight: '600' }}>{res.guest_name}</span>
                </td>
                <td>{res.rooms?.name} <small style={{ color: 'var(--gold-accent)' }}>({res.rooms?.room_number_range})</small></td>
                <td>
                  <div style={{ fontSize: '0.85rem' }}>{res.check_in_date}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to {res.check_out_date}</div>
                </td>
                <td>
                  <span style={{ 
                    color: res.status === 'Confirmed' ? '#4CAF50' : res.status === 'Cancelled' ? '#ff4d4d' : 'var(--gold-accent)',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase'
                  }}>
                    {res.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setSelectedRes(res)}
                      style={{ padding: '5px 10px', fontSize: '0.75rem', borderColor: 'var(--border-color)' }}
                    >
                      Details
                    </button>
                    
                    {res.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => updateStatus(res.id, 'Confirmed')} 
                          style={{ padding: '5px 10px', fontSize: '0.75rem', background: '#4CAF50', color: 'white', border: 'none' }}
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => updateStatus(res.id, 'Cancelled')} 
                          style={{ padding: '5px 10px', fontSize: '0.75rem', background: '#ff4d4d', color: 'white', border: 'none' }}
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* --- Reservation Details Modal --- */}
      {selectedRes && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-card)', padding: '30px', borderRadius: '4px', border: '1px solid var(--gold-accent)',
            maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>Reservation Details</h3>
            
            <div style={{ marginTop: '20px', display: 'grid', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Guest Name</label>
                <div style={valueStyle}>{selectedRes.guest_name}</div>
              </div>
              <div>
                <label style={labelStyle}>Contact Information</label>
                <div style={valueStyle}>{selectedRes.guest_contact}</div>
              </div>
              <div>
                <label style={labelStyle}>Room Selection</label>
                <div style={valueStyle}>{selectedRes.rooms?.name} (Units: {selectedRes.rooms?.room_number_range})</div>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Check-In</label>
                  <div style={valueStyle}>{selectedRes.check_in_date}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Check-Out</label>
                  <div style={valueStyle}>{selectedRes.check_out_date}</div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Current Status</label>
                <div style={{ ...valueStyle, color: 'var(--gold-accent)', fontWeight: 'bold' }}>{selectedRes.status}</div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedRes(null)} 
              style={{ marginTop: '30px', width: '100%' }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Internal styles for the Modal
const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '4px'
};

const valueStyle = {
  fontSize: '1.1rem',
  color: 'var(--text-main)'
};