import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function WalkInBooking() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State matching ManageReservations exactly
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  
  // Default dates: Check-in today, Check-out tomorrow
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
  
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  const fetchAvailableRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_available', true)
      .order('price_per_night', { ascending: true });
    
    if (error) {
      console.error("Error fetching rooms:", error.message);
    } else {
      setRooms(data || []);
      if (data && data.length > 0) {
        setSelectedRoomId(data[0].id);
      }
    }
  };

  const handleWalkInBooking = async (e) => {
    e.preventDefault();
    
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      return alert("Check-out date must be after check-in date.");
    }

    setIsLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Inserting exact fields expected by ManageReservations
      const { error: insertError } = await supabase.from('reservations').insert([{
        room_id: selectedRoomId,
        user_id: user.id, 
        guest_name: guestName,
        guest_contact: guestContact,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        status: 'Confirmed' // Matches the green status in your modal
      }]);

      if (insertError) throw insertError;

      setGuestName('');
      setGuestContact('');
      setCheckInDate(today);
      setCheckOutDate(tomorrow);
      alert("Walk-in reservation confirmed successfully!");

    } catch (error) {
      alert("Error processing booking: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '50px', width: '100%' }}>
      <h2 style={{ color: 'var(--gold-accent)', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginTop: 0 }}>
        Walk-In Booking
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
        Create an immediate, confirmed reservation for a guest at the front desk.
      </p>

      <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '4px', border: '1px solid var(--border-color)', maxWidth: '800px' }}>
        <form onSubmit={handleWalkInBooking} style={{ display: 'grid', gap: '20px' }}>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={labelStyle}>Guest Name</label>
              <input 
                required 
                value={guestName} 
                onChange={e => setGuestName(e.target.value)} 
                placeholder="e.g., John Doe" 
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={labelStyle}>Contact Information</label>
              <input 
                required 
                value={guestContact} 
                onChange={e => setGuestContact(e.target.value)} 
                placeholder="Email or Phone Number" 
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Room Selection</label>
            <select 
              required 
              value={selectedRoomId} 
              onChange={e => setSelectedRoomId(e.target.value)}
              style={{ ...inputStyle, appearance: 'auto' }}
            >
              {rooms.length === 0 ? (
                <option disabled value="">No available rooms found</option>
              ) : (
                rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} (Units: {room.room_number_range}) - ₱{room.price_per_night} / night
                  </option>
                ))
              )}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Check-In</label>
              <input 
                required 
                type="date" 
                value={checkInDate} 
                onChange={e => setCheckInDate(e.target.value)} 
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Check-Out</label>
              <input 
                required 
                type="date" 
                value={checkOutDate} 
                onChange={e => setCheckOutDate(e.target.value)} 
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '10px' }}>
             <label style={labelStyle}>Current Status</label>
             <div style={{ fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', textTransform: 'uppercase' }}>
               CONFIRMED (Walk-In)
             </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || rooms.length === 0} 
            style={{ 
              marginTop: '20px', 
              padding: '15px', 
              fontSize: '1rem', 
              background: 'var(--gold-accent)', 
              color: 'var(--bg-dark)', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold',
              cursor: (isLoading || rooms.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || rooms.length === 0) ? 0.7 : 1
            }}
          >
            {isLoading ? 'PROCESSING...' : 'CONFIRM WALK-IN BOOKING'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Internal styles matching ManageReservations.jsx
const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '8px'
};

const inputStyle = {
  width: '100%', 
  padding: '12px', 
  background: 'var(--bg-dark)', 
  color: 'var(--text-main)', 
  border: '1px solid var(--border-color)', 
  borderRadius: '4px',
  boxSizing: 'border-box'
};