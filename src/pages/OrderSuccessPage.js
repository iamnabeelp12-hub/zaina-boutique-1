import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const orderNumber = state?.orderNumber || '';

  return (
    <>
      <Helmet><title>Order Placed | Zaina Boutique</title></Helmet>
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <CheckCircle size={72} style={{ color: '#25d366', margin: '0 auto 24px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 12 }}>Order Placed!</h1>
          {orderNumber && <p style={{ color: '#888', marginBottom: 8 }}>Order No: <strong style={{ color: 'var(--color-secondary)' }}>#{orderNumber}</strong></p>}
          <p style={{ color: '#666', lineHeight: 1.7, marginBottom: 32 }}>
            Thank you for shopping with Zaina Boutique! Your order details have been sent via WhatsApp. Our team will confirm your order shortly.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/account?tab=orders" className="btn-primary"><ShoppingBag size={16} /> My Orders</Link>
            <Link to="/" className="btn-secondary"><Home size={16} /> Continue Shopping</Link>
          </div>
        </div>
      </div>
    </>
  );
}
