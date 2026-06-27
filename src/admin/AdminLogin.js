import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { Lock } from 'lucide-react';

const ADMIN_PATH = process.env.REACT_APP_ADMIN_SECRET_PATH || 'zainab-secure-admin-2024';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || '';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: ADMIN_EMAIL, password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword(form);
    if (error) { toast.error('Invalid credentials'); setLoading(false); return; }
    // Mark as admin session
    sessionStorage.setItem('zaina_admin', 'true');
    navigate(`/${ADMIN_PATH}/`);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 40, width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#c8a96e22', border: '1px solid #c8a96e44', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={22} color="#c8a96e" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: 6 }}>Admin Panel</h1>
          <p style={{ color: '#666', fontSize: '0.82rem' }}>Zaina Boutique — Restricted Access</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#999', fontSize: '0.8rem', marginBottom: 6 }}>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={{ width: '100%', padding: '11px 14px', background: '#111', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              placeholder="admin@zainaboutique.com" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#999', fontSize: '0.8rem', marginBottom: 6 }}>Password</label>
            <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={{ width: '100%', padding: '11px 14px', background: '#111', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: 13, background: '#c8a96e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
