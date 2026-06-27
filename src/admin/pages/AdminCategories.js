import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';
import { AdminLoader } from './AdminDashboard';

const EMPTY = { name: '', slug: '', description: '', image_url: '', display_order: 0, is_active: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data || []);
    setLoading(false);
  };

  const slugify = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const uploadImage = async (file) => {
    setUploading(true);
    const path = `categories/${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('general').upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('general').getPublicUrl(path);
      setForm(f => ({ ...f, image_url: publicUrl }));
      toast.success('Image uploaded');
    } else toast.error('Upload failed');
    setUploading(false);
  };

  const openEdit = (cat) => { setForm({ ...cat }); setEditId(cat.id); setShowForm(true); };
  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const close = () => { setShowForm(false); setForm(EMPTY); setEditId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Name is required'); return; }
    const payload = { ...form, slug: form.slug || slugify(form.name), display_order: parseInt(form.display_order) || 0 };
    const { error } = editId
      ? await supabase.from('categories').update(payload).eq('id', editId)
      : await supabase.from('categories').insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editId ? 'Category updated!' : 'Category created!');
    close(); load();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? Products in this category will be uncategorised.`)) return;
    await supabase.from('categories').delete().eq('id', id);
    toast.success('Category deleted');
    load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <span className="admin-page-sub">{categories.length} categories</span>
        </div>
        <button className="admin-btn-primary" onClick={openNew}><Plus size={15} /> Add Category</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 className="admin-section-title" style={{ margin: 0 }}>{editId ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={close} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSave}>
            <div className="aform-row">
              <div className="aform-group">
                <label>Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: editId ? f.slug : slugify(e.target.value) }))} placeholder="e.g. Sarees" />
              </div>
              <div className="aform-group">
                <label>Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))} placeholder="auto-from-name" />
              </div>
            </div>
            <div className="aform-row">
              <div className="aform-group">
                <label>Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
              </div>
              <div className="aform-group">
                <label>Display Order</label>
                <input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} />
              </div>
            </div>
            <div className="aform-group">
              <label>Category Image</label>
              {form.image_url && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <img src={form.image_url} alt="preview" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2a2a2a' }} />
                  <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', gap: 4, fontSize: '0.78rem', alignItems: 'center' }}><X size={13} /> Remove</button>
                </div>
              )}
              <label className="image-upload-area" style={{ padding: '16px', cursor: 'pointer' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadImage(e.target.files[0])} disabled={uploading} />
                <Upload size={18} style={{ color: '#555', marginBottom: 6 }} />
                <span style={{ color: '#666', fontSize: '0.78rem' }}>{uploading ? 'Uploading…' : 'Click to upload (circular image, 300×300px)'}</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} style={{ accentColor: '#c8a96e' }} />
                Active (visible on site)
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button type="submit" className="admin-btn-primary">Save Category</button>
              <button type="button" className="admin-btn-ghost" onClick={close}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        {loading ? <AdminLoader /> : categories.length === 0 ? (
          <div className="admin-empty">No categories yet. Add your first one!</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Category</th><th>Slug</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {c.image_url
                        ? <img src={c.image_url} alt={c.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8a96e', fontWeight: 700 }}>{c.name[0]}</div>
                      }
                      <div>
                        <div style={{ color: '#ddd', fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</div>
                        {c.description && <div style={{ color: '#555', fontSize: '0.72rem' }}>{c.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#555', fontSize: '0.78rem' }}>{c.slug}</td>
                  <td style={{ color: '#888' }}>{c.display_order}</td>
                  <td><span className="status-badge" style={{ background: c.is_active ? '#22c55e22' : '#ef444422', color: c.is_active ? '#22c55e' : '#ef4444' }}>{c.is_active ? 'Active' : 'Hidden'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="admin-icon-btn" onClick={() => openEdit(c)} title="Edit"><Edit2 size={14} /></button>
                      <button className="admin-icon-btn danger" onClick={() => handleDelete(c.id, c.name)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <CatStyle />
    </div>
  );
}

function CatStyle() {
  return <style>{`
    .admin-page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px}
    .admin-page-title{color:#fff;font-size:1.4rem;font-weight:700;margin-bottom:2px}
    .admin-page-sub{color:#555;font-size:.82rem}
    .admin-btn-primary{display:flex;align-items:center;gap:8px;padding:9px 18px;background:#c8a96e;color:#fff;border-radius:8px;font-size:.82rem;font-weight:600;border:none;cursor:pointer}
    .admin-btn-primary:hover{background:#b8945a}
    .admin-btn-ghost{padding:9px 18px;background:#1a1a1a;color:#888;border:1px solid #2a2a2a;border-radius:8px;font-size:.82rem;cursor:pointer}
    .admin-card{background:#141414;border:1px solid #222;border-radius:12px;overflow:hidden}
    .admin-section-title{color:#ccc;font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:18px}
    .aform-group{margin-bottom:14px}
    .aform-group label{display:block;color:#777;font-size:.78rem;margin-bottom:6px}
    .aform-group input{width:100%;padding:9px 13px;background:#111;border:1px solid #2a2a2a;border-radius:8px;color:#ddd;font-size:.875rem;outline:none;box-sizing:border-box}
    .aform-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .image-upload-area{display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed #2a2a2a;border-radius:10px;padding:28px;cursor:pointer;transition:border-color .2s}
    .image-upload-area:hover{border-color:#c8a96e66}
    .admin-empty{padding:40px;text-align:center;color:#444;font-size:.875rem}
    .admin-table{width:100%;border-collapse:collapse;font-size:.82rem}
    .admin-table th{padding:10px 16px;text-align:left;color:#555;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #1e1e1e;background:#111}
    .admin-table td{padding:12px 16px;color:#bbb;border-bottom:1px solid #1a1a1a}
    .admin-table tr:last-child td{border-bottom:none}
    .admin-table tr:hover td{background:#161616}
    .status-badge{padding:3px 10px;border-radius:20px;font-size:.7rem;font-weight:600}
    .admin-icon-btn{width:30px;height:30px;border-radius:6px;border:1px solid #2a2a2a;background:#1a1a1a;color:#888;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
    .admin-icon-btn:hover{background:#222;color:#ddd}
    .admin-icon-btn.danger:hover{background:#2a1010;color:#ef4444;border-color:#ef444444}
  `}</style>;
}
