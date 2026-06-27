import React, { useEffect, useState } from 'react';
import { Eye, MessageCircle, ChevronDown } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';
import { AdminLoader } from './AdminDashboard';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = { pending: '#f59e0b', confirmed: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadOrders(); }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selected?.id === id) setSelected(o => ({ ...o, status }));
      toast.success(`Order marked as ${status}`);
    }
  };

  const openWhatsApp = (order) => {
    const msg = `Hi ${order.customer_name}, your Zaina Boutique order #${order.order_number} status has been updated to: *${order.status.toUpperCase()}*. Thank you for shopping with us! 🌸`;
    window.open(`https://wa.me/${order.customer_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filtered = orders;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <span className="admin-page-sub">{orders.length} orders</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="order-tabs">
        {['all', ...STATUSES].map(s => (
          <button key={s} className={`order-tab${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? 'All Orders' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="orders-layout">
        {/* List */}
        <div className="admin-card">
          {loading ? <AdminLoader /> : filtered.length === 0 ? (
            <div className="admin-empty">No orders found</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(o)}>
                    <td><span style={{ fontWeight: 700, color: '#c8a96e' }}>#{o.order_number}</span></td>
                    <td>
                      <div style={{ color: '#ddd', fontSize: '0.875rem' }}>{o.customer_name}</div>
                      <div style={{ color: '#555', fontSize: '0.72rem' }}>{o.customer_phone}</div>
                    </td>
                    <td style={{ fontWeight: 600, color: '#ddd' }}>₹{parseFloat(o.total).toLocaleString('en-IN')}</td>
                    <td>
                      <select
                        value={o.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => { e.stopPropagation(); updateStatus(o.id, e.target.value); }}
                        className="status-select"
                        style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status], borderColor: STATUS_COLORS[o.status] + '44' }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td style={{ color: '#555', fontSize: '0.78rem' }}>{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button className="admin-icon-btn" onClick={() => setSelected(o)} title="View Details"><Eye size={14} /></button>
                        <button className="admin-icon-btn" onClick={() => openWhatsApp(o)} title="Message on WhatsApp" style={{ color: '#25d366' }}><MessageCircle size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="order-detail-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontWeight: 700 }}>#{selected.order_number}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            {/* Status */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#666', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Status</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)}
                    style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${STATUS_COLORS[s]}44`, background: selected.status === s ? STATUS_COLORS[s] + '33' : 'transparent', color: STATUS_COLORS[s], fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer */}
            <div className="detail-section">
              <div className="detail-label">Customer</div>
              <div className="detail-value">{selected.customer_name}</div>
              {selected.customer_email && <div className="detail-sub">{selected.customer_email}</div>}
              <div className="detail-sub">{selected.customer_phone}</div>
            </div>

            {/* Address */}
            {selected.shipping_address && Object.keys(selected.shipping_address).length > 0 && (
              <div className="detail-section">
                <div className="detail-label">Delivery Address</div>
                <div className="detail-value" style={{ fontSize: '0.82rem', lineHeight: 1.7 }}>
                  {selected.shipping_address.address_line1}<br />
                  {selected.shipping_address.address_line2 && <>{selected.shipping_address.address_line2}<br /></>}
                  {selected.shipping_address.city}, {selected.shipping_address.state} — {selected.shipping_address.pincode}
                </div>
                {selected.shipping_address.latitude && (
                  <a href={`https://maps.google.com/?q=${selected.shipping_address.latitude},${selected.shipping_address.longitude}`} target="_blank" rel="noopener noreferrer" style={{ color: '#c8a96e', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    📍 View on Map
                  </a>
                )}
              </div>
            )}

            {/* Items */}
            <div className="detail-section">
              <div className="detail-label">Items</div>
              {selected.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                  {item.image && <img src={item.image} alt={item.name} style={{ width: 40, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #2a2a2a' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#ddd', fontSize: '0.82rem', fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: '#555', fontSize: '0.72rem' }}>Qty: {item.qty}{item.size ? ` · ${item.size}` : ''}{item.color ? ` · ${item.color}` : ''}</div>
                  </div>
                  <div style={{ color: '#c8a96e', fontWeight: 600, fontSize: '0.82rem' }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="detail-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: 6 }}>
                <span>Subtotal</span><span>₹{parseFloat(selected.subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: 6 }}>
                <span>Shipping</span><span>₹{parseFloat(selected.shipping_charge || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#fff', borderTop: '1px solid #222', paddingTop: 8 }}>
                <span>Total</span><span style={{ color: '#c8a96e' }}>₹{parseFloat(selected.total).toLocaleString('en-IN')}</span>
              </div>
              {selected.referral_code && <div style={{ color: '#8b5cf6', fontSize: '0.72rem', marginTop: 8 }}>🔗 Referral: {selected.referral_code}</div>}
            </div>

            <button className="admin-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => openWhatsApp(selected)}>
              <MessageCircle size={15} /> Send WhatsApp Update
            </button>
          </div>
        )}
      </div>

      <style>{`
        .admin-page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;flex-wrap:wrap;gap:12px}
        .admin-page-title{color:#fff;font-size:1.4rem;font-weight:700;margin-bottom:2px}
        .admin-page-sub{color:#555;font-size:.82rem}
        .order-tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:20px}
        .order-tab{padding:7px 14px;border-radius:20px;border:1px solid #2a2a2a;background:#141414;color:#666;font-size:.78rem;cursor:pointer;transition:all .15s}
        .order-tab.active{background:#c8a96e22;border-color:#c8a96e44;color:#c8a96e}
        .orders-layout{display:grid;grid-template-columns:1fr 320px;gap:16px;align-items:start}
        .admin-card{background:#141414;border:1px solid #222;border-radius:12px;overflow:hidden}
        .admin-empty{padding:40px;text-align:center;color:#444;font-size:.875rem}
        .admin-table{width:100%;border-collapse:collapse;font-size:.82rem}
        .admin-table th{padding:10px 14px;text-align:left;color:#555;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #1e1e1e;background:#111}
        .admin-table td{padding:11px 14px;color:#bbb;border-bottom:1px solid #1a1a1a}
        .admin-table tr:last-child td{border-bottom:none}
        .admin-table tr:hover td{background:#161616}
        .status-select{padding:4px 10px;border-radius:20px;font-size:.72rem;font-weight:600;cursor:pointer;outline:none;border-width:1.5px;border-style:solid}
        .order-detail-panel{background:#141414;border:1px solid #222;border-radius:12px;padding:20px;position:sticky;top:80px}
        .detail-section{margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid #1e1e1e}
        .detail-section:last-of-type{border-bottom:none}
        .detail-label{color:#555;font-size:.7rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
        .detail-value{color:#ddd;font-size:.875rem;font-weight:500}
        .detail-sub{color:#666;font-size:.78rem;margin-top:3px}
        .admin-icon-btn{width:30px;height:30px;border-radius:6px;border:1px solid #2a2a2a;background:#1a1a1a;color:#888;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
        .admin-icon-btn:hover{background:#222;color:#ddd}
        .admin-btn-primary{display:flex;align-items:center;gap:8px;padding:10px 18px;background:#c8a96e;color:#fff;border-radius:8px;font-size:.82rem;font-weight:600;border:none;cursor:pointer;margin-top:16px}
        .admin-btn-primary:hover{background:#b8945a}
        @media(max-width:900px){.orders-layout{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
