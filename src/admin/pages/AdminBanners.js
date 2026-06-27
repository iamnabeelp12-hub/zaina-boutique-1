import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, Eye, EyeOff, GripVertical } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';
import { AdminLoader } from './AdminDashboard';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', link: '', button_text: 'Shop Now', type: 'hero', display_order: 0 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    setLoading(true);
    const { data } = await supabase.from('banners').select('*').order('type').order('display_order');
    setBanners(data || []);
    setLoading(false);
  };

  const uploadAndCreate = async (file) => {
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `banners/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('banners').upload(path, file, { upsert: true });
    if (upErr) { toast.error('Upload failed'); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(path);
    const { error } = await supabase.from('banners').insert({ ...form, image_url: publicUrl, display_order: parseInt(form.display_order) || 0 });
    if (!error) { toast.success('Banner added!'); loadBanners(); setShowForm(false); setForm({ title: '', subtitle: '', link: '', button_text: 'Shop Now', type: 'hero', display_order: 0 }); }
    else toast.error('Failed to save banner');
    setUploading(false);
  };

  const toggleBanner = async (id, current) => {
    await supabase.from('banners').update({ is_active: !current }).eq('id', id);
    setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !current } : b));
    toast.success(current ? 'Banner hidden' : 'Banner shown');
  };

  const deleteBanner = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    await supabase.from('banners').delete().eq('id', id);
    toast.success('Banner deleted');
    loadBanners();
  };

  const heroBanners = banners.filter(b => b.type === 'hero');
  const offerBanners = banners.filter(b => b.type === 'offer');

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Banners</h1>
          <span className="admin-page-sub">Manage hero sliders and offer banners</span>
        </div>
        <button className="admin-btn-primary" onClick={() => setShowForm(o => !o)}><Plus size={15} /> Add Banner</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 className="admin-section-title">New Banner</h3>
          <div className="aform-row">
            <div className="aform-group">
              <label>Banner Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="hero">Hero Slider (Full width top)</option>
                <option value="offer">Offer Banner (Section)</option>
              </select>
            </div>
            <div className="aform-group">
              <label>Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} />
            </div>
          </div>
          <div className="aform-row">
            <div className="aform-group">
              <label>Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. New Arrivals 2024" />
            </div>
            <div className="aform-group">
              <label>Subtitle</label>
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Short tagline" />
            </div>
          </div>
          <div className="aform-row">
            <div className="aform-group">
              <label>Link (where button goes)</label>
              <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="/products or /category/sarees" />
            </div>
            <div className="aform-group">
              <label>Button Text</label>
              <input value={form.button_text} onChange={e => setForm(f => ({ ...f, button_text: e.target.value }))} placeholder="Shop Now" />
            </div>
          </div>
          <div className="aform-group">
            <label>Banner Image *</label>
            <label className="image-upload-area" style={{ maxWidth: 400, cursor: 'pointer' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadAndCreate(e.target.files[0])} disabled={uploading} />
              <Upload size={24} style={{ color: '#c8a96e', marginBottom: 8 }} />
              <div style={{ color: '#888', fontSize: '0.875rem' }}>{uploading ? 'Uploading & saving...' : 'Click to upload image and save banner'}</div>
              <div style={{ color: '#444', fontSize: '0.75rem', marginTop: 4 }}>Recommended: Hero 1920×800px, Offer 800×400px</div>
            </label>
          </div>
          <button className="admin-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      {loading ? <AdminLoader /> : (
        <>
          {/* Hero Banners */}
          <div className="admin-card" style={{ marginBottom: 20 }}>
            <div className="admin-card-header">
              <h2 className="admin-card-title">🖼 Hero Banners ({heroBanners.length})</h2>
            </div>
            {heroBanners.length === 0 ? (
              <div className="admin-empty">No hero banners yet. Add one above.</div>
            ) : (
              <div className="banner-list">
                {heroBanners.map(b => (
                  <div key={b.id} className="banner-item">
                    <div className="banner-thumb">
                      <img src={b.image_url} alt={b.title || 'Banner'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#ddd', fontWeight: 600, fontSize: '0.9rem' }}>{b.title || <span style={{ color: '#444' }}>No title</span>}</div>
                      {b.subtitle && <div style={{ color: '#666', fontSize: '0.78rem', marginTop: 2 }}>{b.subtitle}</div>}
                      {b.link && <div style={{ color: '#c8a96e', fontSize: '0.75rem', marginTop: 4 }}>→ {b.link}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="status-badge" style={{ background: b.is_active ? '#22c55e22' : '#ef444422', color: b.is_active ? '#22c55e' : '#ef4444' }}>
                        {b.is_active ? 'Visible' : 'Hidden'}
                      </span>
                      <button className="admin-icon-btn" onClick={() => toggleBanner(b.id, b.is_active)} title={b.is_active ? 'Hide' : 'Show'}>
                        {b.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button className="admin-icon-btn danger" onClick={() => deleteBanner(b.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Offer Banners */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">🏷 Offer Banners ({offerBanners.length})</h2>
            </div>
            {offerBanners.length === 0 ? (
              <div className="admin-empty">No offer banners yet.</div>
            ) : (
              <div className="banner-list">
                {offerBanners.map(b => (
                  <div key={b.id} className="banner-item">
                    <div className="banner-thumb offer-thumb">
                      <img src={b.image_url} alt={b.title || 'Offer'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#ddd', fontWeight: 600, fontSize: '0.9rem' }}>{b.title || <span style={{ color: '#444' }}>No title</span>}</div>
                      {b.subtitle && <div style={{ color: '#666', fontSize: '0.78rem', marginTop: 2 }}>{b.subtitle}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="admin-icon-btn" onClick={() => toggleBanner(b.id, b.is_active)}>
                        {b.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button className="admin-icon-btn danger" onClick={() => deleteBanner(b.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        .admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .admin-page-title { color: #fff; font-size: 1.4rem; font-weight: 700; margin-bottom: 2px; }
        .admin-page-sub { color: #555; font-size: 0.82rem; }
        .admin-btn-primary { display: flex; align-items: center; gap: 8px; padding: 9px 18px; background: #c8a96e; color: #fff; border-radius: 8px; font-size: 0.82rem; font-weight: 600; border: none; cursor: pointer; }
        .admin-btn-primary:hover { background: #b8945a; }
        .admin-btn-ghost { padding: 9px 18px; background: #1a1a1a; color: #888; border: 1px solid #2a2a2a; border-radius: 8px; font-size: 0.82rem; cursor: pointer; }
        .admin-card { background: #141414; border: 1px solid #222; border-radius: 12px; overflow: hidden; }
        .admin-card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #1e1e1e; }
        .admin-card-title { color: #ccc; font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .admin-empty { padding: 40px; text-align: center; color: #444; font-size: 0.875rem; }
        .admin-section-title { color: #ccc; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 18px; }
        .aform-group { margin-bottom: 14px; }
        .aform-group label { display: block; color: #777; font-size: 0.78rem; margin-bottom: 6px; }
        .aform-group input, .aform-group select { width: 100%; padding: 9px 13px; background: #111; border: 1px solid #2a2a2a; border-radius: 8px; color: #ddd; font-size: 0.875rem; outline: none; box-sizing: border-box; }
        .aform-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .image-upload-area { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #2a2a2a; border-radius: 10px; padding: 28px; cursor: pointer; transition: border-color 0.2s; }
        .image-upload-area:hover { border-color: #c8a96e66; }
        .banner-list { display: flex; flex-direction: column; }
        .banner-item { display: flex; align-items: center; gap: 16px; padding: 14px 20px; border-bottom: 1px solid #1a1a1a; }
        .banner-item:last-child { border-bottom: none; }
        .banner-thumb { width: 120px; height: 60px; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: #1a1a1a; }
        .offer-thumb { width: 100px; height: 60px; }
        .banner-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
        .admin-icon-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #2a2a2a; background: #1a1a1a; color: #888; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
        .admin-icon-btn:hover { background: #222; color: #ddd; }
        .admin-icon-btn.danger:hover { background: #2a1010; color: #ef4444; border-color: #ef444444; }
      `}</style>
    </div>
  );
}
