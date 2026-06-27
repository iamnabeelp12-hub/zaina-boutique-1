import React, { useEffect, useState } from 'react';
import { Download, Check, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';
import { AdminLoader } from './AdminDashboard';

export default function AdminReferrals() {
  const [commissions, setCommissions] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState('');
  const [activeTab, setActiveTab] = useState('commissions');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: comms }, { data: lnks }] = await Promise.all([
      supabase.from('referral_commissions')
        .select('*, customers!referrer_customer_id(name, email, phone), orders(order_number, total)')
        .order('created_at', { ascending: false }),
      supabase.from('referral_links')
        .select('*, customers(name, email), products(name)')
        .order('created_at', { ascending: false }),
    ]);
    setCommissions(comms || []);
    setLinks(lnks || []);
    setLoading(false);
  };

  const updateCommissionStatus = async (id, status) => {
    const { error } = await supabase.from('referral_commissions').update({ status }).eq('id', id);
    if (!error) {
      setCommissions(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      toast.success(`Marked as ${status}`);
    }
  };

  const months = [...new Set(commissions.map(c => c.month_year))].sort().reverse();
  const filtered = monthFilter ? commissions.filter(c => c.month_year === monthFilter) : commissions;

  const totalPending = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);
  const totalPaid = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);
  const totalAll = commissions.reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);

  const exportCSV = () => {
    const rows = [
      ['Month', 'Referrer Name', 'Referrer Email', 'Order Number', 'Commission', 'Status'],
      ...filtered.map(c => [
        c.month_year,
        c.customers?.name || '',
        c.customers?.email || '',
        c.orders?.order_number || '',
        c.commission_amount,
        c.status,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referral-report-${monthFilter || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const STATUS_COLORS = { pending: '#f59e0b', approved: '#3b82f6', paid: '#22c55e' };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Referral Program</h1>
          <span className="admin-page-sub">Affiliate commissions and monthly reports</span>
        </div>
        <button className="admin-btn-primary" onClick={exportCSV}><Download size={14} /> Export CSV</button>
      </div>

      {/* Summary Stats */}
      <div className="ref-stats-grid">
        {[
          { label: 'Total Referrers', value: links.length, color: '#c8a96e' },
          { label: 'Total Commissions', value: `₹${totalAll.toLocaleString('en-IN')}`, color: '#8b5cf6' },
          { label: 'Pending Payout', value: `₹${totalPending.toLocaleString('en-IN')}`, color: '#f59e0b' },
          { label: 'Total Paid Out', value: `₹${totalPaid.toLocaleString('en-IN')}`, color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} className="ref-stat-card">
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="cust-tabs" style={{ marginBottom: 20 }}>
        <button className={`cust-tab${activeTab === 'commissions' ? ' active' : ''}`} onClick={() => setActiveTab('commissions')}>💰 Commissions</button>
        <button className={`cust-tab${activeTab === 'links' ? ' active' : ''}`} onClick={() => setActiveTab('links')}>🔗 Referral Links</button>
        <button className={`cust-tab${activeTab === 'monthly' ? ' active' : ''}`} onClick={() => setActiveTab('monthly')}>📅 Monthly Report</button>
      </div>

      {loading ? <AdminLoader /> : (
        <>
          {/* COMMISSIONS */}
          {activeTab === 'commissions' && (
            <div className="admin-card">
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e1e1e', display: 'flex', gap: 10, alignItems: 'center' }}>
                <label style={{ color: '#666', fontSize: '0.78rem' }}>Filter by month:</label>
                <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
                  style={{ padding: '6px 12px', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, color: '#ddd', fontSize: '0.82rem', outline: 'none' }}>
                  <option value="">All Months</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {filtered.length === 0 ? (
                <div className="admin-empty">No commissions recorded yet</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Referrer</th><th>Order</th><th>Month</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ color: '#ddd', fontWeight: 600, fontSize: '0.82rem' }}>{c.customers?.name || '—'}</div>
                          <div style={{ color: '#555', fontSize: '0.72rem' }}>{c.customers?.email}</div>
                          {c.customers?.phone && <div style={{ color: '#444', fontSize: '0.7rem' }}>{c.customers.phone}</div>}
                        </td>
                        <td style={{ color: '#c8a96e', fontSize: '0.82rem', fontWeight: 600 }}>
                          {c.orders?.order_number ? `#${c.orders.order_number}` : '—'}
                          {c.orders?.total && <div style={{ color: '#555', fontSize: '0.7rem' }}>₹{parseFloat(c.orders.total).toLocaleString('en-IN')}</div>}
                        </td>
                        <td style={{ color: '#888', fontSize: '0.82rem' }}>{c.month_year}</td>
                        <td style={{ color: '#22c55e', fontWeight: 700 }}>₹{parseFloat(c.commission_amount).toLocaleString('en-IN')}</td>
                        <td>
                          <span className="status-badge" style={{ background: STATUS_COLORS[c.status] + '22', color: STATUS_COLORS[c.status] }}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {c.status === 'pending' && (
                              <button className="admin-icon-btn" style={{ color: '#3b82f6' }} title="Approve" onClick={() => updateCommissionStatus(c.id, 'approved')}>
                                <Check size={13} />
                              </button>
                            )}
                            {c.status === 'approved' && (
                              <button className="admin-icon-btn" style={{ color: '#22c55e' }} title="Mark Paid" onClick={() => updateCommissionStatus(c.id, 'paid')}>
                                <Check size={13} />
                              </button>
                            )}
                            {c.status !== 'pending' && (
                              <button className="admin-icon-btn" title="Reset to Pending" onClick={() => updateCommissionStatus(c.id, 'pending')}>
                                <X size={13} />
                              </button>
                            )}
                            {c.customers?.phone && (
                              <button
                                className="admin-icon-btn"
                                title="WhatsApp payment confirmation"
                                style={{ color: '#25d366' }}
                                onClick={() => {
                                  const msg = `Hi ${c.customers.name}, your referral commission of ₹${parseFloat(c.commission_amount).toLocaleString('en-IN')} for ${c.month_year} has been ${c.status === 'paid' ? 'processed' : 'approved'}. Thank you for promoting Zaina Boutique! 🌸`;
                                  window.open(`https://wa.me/${c.customers.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* LINKS */}
          {activeTab === 'links' && (
            <div className="admin-card">
              {links.length === 0 ? (
                <div className="admin-empty">No referral links generated yet</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Referrer</th><th>Product</th><th>Code</th><th>Clicks</th><th>Sales</th><th>Commission %</th></tr>
                  </thead>
                  <tbody>
                    {links.map(l => (
                      <tr key={l.id}>
                        <td>
                          <div style={{ color: '#ddd', fontWeight: 600, fontSize: '0.82rem' }}>{l.customers?.name || '—'}</div>
                          <div style={{ color: '#555', fontSize: '0.72rem' }}>{l.customers?.email}</div>
                        </td>
                        <td style={{ color: '#bbb', fontSize: '0.82rem' }}>{l.products?.name || 'All Products'}</td>
                        <td><code style={{ background: '#1a1a1a', padding: '2px 8px', borderRadius: 4, color: '#c8a96e', fontSize: '0.72rem' }}>{l.code}</code></td>
                        <td style={{ color: '#888' }}>{l.clicks}</td>
                        <td style={{ color: '#22c55e', fontWeight: 600 }}>{l.conversions}</td>
                        <td style={{ color: '#c8a96e' }}>{l.commission_percent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* MONTHLY REPORT */}
          {activeTab === 'monthly' && (
            <div className="admin-card">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e1e' }}>
                <h3 className="admin-card-title">📅 Monthly Commission Summary</h3>
              </div>
              {months.length === 0 ? (
                <div className="admin-empty">No monthly data yet</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Month</th><th>Referrers</th><th>Orders</th><th>Total Commission</th><th>Pending</th><th>Paid</th></tr>
                  </thead>
                  <tbody>
                    {months.map(month => {
                      const monthComms = commissions.filter(c => c.month_year === month);
                      const uniqueReferrers = new Set(monthComms.map(c => c.referrer_customer_id)).size;
                      const total = monthComms.reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);
                      const pending = monthComms.filter(c => c.status === 'pending').reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);
                      const paid = monthComms.filter(c => c.status === 'paid').reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);
                      return (
                        <tr key={month} style={{ cursor: 'pointer' }} onClick={() => { setMonthFilter(month); setActiveTab('commissions'); }}>
                          <td style={{ color: '#c8a96e', fontWeight: 700 }}>{month}</td>
                          <td style={{ color: '#888' }}>{uniqueReferrers}</td>
                          <td style={{ color: '#888' }}>{monthComms.length}</td>
                          <td style={{ color: '#ddd', fontWeight: 700 }}>₹{total.toLocaleString('en-IN')}</td>
                          <td style={{ color: '#f59e0b' }}>₹{pending.toLocaleString('en-IN')}</td>
                          <td style={{ color: '#22c55e' }}>₹{paid.toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        .admin-page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px}
        .admin-page-title{color:#fff;font-size:1.4rem;font-weight:700;margin-bottom:2px}
        .admin-page-sub{color:#555;font-size:.82rem}
        .admin-btn-primary{display:flex;align-items:center;gap:8px;padding:9px 18px;background:#c8a96e;color:#fff;border-radius:8px;font-size:.82rem;font-weight:600;border:none;cursor:pointer}
        .admin-btn-primary:hover{background:#b8945a}
        .ref-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
        .ref-stat-card{background:#141414;border:1px solid #222;border-radius:10px;padding:18px}
        .cust-tabs{display:flex;gap:4px;background:#141414;border:1px solid #222;border-radius:10px;padding:4px;width:fit-content}
        .cust-tab{padding:8px 16px;border-radius:7px;border:none;background:transparent;color:#666;font-size:.78rem;cursor:pointer;transition:all .15s;font-family:inherit}
        .cust-tab.active{background:#222;color:#c8a96e}
        .admin-card{background:#141414;border:1px solid #222;border-radius:12px;overflow:hidden}
        .admin-card-title{color:#ccc;font-size:.875rem;font-weight:600}
        .admin-empty{padding:40px;text-align:center;color:#444;font-size:.875rem}
        .admin-table{width:100%;border-collapse:collapse;font-size:.82rem}
        .admin-table th{padding:10px 14px;text-align:left;color:#555;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #1e1e1e;background:#111}
        .admin-table td{padding:12px 14px;color:#bbb;border-bottom:1px solid #1a1a1a}
        .admin-table tr:last-child td{border-bottom:none}
        .admin-table tr:hover td{background:#161616}
        .status-badge{padding:3px 10px;border-radius:20px;font-size:.7rem;font-weight:600;text-transform:capitalize}
        .admin-icon-btn{width:28px;height:28px;border-radius:6px;border:1px solid #2a2a2a;background:#1a1a1a;color:#888;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
        .admin-icon-btn:hover{background:#222;color:#ddd}
        @media(max-width:768px){.ref-stats-grid{grid-template-columns:repeat(2,1fr)}}
      `}</style>
    </div>
  );
}
