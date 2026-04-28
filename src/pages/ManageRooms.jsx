import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [newRoom, setNewRoom] = useState({ name: '', price_per_night: '' });
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => { 
    fetchRooms(); 
    fetchCategories();
  }, []);

  const fetchRooms = async () => {
    const { data } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
    setRooms(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('room_categories').select('*').order('created_at', { ascending: true });
    setCategories(data || []);
    // Automatically select the first category button to prevent empty submissions
    if(data && data.length > 0) {
      setNewRoom(prev => ({ ...prev, name: data[0].name }));
    }
  };

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

  const addRoom = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Please select an image file to upload.");
    if (!newRoom.name) return alert("Please select a room name category.");

    setIsUploading(true);

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('room-images').upload(fileName, imageFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('room-images').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('rooms').insert([{ 
        name: newRoom.name, 
        price_per_night: parseFloat(newRoom.price_per_night),
        local_image_ref: publicUrl
      }]);

      if (dbError) throw dbError;

      setNewRoom({ name: categories[0]?.name || '', price_per_night: '' });
      setImageFile(null);
      document.getElementById('image-upload').value = ''; 
      fetchRooms();
    } catch (error) {
      alert("Error adding room: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleStatus = async (id, status) => {
    await supabase.from('rooms').update({ is_available: !status }).eq('id', id);
    fetchRooms();
  };

  const deleteRoom = async (id, roomName) => {
    if (window.confirm(`Are you sure you want to permanently delete the ${roomName}?`)) {
      await supabase.from('rooms').delete().eq('id', id);
      fetchRooms(); 
    }
  };

  return (
    <div>
      <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '4px', marginBottom: '30px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: '0 0 20px 0' }}>Add New Room</h2>
        <form onSubmit={addRoom} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Dynamic Buttons for Room Name */}
          <div>
            <p style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Select Room Category:
            </p>
            {categories.length === 0 ? (
              <p style={{ color: '#ff4444' }}>No categories found. Please add some in the Settings page.</p>
            ) : (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setNewRoom({ ...newRoom, name: cat.name })}
                    style={{
                      backgroundColor: newRoom.name === cat.name ? 'var(--gold-accent)' : 'transparent',
                      color: newRoom.name === cat.name ? 'var(--bg-dark)' : 'var(--gold-accent)',
                      borderColor: newRoom.name === cat.name ? 'var(--gold-accent)' : 'var(--border-color)',
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ maxWidth: '300px' }}>
            <p style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Nightly Rate:
            </p>
            <input required type="number" placeholder="Price per night ($)" value={newRoom.price_per_night} onChange={e => setNewRoom({...newRoom, price_per_night: e.target.value})} />
          </div>

          <div>
            <p style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Upload Room Image:
            </p>
            <label 
              htmlFor="image-upload"
              style={{ display: 'flex', justifyContent: 'center', padding: '20px', border: '2px dashed var(--border-color)', borderRadius: '4px', cursor: 'pointer', backgroundColor: imageFile ? 'rgba(212, 175, 55, 0.1)' : 'transparent', borderColor: imageFile ? 'var(--gold-accent)' : 'var(--border-color)', transition: 'all 0.3s ease' }}
            >
              <span style={{ color: imageFile ? 'var(--gold-accent)' : 'var(--text-muted)' }}>
                {imageFile ? `✅ Selected: ${imageFile.name}` : 'Click to select an image from your device'}
              </span>
            </label>
            <input id="image-upload" type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
          </div>

          <button type="submit" disabled={isUploading} style={{ alignSelf: 'flex-start', padding: '12px 30px', opacity: isUploading ? 0.7 : 1, cursor: isUploading ? 'wait' : 'pointer' }}>
            {isUploading ? 'Uploading & Saving...' : 'Add Room'}
          </button>
        </form>
      </div>

      <h2 style={{ margin: '0 0 20px 0' }}>Current Rooms</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {rooms.map(room => {
          const imageSrc = room.local_image_ref.startsWith('http') ? room.local_image_ref : `/${room.local_image_ref}`;
          return (
            <div key={room.id} className="room-card">
              <img src={imageSrc} alt={room.name} className="room-image" onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image+Found'; }} />
              <div className="room-details">
                <h3 style={{ margin: '0 0 10px 0' }}>{room.name}</h3>
                <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>Price: <span style={{ color: 'var(--gold-accent)' }}>${room.price_per_night} / night</span></p>
                <p style={{ margin: '5px 0' }}>Status: {room.is_available ? '🟢 Available' : '🔴 Unavailable'}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                  <button onClick={() => toggleStatus(room.id, room.is_available)} style={{ borderColor: room.is_available ? '#ff4444' : 'var(--gold-accent)', color: room.is_available ? '#ff4444' : 'var(--gold-accent)' }}>
                    Mark as {room.is_available ? 'Unavailable' : 'Available'}
                  </button>
                  <button onClick={() => deleteRoom(room.id, room.name)} style={{ borderColor: '#8b0000', color: '#ff4d4d' }}>
                    Delete Room
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}