import React from 'react';

export default function AboutUs() {
  const team = [
    { name: 'Renhiel Maghanoy', role: 'BSIT 3rd Year Student' },
    { name: 'Janna Sumalpong', role: 'CEO' },
    { name: 'Erika Jhong Imperio', role: 'BSIT 3rd Year Student' },
    { name: 'Merryl Ignacio', role: 'BSIT 3rd Year Student' }
  ];

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Villa Gianna d'Oro Hotel</h1>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
        Welcome to a world of unparalleled luxury and refined elegance. Established with a vision to redefine hospitality, 
        our hotel offers a sanctuary of comfort away from the bustling city. 
      </p>
      
      <div style={{ marginTop: '50px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--bg-card)', padding: '20px', border: '1px solid var(--border-color)', flex: '1 1 300px' }}>
          <h3 style={{ color: 'var(--gold-accent)' }}>Our Vision</h3>
          <p style={{ color: 'var(--text-muted)' }}>To be the ultimate destination for those seeking tranquility, exceptional service, and timeless design.</p>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '20px', border: '1px solid var(--border-color)', flex: '1 1 300px' }}>
          <h3 style={{ color: 'var(--gold-accent)' }}>Our Promise</h3>
          <p style={{ color: 'var(--text-muted)' }}>Every guest is treated as royalty. From seamless reservations to personalized room service, we guarantee excellence.</p>
        </div>
      </div>

      {/* --- New Team Section --- */}
      <div style={{ marginTop: '70px', paddingBottom: '40px' }}>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '40px' }}>Meet Our Core Team</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {team.map((member, index) => (
            <div key={index} style={{ 
              background: 'var(--bg-card)', 
              padding: '25px 20px', 
              border: '1px solid var(--border-color)', 
              borderRadius: '4px',
              minWidth: '220px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              transition: 'transform 0.3s ease'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: 'var(--text-main)', fontFamily: 'Montserrat, sans-serif' }}>
                {member.name}
              </h4>
              <p style={{ margin: 0, color: 'var(--gold-accent)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '500' }}>
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}