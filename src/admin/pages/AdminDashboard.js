import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, Users, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const ADMIN_PATH = process.env.REACT_APP_ADMIN_SECRET_PATH || 'zainab-secure-admin-2024';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, products: 0, customers: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ count: orders }, { count: products }, { count: customers }, { data: orderData }, { data: recent }] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total').neq('status', 'cancelled'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(6),
      ]);
      const revenue = orderData?.reduce((s, o) => s + parseFloat(o.total || 0), 0) || 0;
      setStats({ orders: orders || 0, products: products || 0, customers: customers || 0, revenue });
      setRecentOrders(recent || []);
      setLoading(false);
    };
    load();
  }, []);

  const STATUS_COLORS = { pending: '#f59e0b', confirmed: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444' };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <span className="admin-page-sub">Welcome back — here's what's happening.</span>
      </div>

      {loading ? <AdminLoader /> : (
        <>
          {/* Stats */}
          <div className="dash-stats">
            {[
              { label: 'Total Orders', value: stats.orders, icon: <ShoppingCart size={20} />, color: '#3b82f6', link: 'orders' },
              { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: <TrendingUp size={20} />, color: '#22c55e', link: 'orders' },
              { label: 'Products', value: stats.products, icon: <Package size={20} />, color: '#c8a96e', link: 'products' },
              { label: 'Customers', value: stats.customers, icon: <Users size={20} />, color: '#8b5cf6', link: 'customers' },
            ].map((s, i) => (
              <Link key={i} to={`/${ADMIN_PATH}/${s.link}`} className="dash-stat-card">
                <div className="dash-stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
                <div className="dash-stat-value">{s.value}</div>
                <div className="dash-stat-label">{s.label}</div>
              </Link>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title"><Clock size={16} /> Recent Orders</h2>
              <Link to={`/${ADMIN_PATH}/orders`} className="admin-link">View All <ArrowRight size={13} /></Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="admin-empty">No orders yet</div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td><span style={{ fontWeight: 600, color: '#c8a96e' }}>#{o.order_number}</span></td>
                      <td>{o.customer_name}</td>
                      <td>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                      <td style={{ fontWeight: 600 }}>₹{parseFloat(o.total).toLocaleString('en-IN')}</td>
                      <td><span className="status-badge" style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status] }}>{o.status}</span></td>
                      <td style={{ color: '#666', fontSize: '0.78rem' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick Links */}
          <div className="quick-links">
            {[
              { to: `/${ADMIN_PATH}/products/new`, label: '+ Add Product' },
              { to: `/${ADMIN_PATH}/banners`, label: '+ Upload Banner' },
              { to: `/${ADMIN_PATH}/categories`, label: '+ Add Category' },
              { to: `/${ADMIN_PATH}/customize`, label: '🎨 Customize Site' },
            ].map((l, i) => (
              <Link key={i} to={l.to} className="quick-link-btn">{l.label}</Link>
            ))}
          </div>
        </>
      )}

      <AdminDashStyle />
    </div>
  );
}

export function AdminLoader() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div style={{ width: 36, height: 36, border: '3px solid #222', borderTopColor: '#c8a96e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;
}

function AdminDashStyle() {
  return <style>{`
    .admin-page-header { margin-bottom: 28px; }
    .admin-page-title { color: #fff; font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; }
    .admin-page-sub { color: #555; font-size: 0.82rem; }
    .dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .dash-stat-card { background: #141414; border: 1px solid #222; border-radius: 12px; padding: 20px; text-decoration: none; display: flex; flex-direction: column; gap: 8px; transition: border-color 0.2s; }
    .dash-stat-card:hover { border-color: #c8a96e44; }
    .dash-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .dash-stat-value { font-size: 1.5rem; font-weight: 700; color: #fff; }
    .dash-stat-label { font-size: 0.78rem; color: #555; }
    .admin-card { background: #141414; border: 1px solid #222; border-radius: 12px; margin-bottom: 20px; overflow: hidden; }
    .admin-card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #1e1e1e; }
    .admin-card-title { color: #ccc; font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .admin-link { color: #c8a96e; font-size: 0.78rem; display: flex; align-items: center; gap: 4px; text-decoration: none; }
    .admin-empty { padding: 40px; text-align: center; color: #444; font-size: 0.875rem; }
    .admin-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    .admin-table th { padding: 10px 16px; text-align: left; color: #555; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e1e1e; background: #111; }
    .admin-table td { padding: 12px 16px; color: #bbb; border-bottom: 1px solid #1a1a1a; }
    .admin-table tr:last-child td { border-bottom: none; }
    .admin-table tr:hover td { background: #161616; }
    .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; text-transform: capitalize; }
    .quick-links { display: flex; gap: 12px; flex-wrap: wrap; }
    .quick-link-btn { padding: 10px 18px; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; color: #c8a96e; font-size: 0.82rem; font-weight: 600; text-decoration: none; transition: all 0.2s; }
    .quick-link-btn:hover { background: #c8a96e18; border-color: #c8a96e44; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) { .dash-stats { grid-template-columns: repeat(2,1fr); } }
  `}</style>;
}
