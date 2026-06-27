import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';
import { AdminLoader } from './AdminDashboard';

const ADMIN_PATH = process.env.REACT_APP_ADMIN_SECRET_PATH || 'zainab-secure-admin-2024';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const toggleActive = async (id, current) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
    toast.success(current ? 'Product hidden' : 'Product visible');
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) { toast.success('Product deleted'); loadProducts(); }
    else toast.error('Failed to delete');
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <span className="admin-page-sub">{products.length} total products</span>
        </div>
        <Link to={`/${ADMIN_PATH}/products/new`} className="admin-btn-primary"><Plus size={15} /> Add Product</Link>
      </div>

      <div className="admin-card">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e1e1e' }}>
          <div className="admin-search">
            <Search size={15} />
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? <AdminLoader /> : filtered.length === 0 ? (
          <div className="admin-empty">{search ? 'No products found' : 'No products yet. Add your first product!'}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 52, borderRadius: 6, overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
                        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👗</div>}
                      </div>
                      <div>
                        <div style={{ color: '#ddd', fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                        <div style={{ color: '#555', fontSize: '0.72rem', marginTop: 2 }}>/{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.categories?.name || <span style={{ color: '#444' }}>—</span>}</td>
                  <td>
                    <div style={{ color: '#c8a96e', fontWeight: 600 }}>₹{p.price?.toLocaleString('en-IN')}</div>
                    {p.compare_price && <div style={{ color: '#444', fontSize: '0.72rem', textDecoration: 'line-through' }}>₹{p.compare_price?.toLocaleString('en-IN')}</div>}
                  </td>
                  <td style={{ color: p.stock > 0 ? '#22c55e' : '#ef4444' }}>{p.stock}</td>
                  <td>
                    <span className="status-badge" style={{ background: p.is_active ? '#22c55e22' : '#ef444422', color: p.is_active ? '#22c55e' : '#ef4444' }}>
                      {p.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="admin-icon-btn" onClick={() => toggleActive(p.id, p.is_active)} title={p.is_active ? 'Hide' : 'Show'}>
                        {p.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <Link to={`/${ADMIN_PATH}/products/edit/${p.id}`} className="admin-icon-btn" title="Edit"><Edit2 size={14} /></Link>
                      <button className="admin-icon-btn danger" onClick={() => deleteProduct(p.id, p.name)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <AdminProductsStyle />
    </div>
  );
}

function AdminProductsStyle() {
  return <style>{`
    .admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .admin-page-title { color: #fff; font-size: 1.4rem; font-weight: 700; margin-bottom: 2px; }
    .admin-page-sub { color: #555; font-size: 0.82rem; }
    .admin-btn-primary { display: flex; align-items: center; gap: 8px; padding: 9px 18px; background: #c8a96e; color: #fff; border-radius: 8px; font-size: 0.82rem; font-weight: 600; text-decoration: none; border: none; cursor: pointer; transition: background 0.2s; }
    .admin-btn-primary:hover { background: #b8945a; }
    .admin-search { display: flex; align-items: center; gap: 10px; background: #111; border: 1px solid #2a2a2a; border-radius: 8px; padding: 8px 14px; max-width: 360px; }
    .admin-search input { background: none; border: none; color: #ddd; font-size: 0.875rem; outline: none; width: 100%; }
    .admin-search input::placeholder { color: #444; }
    .admin-icon-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #2a2a2a; background: #1a1a1a; color: #888; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
    .admin-icon-btn:hover { background: #222; color: #ddd; border-color: #444; }
    .admin-icon-btn.danger:hover { background: #2a1010; color: #ef4444; border-color: #ef444444; }
  `}</style>;
}
