import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { toast } from 'react-toastify';

export default function AdminSEO() {
  const { settings, updateSettings } = useSite();
  const [seo, setSeo] = useState({ ...settings.seo });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await updateSettings('seo', seo);
    if (error) toast.error('Failed to save SEO settings');
    else toast.success('SEO settings saved!');
    setSaving(false);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">SEO Settings</h1>
          <span className="admin-page-sub">Optimise your site for search engines</span>
        </div>
        <button className="admin-btn-primary" onClick={save} disabled={saving}>
          <Save size={14} /> {saving ? 'Saving...' : 'Save SEO Settings'}
        </button>
      </div>

      <div className="admin-card" style={{ padding: 28, marginBottom: 20 }}>
        <h3 className="admin-section-title">Basic SEO</h3>
        <div className="aform-group">
          <label>Site Title (shown in browser tab)</label>
          <input value={seo.site_title || ''} onChange={e => setSeo(s => ({ ...s, site_title: e.target.value }))} placeholder="Zaina Boutique - Premium Fashion" maxLength={70} />
          <div className="char-count">{(seo.site_title || '').length}/70 characters</div>
        </div>
        <div className="aform-group">
          <label>Meta Description (shown in Google results)</label>
          <textarea rows={3} value={seo.meta_description || ''} onChange={e => setSeo(s => ({ ...s, meta_description: e.target.value }))} placeholder="Discover the latest fashion trends at Zaina Boutique. Shop premium clothing, accessories and more." maxLength={160} style={{ width: '100%', padding: '10px 13px', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, color: '#ddd', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          <div className="char-count">{(seo.meta_description || '').length}/160 characters</div>
        </div>
        <div className="aform-group">
          <label>Meta Keywords (comma-separated)</label>
          <input value={seo.meta_keywords || ''} onChange={e => setSeo(s => ({ ...s, meta_keywords: e.target.value }))} placeholder="fashion, boutique, women, clothing, saree, kurta, india" />
        </div>
      </div>

      <div className="admin-card" style={{ padding: 28, marginBottom: 20 }}>
        <h3 className="admin-section-title">Open Graph (Social Sharing)</h3>
        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: 20 }}>Controls how your site looks when shared on WhatsApp, Facebook, etc.</p>
        <div className="aform-group">
          <label>OG Image URL (1200×630px recommended)</label>
          <input value={seo.og_image || ''} onChange={e => setSeo(s => ({ ...s, og_image: e.target.value }))} placeholder="https://yourdomain.com/og-image.jpg" />
          {seo.og_image && <img src={seo.og_image} alt="OG preview" style={{ marginTop: 12, maxWidth: 300, borderRadius: 8, border: '1px solid #2a2a2a' }} />}
        </div>
        <div className="aform-group">
          <label>OG Title (defaults to Site Title if blank)</label>
          <input value={seo.og_title || ''} onChange={e => setSeo(s => ({ ...s, og_title: e.target.value }))} placeholder="Zaina Boutique - Premium Fashion" />
        </div>
      </div>

      <div className="admin-card" style={{ padding: 28 }}>
        <h3 className="admin-section-title">Analytics & Tracking</h3>
        <div className="aform-group">
          <label>Google Analytics Measurement ID</label>
          <input value={seo.google_analytics || ''} onChange={e => setSeo(s => ({ ...s, google_analytics: e.target.value }))} placeholder="G-XXXXXXXXXX" />
          <div className="field-hint">Get this from Google Analytics → Admin → Data Streams</div>
        </div>
        <div className="aform-group">
          <label>Facebook Pixel ID</label>
          <input value={seo.fb_pixel || ''} onChange={e => setSeo(s => ({ ...s, fb_pixel: e.target.value }))} placeholder="123456789012345" />
        </div>
        <div className="aform-group">
          <label>Google Search Console Verification Code</label>
          <input value={seo.google_verify || ''} onChange={e => setSeo(s => ({ ...s, google_verify: e.target.value }))} placeholder="Paste the content= value from the meta tag" />
        </div>
      </div>

      <style>{`
        .admin-page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px}
        .admin-page-title{color:#fff;font-size:1.4rem;font-weight:700;margin-bottom:2px}
        .admin-page-sub{color:#555;font-size:.82rem}
        .admin-btn-primary{display:flex;align-items:center;gap:8px;padding:9px 18px;background:#c8a96e;color:#fff;border-radius:8px;font-size:.82rem;font-weight:600;border:none;cursor:pointer}
        .admin-btn-primary:hover{background:#b8945a}
        .admin-btn-primary:disabled{opacity:.6;cursor:not-allowed}
        .admin-card{background:#141414;border:1px solid #222;border-radius:12px}
        .admin-section-title{color:#ccc;font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:18px}
        .aform-group{margin-bottom:20px}
        .aform-group label{display:block;color:#777;font-size:.78rem;margin-bottom:6px}
        .aform-group input{width:100%;padding:10px 13px;background:#111;border:1px solid #2a2a2a;border-radius:8px;color:#ddd;font-size:.875rem;outline:none;box-sizing:border-box;transition:border-color .2s;font-family:inherit}
        .aform-group input:focus{border-color:#c8a96e44}
        .char-count{font-size:.72rem;color:#444;margin-top:5px;text-align:right}
        .field-hint{font-size:.72rem;color:#444;margin-top:5px}
      `}</style>
    </div>
  );
}
