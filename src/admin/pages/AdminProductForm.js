import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';
import { AdminLoader } from './AdminDashboard';

const ADMIN_PATH = process.env.REACT_APP_ADMIN_SECRET_PATH || 'zainab-secure-admin-2024';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', compare_price: '',
    category_id: '', stock: 0, sku: '', sizes: [], colors: [],
    is_active: true, is_featured: false, tags: [],
    meta_title: '', meta_description: '', images: []
  });
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    supabase.from('categories').select('id,name').eq('is_active', true).then(({ data }) => {
      if (data) setCategories(data);
    });
    if (isEdit) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) setForm({ ...data, sizes: data.sizes || [], colors: data.colors || [], tags: data.tags || [], images: data.images || [] });
    setLoading(false);
  };

  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleNameChange = (e) => {
    const name = e.target.value;
    set('name', name);
    if (!isEdit) set('slug', slugify(name));
  };

  const uploadImages = async (files) => {
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('products').upload(path, file, { upsert: true });
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path);
        urls.push(publicUrl);
      }
    }
    set('images', [...form.images, ...urls]);
    setUploading(false);
    toast.success(`${urls.length} image(s) uploaded`);
  };

  const removeImage = (idx) => set('images', form.images.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      stock: parseInt(form.stock) || 0,
      slug: form.slug || slugify(form.name),
    };
    const { error } = isEdit
      ? await supabase.from('products').update(payload).eq('id', id)
      : await supabase.from('products').insert(payload);
    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success(isEdit ? 'Product updated!' : 'Product created!');
    navigate(`/${ADMIN_PATH}/products`);
  };

  if (loading) return <AdminLoader />;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <button className="admin-back-btn" onClick={() => navigate(`/${ADMIN_PATH}/products`)}>
            <ArrowLeft size={14} /> Products
          </button>
          <h1 className="admin-page-title" style={{ marginTop: 8 }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <label className="admin-toggle">
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
            <span>Active</span>
          </label>
          <label className="admin-toggle">
            <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} />
            <span>Featured</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="product-form-grid">
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Basic Info */}
            <div className="admin-card" style={{ padding: 24 }}>
              <h3 className="admin-section-title">Basic Information</h3>
              <div className="aform-group">
                <label>Product Name *</label>
                <input required value={form.name} onChange={handleNameChange} placeholder="e.g. Silk Banarasi Saree" />
              </div>
              <div className="aform-group">
                <label>URL Slug *</label>
                <input required value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="auto-generated-from-name" />
              </div>
              <div className="aform-group">
                <label>Description</label>
                <textarea rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the product..." />
              </div>
              <div className="aform-row">
                <div className="aform-group">
                  <label>Price (₹) *</label>
                  <input type="number" required min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
                </div>
                <div className="aform-group">
                  <label>Compare Price (₹)</label>
                  <input type="number" min="0" step="0.01" value={form.compare_price} onChange={e => set('compare_price', e.target.value)} placeholder="Original price" />
                </div>
              </div>
              <div className="aform-row">
                <div className="aform-group">
                  <label>Stock</label>
                  <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
                </div>
                <div className="aform-group">
                  <label>SKU</label>
                  <input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="ZB-001" />
                </div>
              </div>
              <div className="aform-group">
                <label>Category</label>
                <select value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Variants */}
            <div className="admin-card" style={{ padding: 24 }}>
              <h3 className="admin-section-title">Sizes & Colors</h3>
              <div className="aform-group">
                <label>Sizes</label>
                <div className="tag-input-row">
                  <input value={newSize} onChange={e => setNewSize(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newSize.trim()) { set('sizes', [...form.sizes, newSize.trim()]); setNewSize(''); } } }} placeholder="Type size + Enter (e.g. S, M, L, XL, Free Size)" />
                  <button type="button" className="admin-btn-sm" onClick={() => { if (newSize.trim()) { set('sizes', [...form.sizes, newSize.trim()]); setNewSize(''); } }}><Plus size={13} /></button>
                </div>
                <div className="tags-wrap">
                  {form.sizes.map((s, i) => (
                    <span key={i} className="atag">{s}<button type="button" onClick={() => set('sizes', form.sizes.filter((_, j) => j !== i))}><X size={11} /></button></span>
                  ))}
                </div>
              </div>
              <div className="aform-group">
                <label>Colors</label>
                <div className="tag-input-row">
                  <input value={newColor} onChange={e => setNewColor(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newColor.trim()) { set('colors', [...form.colors, newColor.trim()]); setNewColor(''); } } }} placeholder="Type color + Enter (e.g. Red, Blue, Gold)" />
                  <button type="button" className="admin-btn-sm" onClick={() => { if (newColor.trim()) { set('colors', [...form.colors, newColor.trim()]); setNewColor(''); } }}><Plus size={13} /></button>
                </div>
                <div className="tags-wrap">
                  {form.colors.map((c, i) => (
                    <span key={i} className="atag">{c}<button type="button" onClick={() => set('colors', form.colors.filter((_, j) => j !== i))}><X size={11} /></button></span>
                  ))}
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="admin-card" style={{ padding: 24 }}>
              <h3 className="admin-section-title">SEO (optional)</h3>
              <div className="aform-group">
                <label>Meta Title</label>
                <input value={form.meta_title} onChange={e => set('meta_title', e.target.value)} placeholder="Leave blank to use product name" />
              </div>
              <div className="aform-group">
                <label>Meta Description</label>
                <textarea rows={3} value={form.meta_description} onChange={e => set('meta_description', e.target.value)} placeholder="160 characters max" maxLength={160} />
              </div>
            </div>
          </div>

          {/* Right Column — Images */}
          <div>
            <div className="admin-card" style={{ padding: 24 }}>
              <h3 className="admin-section-title">Product Images</h3>
              <label className="image-upload-area">
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => uploadImages(Array.from(e.target.files))} />
                <Upload size={28} style={{ color: '#444', marginBottom: 10 }} />
                <div style={{ color: '#888', fontSize: '0.875rem', marginBottom: 4 }}>Click to upload images</div>
                <div style={{ color: '#444', fontSize: '0.75rem' }}>JPG, PNG, WebP — max 5MB each</div>
                {uploading && <div style={{ color: '#c8a96e', marginTop: 10, fontSize: '0.8rem' }}>Uploading...</div>}
              </label>

              {form.images.length > 0 && (
                <div className="image-preview-grid">
                  {form.images.map((url, i) => (
                    <div key={i} className="image-preview-item">
                      <img src={url} alt={`Product ${i + 1}`} />
                      {i === 0 && <span className="main-badge">Main</span>}
                      <button type="button" className="remove-img-btn" onClick={() => removeImage(i)}><X size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ color: '#444', fontSize: '0.72rem', marginTop: 12 }}>First image is shown as main image. Drag to reorder (coming soon).</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="submit" className="admin-btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" className="admin-btn-ghost" onClick={() => navigate(`/${ADMIN_PATH}/products`)}>Cancel</button>
        </div>
      </form>

      <style>{`
        .admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .admin-page-title { color: #fff; font-size: 1.4rem; font-weight: 700; margin-bottom: 2px; }
        .admin-back-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; color: #666; font-size: 0.8rem; cursor: pointer; padding: 0; }
        .admin-back-btn:hover { color: #c8a96e; }
        .admin-toggle { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; cursor: pointer; color: #888; font-size: 0.8rem; }
        .admin-toggle input { accent-color: #c8a96e; }
        .admin-toggle:has(input:checked) { border-color: #c8a96e44; color: #c8a96e; }
        .product-form-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; margin-bottom: 20px; }
        .admin-card { background: #141414; border: 1px solid #222; border-radius: 12px; }
        .admin-section-title { color: #ccc; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 18px; }
        .aform-group { margin-bottom: 16px; }
        .aform-group label { display: block; color: #777; font-size: 0.78rem; margin-bottom: 6px; }
        .aform-group input, .aform-group select, .aform-group textarea { width: 100%; padding: 9px 13px; background: #111; border: 1px solid #2a2a2a; border-radius: 8px; color: #ddd; font-size: 0.875rem; outline: none; font-family: inherit; transition: border-color 0.2s; box-sizing: border-box; }
        .aform-group input:focus, .aform-group select:focus, .aform-group textarea:focus { border-color: #c8a96e66; }
        .aform-group textarea { resize: vertical; }
        .aform-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .tag-input-row { display: flex; gap: 8px; margin-bottom: 10px; }
        .tag-input-row input { flex: 1; padding: 8px 12px; background: #111; border: 1px solid #2a2a2a; border-radius: 8px; color: #ddd; font-size: 0.82rem; outline: none; }
        .admin-btn-sm { padding: 8px 12px; background: #c8a96e; color: #fff; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; }
        .tags-wrap { display: flex; flex-wrap: wrap; gap: 7px; }
        .atag { display: flex; align-items: center; gap: 5px; padding: 4px 10px; background: #1e1e1e; border: 1px solid #333; border-radius: 20px; color: #c8a96e; font-size: 0.78rem; }
        .atag button { background: none; border: none; color: #666; cursor: pointer; display: flex; padding: 0; }
        .atag button:hover { color: #ef4444; }
        .image-upload-area { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #2a2a2a; border-radius: 10px; padding: 32px; cursor: pointer; transition: border-color 0.2s; }
        .image-upload-area:hover { border-color: #c8a96e66; }
        .image-preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 16px; }
        .image-preview-item { position: relative; aspect-ratio: 3/4; border-radius: 8px; overflow: hidden; border: 1px solid #2a2a2a; }
        .image-preview-item img { width: 100%; height: 100%; object-fit: cover; }
        .main-badge { position: absolute; top: 6px; left: 6px; background: #c8a96e; color: #fff; font-size: 0.62rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
        .remove-img-btn { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.7); border: none; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; }
        .remove-img-btn:hover { background: #ef4444; }
        .admin-btn-primary { display: flex; align-items: center; gap: 8px; padding: 11px 22px; background: #c8a96e; color: #fff; border-radius: 8px; font-size: 0.875rem; font-weight: 600; border: none; cursor: pointer; }
        .admin-btn-primary:hover { background: #b8945a; }
        .admin-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .admin-btn-ghost { padding: 11px 22px; background: #1a1a1a; color: #888; border: 1px solid #2a2a2a; border-radius: 8px; font-size: 0.875rem; cursor: pointer; }
        .admin-btn-ghost:hover { color: #ddd; border-color: #444; }
        @media (max-width: 860px) { .product-form-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
