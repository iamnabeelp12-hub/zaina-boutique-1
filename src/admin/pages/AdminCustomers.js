import React, { useEffect, useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { AdminLoader } from './AdminDashboard';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  };

  const viewCustomer = async (c) => {
    setSelected(c);
    const { data } = await supabase.from('orders').select('*').eq('customer_id', c.id).order('created_at', { ascending: false });
    setCustomerOrders(data || []);
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const totalSpent = (cid) => {
    const ords = customerOrders.filter(o => o.customer_id === cid && o.status !== 'cancelled');
    return ords.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers</h1>
          <span className="admin-page-sub">{customers.length} registered customers</span>
        </div>
      </div>

      <div className="orders-layout">
        <div className="admin-card">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e1e1e' }}>
            <div className="admin-search">
              <Search size={15} />
              <input placeholder="Search by name, email, or phone..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          {loading ? <AdminLoader /> : filtered.length === 0 ? (
            <div className="admin-empty">No customers found</div>
          ) : (
            <table className="admin-table">
              <thead><tr><th>Customer</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#c8a96e22', border: '1px solid #c8a96e44', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8a96e', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: '#ddd', fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</div>
                          <div style={{ color: '#555', fontSize: '0.72rem' }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#888', fontSize: '0.82rem' }}>{c.phone || '—'}</td>
                    <td style={{ color: '#555', fontSize: '0.78rem' }}>{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <button className="admin-icon-btn" onClick={() => viewCustomer(c)} title="View details"><Eye size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div className="order-detail-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontWeight: 700 }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div className="detail-section">
              <div className="detail-label">Contact</div>
              <div className="detail-value">{selected.email || '—'}</div>
              <div className="detail-sub">{selected.phone || 'No phone'}</div>
              <div className="detail-sub">Member since {new Date(selected.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
            </div>
            <div className="detail-section">
              <div className="detail-label">Order History ({customerOrders.length})</div>
              {customerOrders.length === 0 ? (
                <div style={{ color: '#444', fontSize: '0.82rem' }}>No orders yet</div>
              ) : customerOrders.map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e1e1e' }}>
                  <div>
                    <div style={{ color: '#c8a96e', fontSize: '0.8rem', fontWeight: 600 }}>#{o.order_number}</div>
                    <div style={{ color: '#555', fontSize: '0.72rem' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ddd', fontWeight: 600, fontSize: '0.82rem' }}>₹{parseFloat(o.total).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.7rem', color: '#555' }}>{o.status}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}?text=Hi ${selected.name}, thank you for shopping at Zaina Boutique!`}
                  target="_blank" rel="noopener noreferrer"
                  className="admin-btn-primary" style={{ fontSize: '0.78rem', padding: '8px 14px', textDecoration: 'none' }}>
                  💬 WhatsApp
                </a>
              )}
              {selected.email && (
                <a href={`mailto:${selected.email}`} className="admin-btn-ghost" style={{ fontSize: '0.78rem', padding: '8px 14px', textDecoration: 'none' }}>
                  ✉ Email
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px}
        .admin-page-title{color:#fff;font-size:1.4rem;font-weight:700;margin-bottom:2px}
        .admin-page-sub{color:#555;font-size:.82rem}
        .orders-layout{display:grid;grid-template-columns:1fr 300px;gap:16px;align-items:start}
        .admin-card{background:#141414;border:1px solid #222;border-radius:12px;overflow:hidden}
        .admin-search{display:flex;align-items:center;gap:10px;background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:8px 14px}
        .admin-search input{background:none;border:none;color:#ddd;font-size:.875rem;outline:none;width:100%}
        .admin-search input::placeholder{color:#444}
        .admin-empty{padding:40px;text-align:center;color:#444;font-size:.875rem}
        .admin-table{width:100%;border-collapse:collapse;font-size:.82rem}
        .admin-table th{padding:10px 14px;text-align:left;color:#555;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #1e1e1e;background:#111}
        .admin-table td{padding:12px 14px;color:#bbb;border-bottom:1px solid #1a1a1a}
        .admin-table tr:last-child td{border-bottom:none}
        .admin-table tr:hover td{background:#161616}
        .admin-icon-btn{width:30px;height:30px;border-radius:6px;border:1px solid #2a2a2a;background:#1a1a1a;color:#888;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
        .admin-icon-btn:hover{background:#222;color:#ddd}
        .order-detail-panel{background:#141414;border:1px solid #222;border-radius:12px;padding:20px;position:sticky;top:80px}
        .detail-section{margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #1e1e1e}
        .detail-label{color:#555;font-size:.7rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
        .detail-value{color:#ddd;font-size:.875rem;font-weight:500}
        .detail-sub{color:#666;font-size:.78rem;margin-top:3px}
        .admin-btn-primary{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;background:#c8a96e;color:#fff;border-radius:8px;font-size:.82rem;font-weight:600;border:none;cursor:pointer}
        .admin-btn-primary:hover{background:#b8945a}
        .admin-btn-ghost{display:inline-flex;align-items:center;padding:9px 16px;background:#1a1a1a;color:#888;border:1px solid #2a2a2a;border-radius:8px;font-size:.82rem;cursor:pointer}
        @media(max-width:900px){.orders-layout{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
