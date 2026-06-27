import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSite } from '../context/SiteContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQty, totalPrice, clearCart } = useCart();
  const { settings } = useSite();
  const sym = settings.general?.currency_symbol || '₹';
  const freeShipping = settings.general?.free_shipping_above || 999;
  const shipping = totalPrice >= freeShipping ? 0 : 99;

  if (cart.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <ShoppingBag size={64} style={{ color: '#ddd', margin: '0 auto 20px' }} />
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>Your cart is empty</h2>
      <p style={{ color: '#888', marginBottom: 28 }}>Looks like you haven't added anything yet.</p>
      <Link to="/products" className="btn-primary" style={{ display: 'inline-flex' }}>Start Shopping <ArrowRight size={16} /></Link>
    </div>
  );

  return (
    <>
      <Helmet><title>Cart | Zaina Boutique</title></Helmet>
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 32, fontSize: '1.8rem' }}>Shopping Cart</h1>
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.cartKey} className="cart-item">
                <div className="cart-img">
                  {item.images?.[0] ? <img src={item.images[0]} alt={item.name} /> : <div style={{ width: '100%', height: '100%', background: '#f5ede4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👗</div>}
                </div>
                <div className="cart-info">
                  <Link to={`/products/${item.slug}`} style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-secondary)' }}>{item.name}</Link>
                  {item.size && <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 4 }}>Size: {item.size}</p>}
                  {item.color && <p style={{ fontSize: '0.8rem', color: '#888' }}>Color: {item.color}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 12 }}>
                    <div className="qty-control">
                      <button onClick={() => updateQty(item.cartKey, item.qty - 1)}><Minus size={14} /></button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.cartKey, item.qty + 1)}><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.cartKey)} style={{ background: 'none', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
                <div className="cart-price">
                  <span>{sym}{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  {item.qty > 1 && <span style={{ fontSize: '0.78rem', color: '#aaa' }}>{sym}{item.price?.toLocaleString('en-IN')} each</span>}
                </div>
              </div>
            ))}
            <button onClick={clearCart} style={{ background: 'none', color: '#aaa', fontSize: '0.825rem', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Trash2 size={14} /> Clear Cart
            </button>
          </div>

          <div className="cart-summary">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Order Summary</h3>
            <div className="summary-row"><span>Subtotal</span><span>{sym}{totalPrice.toLocaleString('en-IN')}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: 'green' }}>FREE</span> : `${sym}${shipping}`}</span></div>
            {shipping > 0 && <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: 12 }}>Add {sym}{(freeShipping - totalPrice).toLocaleString('en-IN')} more for free shipping</p>}
            <div className="summary-row total"><span>Total</span><span>{sym}{(totalPrice + shipping).toLocaleString('en-IN')}</span></div>
            <Link to="/checkout" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: 14, color: '#888', fontSize: '0.875rem' }}>Continue Shopping</Link>
          </div>
        </div>
      </div>

      <style>{`
        .cart-layout { display: grid; grid-template-columns: 1fr 360px; gap: 32px; align-items: start; }
        .cart-items { display: flex; flex-direction: column; gap: 16px; }
        .cart-item { display: grid; grid-template-columns: 100px 1fr auto; gap: 16px; background: #fff; border-radius: 10px; padding: 16px; box-shadow: var(--shadow); align-items: start; }
        .cart-img { width: 100px; height: 120px; border-radius: 8px; overflow: hidden; }
        .cart-img img { width: 100%; height: 100%; object-fit: cover; }
        .cart-info { flex: 1; }
        .cart-price { text-align: right; display: flex; flex-direction: column; gap: 4; }
        .cart-price span:first-child { font-weight: 700; color: var(--color-primary); font-size: 1rem; }
        .cart-summary { background: #fff; border-radius: 12px; padding: 24px; box-shadow: var(--shadow); position: sticky; top: 100px; }
        .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f0ea; font-size: 0.9rem; }
        .summary-row.total { font-weight: 700; font-size: 1.05rem; border-bottom: none; padding-top: 14px; }
        @media (max-width: 768px) { .cart-layout { grid-template-columns: 1fr; } .cart-item { grid-template-columns: 80px 1fr auto; } }
      `}</style>
    </>
  );
}
