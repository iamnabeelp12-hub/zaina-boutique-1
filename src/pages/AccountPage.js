import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, MapPin, Share2, User, LogOut, Plus, Trash2, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { toast } from 'react-toastify';

export default function AccountPage() {
  const { customer, signOut, refreshCustomer } = useAuth();
  const { settings } = useSite();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'orders';
  const sym = settings.general?.currency_symbol || '₹';

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [refLinks, setRefLinks] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addrForm, setAddrForm] = useState({ label: 'Home', full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', country: 'India' });
  const [showAddrForm, setShowAddrForm] = useState(false);

  useEffect(() => {
    if (!customer) { navigate('/login'); return; }
    loadData();
  }, [customer, tab]);

  const loadData = async () => {
    setLoading(true);
    if (tab === 'orders') {
      const { data } = await supabase.from('orders').select('*').eq('customer_id', customer.id).order('created_at', { ascending: false });
      setOrders(data || []);
    } else if (tab === 'addresses') {
      const { data } = await supabase.from('customer_addresses').select('*').eq('customer_id', customer.id).order('is_default', { ascending: false });
      setAddresses(data || []);
    } else if (tab === 'referral') {
      const { data: links } = await supabase.from('referral_links').select('*, products(name,slug)').eq('customer_id', customer.id);
      const { data: comms } = await supabase.from('referral_commissions').select('*').eq('referrer_customer_id', customer.id).order('created_at', { ascending: false });
      setRefLinks(links || []);
      setCommissions(comms || []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const saveAddress = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('customer_addresses').insert({ ...addrForm, customer_id: customer.id });
    if (!error) { toast.success('Address saved!'); setShowAddrForm(false); loadData(); setAddrForm({ label: 'Home', full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', country: 'India' }); }
    else toast.error('Failed to save address');
  };

  const deleteAddress = async (id) => {
    await supabase.from('customer_addresses').delete().eq('id', id);
    loadData();
    toast.success('Address removed');
  };

  const setDefaultAddress = async (id) => {
    await supabase.from('customer_addresses').update({ is_default: false }).eq('customer_id', customer.id);
    await supabase.from('customer_addresses').update({ is_default: true }).eq('id', id);
    loadData();
    toast.success('Default address updated');
  };

  const copyRefLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  };

  const totalCommission = commissions.reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);
  const pendingCommission = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);

  const STATUS_COLORS = { pending: '#f59e0b', confirmed: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444' };

  if (!customer) return null;

  return (
    <>
      <Helmet><title>My Account | Zaina Boutique</title></Helmet>
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="account-layout">
          {/* Sidebar */}
          <aside className="account-sidebar">
            <div className="account-avatar">{customer.name?.[0]?.toUpperCase()}</div>
            <div className="account-name">{customer.name}</div>
            <div className="account-email">{customer.email}</div>
            <nav className="account-nav">
              {[
                { key: 'orders', label: 'My Orders', icon: <Package size={16} /> },
                { key: 'addresses', label: 'Addresses', icon: <MapPin size={16} /> },
                { key: 'referral', label: 'Referral Program', icon: <Share2 size={16} /> },
                { key: 'profile', label: 'Profile', icon: <User size={16} /> },
              ].map(t => (
                <button key={t.key} className={`account-nav-item${tab === t.key ? ' active' : ''}`} onClick={() => setSearchParams({ tab: t.key })}>
                  {t.icon} {t.label}
                </button>
              ))}
              <button className="account-nav-item logout" onClick={handleSignOut}><LogOut size={16} /> Sign Out</button>
            </nav>
          </aside>

          {/* Content */}
          <div className="account-content">
            {/* ORDERS */}
            {tab === 'orders' && (
              <div>
                <h2 className="account-section-title">My Orders</h2>
                {loading ? <div className="loading-center"><div className="spinner" /></div>
                  : orders.length === 0 ? (
                    <div className="empty-state">
                      <Package size={48} />
                      <h3>No orders yet</h3>
                      <p>Start shopping to see your orders here.</p>
                      <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>Shop Now</Link>
                    </div>
                  ) : orders.map(o => (
                    <div key={o.id} className="order-card">
                      <div className="order-card-header">
                        <div>
                          <span className="order-number">#{o.order_number}</span>
                          <span className="order-date">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <span className="order-status" style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status] }}>{o.status?.toUpperCase()}</span>
                      </div>
                      <div className="order-items-list">
                        {o.items?.map((item, i) => (
                          <div key={i} className="order-item-mini">
                            {item.image && <img src={item.image} alt={item.name} />}
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#888' }}>Qty: {item.qty}{item.size ? ` · Size: ${item.size}` : ''}</div>
                            </div>
                            <div style={{ marginLeft: 'auto', fontWeight: 600, fontSize: '0.875rem' }}>{sym}{(item.price * item.qty).toLocaleString('en-IN')}</div>
                          </div>
                        ))}
                      </div>
                      <div className="order-card-footer">
                        <span>Total: <strong>{sym}{parseFloat(o.total).toLocaleString('en-IN')}</strong></span>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Via WhatsApp Order</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* ADDRESSES */}
            {tab === 'addresses' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 className="account-section-title" style={{ marginBottom: 0 }}>My Addresses</h2>
                  <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowAddrForm(!showAddrForm)}>
                    <Plus size={14} /> Add New
                  </button>
                </div>

                {showAddrForm && (
                  <form onSubmit={saveAddress} className="addr-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Label</label>
                        <select value={addrForm.label} onChange={e => setAddrForm(f => ({ ...f, label: e.target.value }))}>
                          <option>Home</option><option>Work</option><option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Full Name *</label><input required value={addrForm.full_name} onChange={e => setAddrForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Full name" /></div>
                      <div className="form-group"><label>Phone *</label><input required value={addrForm.phone} onChange={e => setAddrForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number" /></div>
                    </div>
                    <div className="form-group"><label>Address Line 1 *</label><input required value={addrForm.address_line1} onChange={e => setAddrForm(f => ({ ...f, address_line1: e.target.value }))} placeholder="House/Flat, Street, Area" /></div>
                    <div className="form-group"><label>Address Line 2</label><input value={addrForm.address_line2} onChange={e => setAddrForm(f => ({ ...f, address_line2: e.target.value }))} placeholder="Landmark (optional)" /></div>
                    <div className="form-row">
                      <div className="form-group"><label>City *</label><input required value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} /></div>
                      <div className="form-group"><label>State *</label><input required value={addrForm.state} onChange={e => setAddrForm(f => ({ ...f, state: e.target.value }))} /></div>
                      <div className="form-group"><label>PIN Code *</label><input required value={addrForm.pincode} onChange={e => setAddrForm(f => ({ ...f, pincode: e.target.value }))} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button type="submit" className="btn-primary">Save Address</button>
                      <button type="button" className="btn-secondary" onClick={() => setShowAddrForm(false)}>Cancel</button>
                    </div>
                  </form>
                )}

                {loading ? <div className="loading-center"><div className="spinner" /></div>
                  : addresses.length === 0 && !showAddrForm ? (
                    <div className="empty-state"><MapPin size={48} /><h3>No addresses saved</h3><p>Add an address for faster checkout.</p></div>
                  ) : addresses.map(a => (
                    <div key={a.id} className={`addr-card${a.is_default ? ' default' : ''}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span className="addr-label">{a.label}</span>
                            {a.is_default && <span className="addr-default-badge"><Check size={11} /> Default</span>}
                          </div>
                          <p style={{ fontWeight: 600, marginBottom: 4 }}>{a.full_name}</p>
                          <p style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.6 }}>
                            {a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ''}<br />
                            {a.city}, {a.state} — {a.pincode}
                          </p>
                          <p style={{ color: '#888', fontSize: '0.82rem', marginTop: 4 }}>{a.phone}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {!a.is_default && <button className="addr-action-btn" onClick={() => setDefaultAddress(a.id)}>Set Default</button>}
                          <button className="addr-action-btn danger" onClick={() => deleteAddress(a.id)}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* REFERRAL */}
            {tab === 'referral' && (
              <div>
                <h2 className="account-section-title">Referral Program</h2>
                <div className="ref-stats">
                  <div className="ref-stat-card">
                    <div className="ref-stat-value">{refLinks.length}</div>
                    <div className="ref-stat-label">Active Links</div>
                  </div>
                  <div className="ref-stat-card">
                    <div className="ref-stat-value">{commissions.length}</div>
                    <div className="ref-stat-label">Total Referrals</div>
                  </div>
                  <div className="ref-stat-card highlight">
                    <div className="ref-stat-value">{sym}{totalCommission.toLocaleString('en-IN')}</div>
                    <div className="ref-stat-label">Total Earnings</div>
                  </div>
                  <div className="ref-stat-card">
                    <div className="ref-stat-value">{sym}{pendingCommission.toLocaleString('en-IN')}</div>
                    <div className="ref-stat-label">Pending Payout</div>
                  </div>
                </div>

                <div className="ref-how">
                  <h3>How it works</h3>
                  <div className="how-steps">
                    {['Go to any product page', 'Click "Generate My Referral Link"', 'Share with friends & family', 'Earn 5% commission on every purchase!'].map((s, i) => (
                      <div key={i} className="how-step"><span className="step-num">{i + 1}</span><span>{s}</span></div>
                    ))}
                  </div>
                </div>

                {refLinks.length > 0 && (
                  <div style={{ marginTop: 28 }}>
                    <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 600 }}>My Referral Links</h3>
                    {refLinks.map(r => {
                      const link = `${window.location.origin}/products/${r.products?.slug}?ref=${r.code}`;
                      return (
                        <div key={r.id} className="ref-link-card">
                          <div style={{ marginBottom: 8 }}>
                            <strong style={{ fontSize: '0.9rem' }}>{r.products?.name || 'Product'}</strong>
                            <span style={{ fontSize: '0.78rem', color: '#aaa', marginLeft: 8 }}>Code: {r.code}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <input readOnly value={link} style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #e0d6cc', borderRadius: 6, fontSize: '0.78rem', background: '#f9f6f2', minWidth: 200 }} />
                            <button className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }} onClick={() => copyRefLink(link)}>Copy</button>
                          </div>
                          <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: '0.8rem', color: '#888' }}>
                            <span>👁 {r.clicks} clicks</span>
                            <span>🛍 {r.conversions} sales</span>
                            <span>💰 {r.commission_percent}% commission</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {commissions.length > 0 && (
                  <div style={{ marginTop: 28 }}>
                    <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 600 }}>Commission History</h3>
                    <div className="comm-table">
                      <div className="comm-header">
                        <span>Month</span><span>Amount</span><span>Status</span>
                      </div>
                      {commissions.map(c => (
                        <div key={c.id} className="comm-row">
                          <span>{c.month_year}</span>
                          <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{sym}{parseFloat(c.commission_amount).toLocaleString('en-IN')}</span>
                          <span className={`comm-status ${c.status}`}>{c.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE */}
            {tab === 'profile' && (
              <div>
                <h2 className="account-section-title">My Profile</h2>
                <div className="profile-card">
                  <div className="profile-avatar">{customer.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{customer.name}</div>
                    <div style={{ color: '#888', fontSize: '0.875rem', marginTop: 4 }}>{customer.email}</div>
                    {customer.phone && <div style={{ color: '#888', fontSize: '0.875rem' }}>{customer.phone}</div>}
                    <div style={{ color: '#aaa', fontSize: '0.78rem', marginTop: 8 }}>Member since {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>
                <p style={{ color: '#888', fontSize: '0.875rem', marginTop: 16 }}>To update profile details, please contact us on WhatsApp.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .account-layout { display: grid; grid-template-columns: 260px 1fr; gap: 32px; align-items: start; }
        .account-sidebar { background: #fff; border-radius: 12px; padding: 28px; box-shadow: var(--shadow); position: sticky; top: 100px; }
        .account-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--color-primary); color: #fff; font-size: 1.6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
        .account-name { text-align: center; font-weight: 700; font-size: 1rem; }
        .account-email { text-align: center; font-size: 0.78rem; color: #aaa; margin-bottom: 24px; word-break: break-all; }
        .account-nav { display: flex; flex-direction: column; gap: 4px; }
        .account-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; background: none; border: none; cursor: pointer; font-size: 0.875rem; color: var(--color-text); text-align: left; transition: all 0.2s; width: 100%; }
        .account-nav-item:hover { background: var(--color-accent); color: var(--color-primary); }
        .account-nav-item.active { background: var(--color-primary); color: #fff; }
        .account-nav-item.logout { color: #e74c3c; margin-top: 8px; }
        .account-nav-item.logout:hover { background: #fef2f2; }
        .account-content { background: #fff; border-radius: 12px; padding: 32px; box-shadow: var(--shadow); min-height: 400px; }
        .account-section-title { font-family: var(--font-display); font-size: 1.4rem; margin-bottom: 24px; }
        .empty-state { text-align: center; padding: 60px 20px; color: #bbb; }
        .empty-state svg { margin: 0 auto 16px; }
        .empty-state h3 { color: #888; font-size: 1rem; margin-bottom: 6px; }
        .empty-state p { font-size: 0.875rem; }
        .order-card { border: 1px solid #f0ebe4; border-radius: 10px; margin-bottom: 16px; overflow: hidden; }
        .order-card-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #faf7f3; border-bottom: 1px solid #f0ebe4; }
        .order-number { font-weight: 700; font-size: 0.9rem; margin-right: 12px; }
        .order-date { font-size: 0.78rem; color: #aaa; }
        .order-status { padding: 4px 12px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.5px; }
        .order-items-list { padding: 12px 18px; display: flex; flex-direction: column; gap: 10px; }
        .order-item-mini { display: flex; align-items: center; gap: 12px; }
        .order-item-mini img { width: 48px; height: 56px; object-fit: cover; border-radius: 6px; }
        .order-card-footer { padding: 12px 18px; background: #faf7f3; border-top: 1px solid #f0ebe4; display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; }
        .addr-form { background: #f9f6f2; border-radius: 10px; padding: 20px; margin-bottom: 20px; border: 1px solid #f0ebe4; }
        .form-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
        .addr-card { border: 1.5px solid #f0ebe4; border-radius: 10px; padding: 18px; margin-bottom: 12px; transition: border-color 0.2s; }
        .addr-card.default { border-color: var(--color-primary); }
        .addr-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; background: var(--color-accent); color: var(--color-primary); padding: 3px 10px; border-radius: 4px; }
        .addr-default-badge { display: flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 600; color: #22c55e; background: #f0fdf4; padding: 3px 8px; border-radius: 4px; }
        .addr-action-btn { padding: 6px 12px; border-radius: 6px; border: 1.5px solid #e0d6cc; background: #fff; font-size: 0.78rem; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; }
        .addr-action-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .addr-action-btn.danger:hover { border-color: #ef4444; color: #ef4444; }
        .ref-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .ref-stat-card { background: #f9f6f2; border-radius: 10px; padding: 18px; text-align: center; }
        .ref-stat-card.highlight { background: var(--color-primary); }
        .ref-stat-card.highlight .ref-stat-value, .ref-stat-card.highlight .ref-stat-label { color: #fff; }
        .ref-stat-value { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--color-secondary); }
        .ref-stat-label { font-size: 0.75rem; color: #888; margin-top: 4px; }
        .ref-how { background: #f9f6f2; border-radius: 10px; padding: 20px; }
        .ref-how h3 { font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 14px; }
        .how-steps { display: flex; flex-direction: column; gap: 10px; }
        .how-step { display: flex; align-items: center; gap: 12px; font-size: 0.875rem; }
        .step-num { width: 26px; height: 26px; border-radius: 50%; background: var(--color-primary); color: #fff; font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ref-link-card { border: 1px solid #f0ebe4; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
        .comm-table { border: 1px solid #f0ebe4; border-radius: 10px; overflow: hidden; }
        .comm-header { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 10px 16px; background: #faf7f3; font-size: 0.78rem; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .comm-row { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 12px 16px; border-top: 1px solid #f0ebe4; font-size: 0.875rem; align-items: center; }
        .comm-status { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; text-transform: capitalize; display: inline-block; }
        .comm-status.pending { background: #fef3c7; color: #d97706; }
        .comm-status.approved { background: #d1fae5; color: #059669; }
        .comm-status.paid { background: #dbeafe; color: #2563eb; }
        .profile-card { display: flex; align-items: center; gap: 20px; background: #f9f6f2; border-radius: 12px; padding: 24px; }
        .profile-avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--color-primary); color: #fff; font-size: 1.8rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        @media (max-width: 860px) { .account-layout { grid-template-columns: 1fr; } .account-sidebar { position: static; } .ref-stats { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 480px) { .ref-stats { grid-template-columns: 1fr 1fr; } .comm-table { font-size: 0.8rem; } }
      `}</style>
    </>
  );
}
