import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ManageReservations() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    const { data, error } = await supabase.from('reservations').select('*, rooms(name)').order('created_at', { ascending: false });
    if (!error) setReservations(data);
  };

  const updateStatus = async (id, status) => {
    await supabase.from('reservations').update({ status }).eq('id', id);
    fetchReservations();
  };

  return (
    <div>
      <h2>Guest Reservations</h2>
      <table>
        <thead>
          <tr>
            <th>Guest Name</th>
            <th>Room</th>
            <th>Dates</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(res => (
            <tr key={res.id}>
              <td>{res.guest_name}<br/><small style={{color: '#666'}}>{res.guest_contact}</small></td>
              <td>{res.rooms?.name}</td>
              <td>{res.check_in_date} to {res.check_out_date}</td>
              <td><strong>{res.status}</strong></td>
              <td>
                {res.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => updateStatus(res.id, 'Confirmed')} style={{ background: '#4CAF50' }}>Confirm</button>
                    <button onClick={() => updateStatus(res.id, 'Cancelled')} style={{ background: '#f44336' }}>Decline</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}