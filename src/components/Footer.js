import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { supabase } from '../supabaseClient';

export default function Footer() {
  const { settings } = useSite();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    supabase.from('categories').select('name,slug').eq('is_active', true).order('display_order').limit(6).then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const g = settings.general || {};
  const s = settings.social || {};
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: settings.colors?.footer_bg || '#1a1a1a', color: 'rgba(255,255,255,0.7)' }}>
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">{g.site_name || 'Zaina Boutique'}</div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.7, marginTop: 12, marginBottom: 20 }}>
              {g.tagline || 'Elegance Redefined'} — Bringing you the finest in Indian and contemporary fashion.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="social-icon"><Instagram size={18} /></a>}
              {s.facebook && <a href={s.facebook} target="_blank" rel="noopener noreferrer" className="social-icon"><Facebook size={18} /></a>}
              {s.youtube && <a href={s.youtube} target="_blank" rel="noopener noreferrer" className="social-icon"><Youtube size={18} /></a>}
            </div>
          </div>

          {/* Shop */}
          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/products">All Products</Link></li>
              {categories.map(c => (
                <li key={c.slug}><Link to={`/category/${c.slug}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Customer */}
          <div className="footer-col">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/account?tab=orders">My Orders</Link></li>
              <li><Link to="/account?tab=addresses">My Addresses</Link></li>
              <li><Link to="/account?tab=referral">Referral Program</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Contact Us</h4>
            <div className="contact-item">
              <Phone size={14} />
              <a href={`tel:${g.phone}`}>{g.phone}</a>
            </div>
            {g.email && (
              <div className="contact-item">
                <Mail size={14} />
                <a href={`mailto:${g.email}`}>{g.email}</a>
              </div>
            )}
            {g.address && (
              <div className="contact-item">
                <MapPin size={14} />
                <span>{g.address}</span>
              </div>
            )}
            <div style={{ marginTop: 20 }}>
              <a
                href={`https://wa.me/${(g.whatsapp || '917418701120').replace(/\D/g, '')}?text=Hi, I have a question about Zaina Boutique`}
                className="whatsapp-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: '0.8rem' }}>© {year} {g.site_name || 'Zaina Boutique'}. All rights reserved.</span>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>Secure payments · Fast delivery · Easy returns</span>
        </div>
      </div>

      <style>{`
        .footer-main { padding: 60px 0 40px; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 40px; }
        .footer-logo { font-family: var(--font-display); font-size: 1.6rem; color: var(--color-primary); }
        .social-icon { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); transition: all 0.2s; }
        .social-icon:hover { background: var(--color-primary); color: #fff; }
        .footer-col h4 { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.9); margin-bottom: 20px; }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-col ul li a { color: rgba(255,255,255,0.55); font-size: 0.875rem; transition: color 0.2s; }
        .footer-col ul li a:hover { color: var(--color-primary); }
        .contact-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.875rem; color: rgba(255,255,255,0.55); }
        .contact-item a { color: rgba(255,255,255,0.55); transition: color 0.2s; }
        .contact-item a:hover { color: var(--color-primary); }
        .whatsapp-btn { display: inline-flex; align-items: center; gap: 8px; background: #25d366; color: #fff; padding: 10px 18px; border-radius: 6px; font-size: 0.875rem; font-weight: 600; transition: all 0.2s; }
        .whatsapp-btn:hover { background: #20bb5a; transform: translateY(-1px); }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.07); padding: 18px 0; }
        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .footer-grid { grid-template-columns: 1fr; } }
      `}</style>
    </footer>
  );
}
