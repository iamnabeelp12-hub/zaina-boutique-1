import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(form);
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet><title>Register | Zaina Boutique</title></Helmet>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">Zaina Boutique</div>
          <h2>Create Account</h2>
          <p className="auth-sub">Join us for exclusive offers</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimum 6 characters" />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 8 }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: '#888' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
      <style>{`
        .auth-page { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; background: var(--color-accent); }
        .auth-card { background: #fff; border-radius: 16px; padding: 40px; width: 100%; max-width: 420px; box-shadow: 0 8px 40px rgba(0,0,0,0.1); }
        .auth-logo { font-family: var(--font-display); font-size: 1.4rem; color: var(--color-primary); text-align: center; margin-bottom: 24px; }
        .auth-card h2 { font-family: var(--font-display); text-align: center; font-size: 1.6rem; margin-bottom: 6px; }
        .auth-sub { text-align: center; color: #888; font-size: 0.875rem; margin-bottom: 28px; }
      `}</style>
    </>
  );
}
