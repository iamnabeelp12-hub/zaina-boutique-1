import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Send } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { toast } from 'react-toastify';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { customer } = useAuth();
  const { settings } = useSite();
  const navigate = useNavigate();
  const sym = settings.general?.currency_symbol || '₹';
  const freeShipping = settings.general?.free_shipping_above || 999;
  const shipping = totalPrice >= freeShipping ? 0 : 99;

  const [form, setForm] = useState({
    full_name: customer?.name || '',
    phone: customer?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm(f => ({ ...f, full_name: customer.name, phone: customer.phone || '' }));
      supabase.from('customer_addresses').select('*').eq('customer_id', customer.id).order('is_default', { ascending: false }).then(({ data }) => {
        if (data?.length) {
          setSavedAddresses(data);
          const def = data.find(a => a.is_default) || data[0];
          setForm(f => ({ ...f, full_name: def.full_name, phone: def.phone, address_line1: def.address_line1, address_line2: def.address_line2 || '', city: def.city, state: def.state, pincode: def.pincode }));
        }
      });
    }
  }, [customer]);

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const addr = data.address;
          setForm(f => ({
            ...f,
            address_line1: [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(', '),
            city: addr.city || addr.town || addr.village || '',
            state: addr.state || '',
            pincode: addr.postcode || '',
          }));
          toast.success('Location detected!');
        } catch {
          toast.info('Location detected. Please fill remaining fields.');
        }
        setLocating(false);
      },
      () => { toast.error('Could not detect location'); setLocating(false); }
    );
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart.length) { toast.error('Your cart is empty'); return; }
    setSubmitting(true);

    const total = totalPrice + shipping;
    const refCode = localStorage.getItem('referral_code');

    // Save address
    if (customer) {
      const addrData = { ...form, customer_id: customer.id, ...(location || {}), is_default: true };
      // Unset other defaults
      await supabase.from('customer_addresses').update({ is_default: false }).eq('customer_id', customer.id);
      await supabase.from('customer_addresses').insert(addrData);
    }

    // Create order
    const shippingAddr = { ...form, ...(location || {}) };
    const items = cart.map(i => ({ product_id: i.id, name: i.name, price: i.price, qty: i.qty, size: i.size, color: i.color, image: i.images?.[0] }));

    let referrerCustomerId = null;
    if (refCode) {
      const { data: refData } = await supabase.from('referral_links').select('customer_id').eq('code', refCode).single();
      if (refData) referrerCustomerId = refData.customer_id;
    }

    const { data: order, error } = await supabase.from('orders').insert({
      customer_id: customer?.id,
      customer_name: form.full_name,
      customer_email: customer?.email,
      customer_phone: form.phone,
      shipping_address: shippingAddr,
      items,
      subtotal: totalPrice,
      shipping_charge: shipping,
      total,
      payment_method: 'whatsapp',
      referral_code: refCode,
      referrer_customer_id: referrerCustomerId,
    }).select().single();

    if (error) { toast.error('Order failed. Please try again.'); setSubmitting(false); return; }

    // Track referral commission
    if (refCode && referrerCustomerId) {
      const { data: refLink } = await supabase.from('referral_links').select('id,commission_percent').eq('code', refCode).single();
      if (refLink) {
        const commissionAmt = (total * (refLink.commission_percent / 100)).toFixed(2);
        await supabase.from('referral_commissions').insert({
          referral_link_id: refLink.id,
          order_id: order.id,
          referrer_customer_id: referrerCustomerId,
          commission_amount: commissionAmt,
          month_year: new Date().toISOString().slice(0, 7),
        });
        await supabase.from('referral_links').update({ conversions: supabase.raw('conversions + 1') }).eq('id', refLink.id);
      }
    }

    // Send WhatsApp
    const itemsText = cart.map(i => `• ${i.name}${i.size ? ` (${i.size})` : ''} x${i.qty} — ${sym}${(i.price * i.qty).toLocaleString('en-IN')}`).join('\n');
    const msg = `🛍️ *New Order — Zaina Boutique*\n` +
      `📋 *Order:* #${order.order_number}\n\n` +
      `👤 *Customer Details*\n` +
      `Name: ${form.full_name}\n` +
      `Phone: ${form.phone}\n` +
      `Email: ${customer?.email || 'N/A'}\n\n` +
      `📦 *Items:*\n${itemsText}\n\n` +
      `🏠 *Delivery Address:*\n` +
      `${form.address_line1}${form.address_line2 ? ', ' + form.address_line2 : ''}\n` +
      `${form.city}, ${form.state} — ${form.pincode}\n` +
      (location ? `📍 Location: https://maps.google.com/?q=${location.latitude},${location.longitude}\n` : '') +
      `\n💰 *Total: ${sym}${total.toLocaleString('en-IN')}*\n` +
      `(Subtotal: ${sym}${totalPrice.toLocaleString('en-IN')} + Shipping: ${sym}${shipping})\n\n` +
      (refCode ? `🔗 Referred by code: ${refCode}\n\n` : '') +
      `Thank you for choosing Zaina Boutique! 🌸`;

    const waUrl = `https://wa.me/${(settings.general?.whatsapp || '917418701120').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    localStorage.removeItem('referral_code');
    clearCart();
    navigate('/order-success', { state: { orderNumber: order.order_number } });
  };

  if (!cart.length) return <div style={{ textAlign: 'center', padding: 80 }}><h2>Your cart is empty</h2><Link to="/products" className="btn-primary" style={{ display: 'inline-flex', marginTop: 20 }}>Shop Now</Link></div>;

  return (
    <>
      <Helmet><title>Checkout | Zaina Boutique</title></Helmet>
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 32, fontSize: '1.8rem' }}>Checkout</h1>
        {!customer && <div className="login-notice"><strong>💡 Sign in</strong> to save your address and track orders. <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign In</Link></div>}

        <form onSubmit={handleSubmit}>
          <div className="checkout-layout">
            <div>
              <div className="checkout-section">
                <div className="checkout-section-header">
                  <h3>Delivery Address</h3>
                  <button type="button" className="locate-btn" onClick={detectLocation} disabled={locating}>
                    <MapPin size={15} /> {locating ? 'Detecting...' : 'Use My Location'}
                  </button>
                </div>

                {savedAddresses.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: '0.82rem', color: '#888', marginBottom: 10 }}>Saved addresses:</p>
                    {savedAddresses.slice(0, 3).map(a => (
                      <button type="button" key={a.id} className="saved-addr-btn" onClick={() => setForm(f => ({ ...f, full_name: a.full_name, phone: a.phone, address_line1: a.address_line1, address_line2: a.address_line2 || '', city: a.city, state: a.state, pincode: a.pincode }))}>
                        <strong>{a.label}</strong>: {a.address_line1}, {a.city} {a.pincode}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Full Name *</label>
                    <input name="full_name" required value={form.full_name} onChange={handleChange} placeholder="Your full name" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Phone *</label>
                    <input name="phone" required value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Address Line 1 *</label>
                    <input name="address_line1" required value={form.address_line1} onChange={handleChange} placeholder="House/Flat, Street, Area" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Address Line 2</label>
                    <input name="address_line2" value={form.address_line2} onChange={handleChange} placeholder="Landmark (optional)" />
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input name="city" required value={form.city} onChange={handleChange} placeholder="City" />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input name="state" required value={form.state} onChange={handleChange} placeholder="State" />
                  </div>
                  <div className="form-group">
                    <label>PIN Code *</label>
                    <input name="pincode" required value={form.pincode} onChange={handleChange} placeholder="PIN Code" />
                  </div>
                </div>

                {location && <div className="location-confirmed"><MapPin size={14} style={{ color: 'green' }} /> Location confirmed: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</div>}
              </div>
            </div>

            <div className="checkout-summary">
              <h3>Order Summary</h3>
              <div className="order-items">
                {cart.map(i => (
                  <div key={i.cartKey} className="order-item-row">
                    <div className="order-item-img">{i.images?.[0] ? <img src={i.images[0]} alt={i.name} /> : <div style={{ background: '#f5ede4', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👗</div>}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{i.name}</div>
                      {i.size && <div style={{ fontSize: '0.78rem', color: '#888' }}>Size: {i.size}</div>}
                      <div style={{ fontSize: '0.78rem', color: '#888' }}>Qty: {i.qty}</div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{sym}{(i.price * i.qty).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
              <div className="summary-row"><span>Subtotal</span><span>{sym}{totalPrice.toLocaleString('en-IN')}</span></div>
              <div className="summary-row"><span>Shipping</span><span style={{ color: shipping === 0 ? 'green' : 'inherit' }}>{shipping === 0 ? 'FREE' : `${sym}${shipping}`}</span></div>
              <div className="summary-row total"><span>Total</span><span>{sym}{(totalPrice + shipping).toLocaleString('en-IN')}</span></div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 20, padding: '14px' }} disabled={submitting}>
                <Send size={16} /> {submitting ? 'Processing...' : 'Place Order via WhatsApp'}
              </button>
              <p style={{ fontSize: '0.75rem', color: '#aaa', textAlign: 'center', marginTop: 10 }}>You'll be redirected to WhatsApp to confirm your order.</p>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .login-notice { background: #fef3e2; border: 1px solid #f0d9b0; border-radius: 8px; padding: 14px 18px; margin-bottom: 28px; font-size: 0.875rem; }
        .checkout-layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
        .checkout-section { background: #fff; border-radius: 12px; padding: 28px; box-shadow: var(--shadow); }
        .checkout-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .checkout-section-header h3 { font-family: var(--font-display); font-size: 1.2rem; }
        .locate-btn { display: flex; align-items: center; gap: 6px; background: var(--color-accent); color: var(--color-text); padding: 8px 14px; border-radius: 6px; font-size: 0.82rem; font-weight: 600; border: 1px solid #e0d4c0; cursor: pointer; }
        .locate-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .saved-addr-btn { display: block; width: 100%; text-align: left; padding: 10px 14px; background: #f9f6f2; border: 1.5px solid #e8dfd5; border-radius: 6px; font-size: 0.82rem; margin-bottom: 8px; cursor: pointer; transition: border-color 0.2s; }
        .saved-addr-btn:hover { border-color: var(--color-primary); }
        .location-confirmed { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: green; margin-top: 8px; }
        .checkout-summary { background: #fff; border-radius: 12px; padding: 24px; box-shadow: var(--shadow); position: sticky; top: 100px; }
        .checkout-summary h3 { font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 20px; }
        .order-items { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f0ebe4; }
        .order-item-row { display: flex; gap: 12px; align-items: center; }
        .order-item-img { width: 56px; height: 64px; border-radius: 6px; overflow: hidden; flex-shrink: 0; }
        .order-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 0.875rem; border-bottom: 1px solid #f5f0ea; }
        .summary-row.total { font-weight: 700; font-size: 1.05rem; border-bottom: none; padding-top: 12px; }
        @media (max-width: 860px) { .checkout-layout { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
