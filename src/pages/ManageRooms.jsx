import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // State for Adding a Room
  const [newRoom, setNewRoom] = useState({
    name: '', price_per_night: '', capacity: '', beds: '', toilets: '', description: '', room_number_range: ''
  });

  // --- NEW: State for Editing a Room ---
  const [editingRoom, setEditingRoom] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

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
    if (data && data.length > 0) {
      setNewRoom(prev => ({ ...prev, name: data[0].name }));
    }
  };

  const handleImageSelect = (e, isEdit = false) => {
    if (e.target.files && e.target.files[0]) {
      isEdit ? setEditImageFile(e.target.files[0]) : setImageFile(e.target.files[0]);
    }
  };

  // --- ADD ROOM LOGIC ---
  const addRoom = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Please upload a room image first.");
    
    setIsUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('room-images').upload(fileName, imageFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('room-images').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('rooms').insert([{
        ...newRoom,
        price_per_night: parseFloat(newRoom.price_per_night),
        capacity: parseInt(newRoom.capacity),
        beds: parseInt(newRoom.beds),
        toilets: parseInt(newRoom.toilets),
        local_image_ref: publicUrl
      }]);

      if (dbError) throw dbError;

      setNewRoom({ name: categories[0]?.name || '', price_per_night: '', capacity: '', beds: '', toilets: '', description: '', room_number_range: '' });
      setImageFile(null);
      document.getElementById('image-upload').value = '';
      fetchRooms();
      alert("Room added successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- NEW: EDIT ROOM LOGIC ---
  const updateRoom = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let imageUrl = editingRoom.local_image_ref;

      // Only upload a new image to Supabase if the admin selected one during the edit
      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('room-images').upload(fileName, editImageFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('room-images').getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      // Update the database record
      const { error: dbError } = await supabase.from('rooms').update({
        name: editingRoom.name,
        price_per_night: parseFloat(editingRoom.price_per_night),
        capacity: parseInt(editingRoom.capacity),
        beds: parseInt(editingRoom.beds),
        toilets: parseInt(editingRoom.toilets),
        description: editingRoom.description,
        room_number_range: editingRoom.room_number_range,
        local_image_ref: imageUrl
      }).eq('id', editingRoom.id);

      if (dbError) throw dbError;

      setEditingRoom(null); // Close the modal
      setEditImageFile(null); // Clear the temp image file
      fetchRooms(); // Refresh the grid
      alert("Room updated successfully!");
    } catch (error) {
      alert("Error updating room: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- TOGGLE & DELETE ---
  const toggleStatus = async (id, status) => {
    await supabase.from('rooms').update({ is_available: !status }).eq('id', id);
    fetchRooms();
  };

  const deleteRoom = async (id, roomName) => {
    if (window.confirm(`Permanently delete ${roomName}?`)) {
      await supabase.from('rooms').delete().eq('id', id);
      fetchRooms();
    }
  };

  return (
    <div style={{ paddingBottom: '50px' }}>
      
      {/* ADD ROOM FORM */}
      <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '40px' }}>
        <h2 style={{ marginTop: 0 }}>Add New Room Instance</h2>
        
        <form onSubmit={addRoom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '10px', color: 'var(--gold-accent)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Room Category</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id} type="button"
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
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label>Room Number(s) (e.g., 401-405)</label>
              <input required value={newRoom.room_number_range} onChange={e => setNewRoom({...newRoom, room_number_range: e.target.value})} placeholder="Room ID Reference" />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label>Price per Night (₱)</label>
              <input required type="number" value={newRoom.price_per_night} onChange={e => setNewRoom({...newRoom, price_per_night: e.target.value})} placeholder="0.00" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}><label>Max Guests</label><input required type="number" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} /></div>
            <div style={{ flex: 1 }}><label>Beds</label><input required type="number" value={newRoom.beds} onChange={e => setNewRoom({...newRoom, beds: e.target.value})} /></div>
            <div style={{ flex: 1 }}><label>Toilets</label><input required type="number" value={newRoom.toilets} onChange={e => setNewRoom({...newRoom, toilets: e.target.value})} /></div>
          </div>

          <div>
            <label>Room Description</label>
            <textarea style={{ width: '100%', background: 'var(--bg-dark)', color: 'white', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '4px', minHeight: '100px', fontFamily: 'inherit' }}
              value={newRoom.description} onChange={e => setNewRoom({...newRoom, description: e.target.value})} placeholder="Describe the room features..." />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px' }}>Room Gallery Image</label>
            <label htmlFor="image-upload" style={{ display: 'flex', justifyContent: 'center', padding: '30px', border: '2px dashed var(--border-color)', borderRadius: '4px', cursor: 'pointer', backgroundColor: imageFile ? 'rgba(212, 175, 55, 0.1)' : 'transparent', borderColor: imageFile ? 'var(--gold-accent)' : 'var(--border-color)' }}>
              <span style={{ color: imageFile ? 'var(--gold-accent)' : 'var(--text-muted)' }}>{imageFile ? `✅ Ready: ${imageFile.name}` : 'Click to Upload Image'}</span>
            </label>
            <input id="image-upload" type="file" accept="image/*" onChange={(e) => handleImageSelect(e, false)} style={{ display: 'none' }} />
          </div>

          <button type="submit" disabled={isUploading} style={{ padding: '15px', fontSize: '1rem' }}>
            {isUploading ? 'PROCESSING...' : 'SAVE ROOM TO SYSTEM'}
          </button>
        </form>
      </div>

      {/* SYSTEM INVENTORY LIST */}
      <h2>System Inventory</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
        {rooms.map(room => (
          <div key={room.id} className="room-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <img src={room.local_image_ref} alt={room.name} className="room-image" style={{ height: '200px' }} />
            <div className="room-details" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0 }}>{room.name}</h3>
                <span style={{ color: 'var(--gold-accent)', fontWeight: 'bold' }}>₱{room.price_per_night}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '5px 0' }}>Units: {room.room_number_range}</p>
              
              <div style={{ display: 'flex', gap: '15px', margin: '15px 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <span>👥 {room.capacity}</span><span>🛏️ {room.beds}</span><span>🚿 {room.toilets}</span>
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-muted)', flex: 1 }}>{room.description || 'No description provided.'}</p>
              
              {/* --- NEW ACTION BUTTONS INCLUDING EDIT --- */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => toggleStatus(room.id, room.is_available)} style={{ flex: 1, fontSize: '0.75rem', borderColor: room.is_available ? '#ff4444' : 'var(--border-color)', color: room.is_available ? '#ff4444' : 'var(--text-muted)' }}>
                  {room.is_available ? 'HIDE' : 'SHOW'}
                </button>
                <button onClick={() => setEditingRoom(room)} style={{ flex: 1, fontSize: '0.75rem', borderColor: 'var(--gold-accent)', color: 'var(--gold-accent)' }}>
                  EDIT
                </button>
                <button onClick={() => deleteRoom(room.id, room.name)} style={{ flex: 1, fontSize: '0.75rem', borderColor: '#8b0000', color: '#ff4d4d' }}>
                  DELETE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- NEW: EDIT ROOM MODAL --- */}
      {editingRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '4px', border: '1px solid var(--gold-accent)', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', color: 'var(--gold-accent)' }}>Edit Room: {editingRoom.name}</h3>
            
            <form onSubmit={updateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Room Number(s)</label>
                  <input required value={editingRoom.room_number_range} onChange={e => setEditingRoom({...editingRoom, room_number_range: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Price per Night (₱)</label>
                  <input required type="number" value={editingRoom.price_per_night} onChange={e => setEditingRoom({...editingRoom, price_per_night: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Capacity</label><input required type="number" value={editingRoom.capacity} onChange={e => setEditingRoom({...editingRoom, capacity: e.target.value})} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Beds</label><input required type="number" value={editingRoom.beds} onChange={e => setEditingRoom({...editingRoom, beds: e.target.value})} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toilets</label><input required type="number" value={editingRoom.toilets} onChange={e => setEditingRoom({...editingRoom, toilets: e.target.value})} /></div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description</label>
                <textarea style={{ width: '100%', background: 'var(--bg-dark)', color: 'white', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '4px', minHeight: '80px', fontFamily: 'inherit' }}
                  value={editingRoom.description} onChange={e => setEditingRoom({...editingRoom, description: e.target.value})} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Replace Image (Optional)</label>
                <label htmlFor="edit-image-upload" style={{ display: 'flex', justifyContent: 'center', padding: '15px', border: '1px dashed var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
                  <span style={{ color: editImageFile ? 'var(--gold-accent)' : 'var(--text-muted)', fontSize: '0.9rem' }}>{editImageFile ? `✅ New Image: ${editImageFile.name}` : 'Click to select a new image'}</span>
                </label>
                <input id="edit-image-upload" type="file" accept="image/*" onChange={(e) => handleImageSelect(e, true)} style={{ display: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                <button type="button" onClick={() => { setEditingRoom(null); setEditImageFile(null); }} style={{ flex: 1, borderColor: '#ff4444', color: '#ff4444' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} style={{ flex: 2, background: 'var(--gold-accent)', color: 'var(--bg-dark)' }}>
                  {isUploading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}