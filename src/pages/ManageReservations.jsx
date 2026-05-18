import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ManageReservations() {
  const [reservations, setReservations] = useState([]);
  const [selectedRes, setSelectedRes] = useState(null); // State for the Details Modal
  const [filterStatus, setFilterStatus] = useState('All');

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

  const confirmedCount = reservations.filter(res => res.status === 'Confirmed').length;
  const cancelledCount = reservations.filter(res => res.status === 'Cancelled').length;
  const pendingCount = reservations.filter(res => res.status === 'Pending').length;
  const filteredReservations = filterStatus === 'All'
    ? reservations
    : reservations.filter(res => res.status === filterStatus);

  const generateReport = () => {
    const rows = filteredReservations.map(res => ({
      'Guest Name': res.guest_name,
      'Room Type': res.rooms?.name || 'N/A',
      'Room Units': res.rooms?.room_number_range || 'N/A',
      'Check-In': res.check_in_date,
      'Check-Out': res.check_out_date,
      'Status': res.status,
      'Contact': res.guest_contact,
      'Created At': res.created_at || ''
    }));

    const csvHeader = Object.keys(rows[0] || {
      'Guest Name': '', 'Room Type': '', 'Room Units': '', 'Check-In': '', 'Check-Out': '', 'Status': '', 'Contact': '', 'Created At': ''
    }).join(',');
    const csvRows = rows.map(row =>
      Object.values(row)
        .map(value => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    );

    const csvContent = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reservations-report-${filterStatus.toLowerCase()}-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
    if (error) alert(error.message);
    else fetchReservations();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ margin: 0 }}>Guest Reservations</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={fetchReservations} style={{ fontSize: '0.8rem', padding: '8px 15px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
            Refresh List
          </button>
          <button onClick={generateReport} style={{ fontSize: '0.8rem', padding: '8px 15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Generate Report
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ padding: '15px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Reservations</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{reservations.length}</div>
        </div>
        <div style={{ padding: '15px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Approved Reservations</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{confirmedCount}</div>
        </div>
        <div style={{ padding: '15px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Cancelled Reservations</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{cancelledCount}</div>
        </div>
        <div style={{ padding: '15px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Pending Reservations</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{pendingCount}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {['All', 'Confirmed', 'Pending', 'Cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '9px 16px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderRadius: '999px',
              border: filterStatus === status ? '1px solid #3b82f6' : '1px solid var(--border-color)',
              background: filterStatus === status ? '#e0f2fe' : 'var(--bg-card)',
              color: filterStatus === status ? '#1d4ed8' : 'var(--text-main)'
            }}
          >
            {status === 'Confirmed' ? 'Approved' : status}
          </button>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card)', borderRadius: '8px', overflow: 'hidden' }}>
        <thead style={{ background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)' }}>
          <tr>
            <th style={{ padding: '15px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Guest Name</th>
            <th style={{ padding: '15px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Room Type</th>
            <th style={{ padding: '15px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Check-in / Out</th>
            <th style={{ padding: '15px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
            <th style={{ padding: '15px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredReservations.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                {reservations.length === 0
                  ? 'No reservations found in the system.'
                  : `No ${filterStatus === 'All' ? '' : filterStatus === 'Confirmed' ? 'approved' : filterStatus.toLowerCase()} reservations found.`}
              </td>
            </tr>
          ) : (
            filteredReservations.map(res => (
              <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '15px' }}>
                  <span style={{ fontWeight: '600' }}>{res.guest_name}</span>
                </td>
                <td style={{ padding: '15px' }}>{res.rooms?.name} <small style={{ color: 'var(--gold-accent)' }}>({res.rooms?.room_number_range})</small></td>
                <td style={{ padding: '15px' }}>
                  <div style={{ fontSize: '0.85rem' }}>{res.check_in_date}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to {res.check_out_date}</div>
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    color: res.status === 'Confirmed' ? '#4CAF50' : res.status === 'Cancelled' ? '#ff4d4d' : 'var(--gold-accent)',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    padding: '4px 8px',
                    background: res.status === 'Confirmed' ? 'rgba(76, 175, 80, 0.1)' : res.status === 'Cancelled' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                    borderRadius: '4px'
                  }}>
                    {res.status}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setSelectedRes(res)}
                      style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Details
                    </button>
                    
                    {/* Shows only when Pending */}
                    {res.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => updateStatus(res.id, 'Confirmed')} 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => updateStatus(res.id, 'Cancelled')} 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {/* NEW: Shows only when Confirmed so you can cancel it later */}
                    {res.status === 'Confirmed' && (
                       <button 
                         onClick={() => {
                           if(window.confirm(`Are you sure you want to cancel the confirmed booking for ${res.guest_name}?`)) {
                             updateStatus(res.id, 'Cancelled');
                           }
                         }} 
                         style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                       >
                         Cancel Booking
                       </button>
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
                <div style={{ ...valueStyle, color: selectedRes.status === 'Confirmed' ? '#4CAF50' : selectedRes.status === 'Cancelled' ? '#ff4d4d' : 'var(--gold-accent)', fontWeight: 'bold' }}>
                  {selectedRes.status}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedRes(null)} 
              style={{ marginTop: '30px', width: '100%', padding: '12px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
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