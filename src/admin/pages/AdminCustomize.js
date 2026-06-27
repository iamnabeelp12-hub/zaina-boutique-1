import React, { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { toast } from 'react-toastify';

const DEFAULT_COLORS = {
  primary: '#c8a96e',
  secondary: '#1a1a1a',
  accent: '#f5e6d3',
  text: '#2d2d2d',
  background: '#fff9f5',
  nav_bg: '#1a1a1a',
  footer_bg: '#1a1a1a',
};

const COLOR_LABELS = {
  primary: 'Primary / Gold (buttons, accents)',
  secondary: 'Secondary (headings, navbar text)',
  accent: 'Accent (backgrounds, highlights)',
  text: 'Body Text Color',
  background: 'Page Background',
  nav_bg: 'Navbar Background',
  footer_bg: 'Footer Background',
};

export default function AdminCustomize() {
  const { settings, updateSettings } = useSite();
  const [colors, setColors] = useState({ ...DEFAULT_COLORS, ...settings.colors });
  const [general, setGeneral] = useState({ ...settings.general });
  const [social, setSocial] = useState({ ...settings.social });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');

  const handleColorChange = (key, val) => {
    setColors(c => ({ ...c, [key]: val }));
    // Live preview
    document.documentElement.style.setProperty(`--color-${key.replace(/_/g, '-')}`, val);
  };

  const resetColors = () => {
    setColors(DEFAULT_COLORS);
    Object.entries(DEFAULT_COLORS).forEach(([k, v]) => {
      document.documentElement.style.setProperty(`--color-${k.replace(/_/g, '-')}`, v);
    });
    toast.info('Colors reset to defaults (not saved yet)');
  };

  const saveAll = async () => {
    setSaving(true);
    const results = await Promise.all([
      updateSettings('colors', colors),
      updateSettings('general', general),
      updateSettings('social', social),
    ]);
    const hasError = results.some(r => r.error);
    if (hasError) toast.error('Some settings failed to save');
    else toast.success('All settings saved!');
    setSaving(false);
  };

  const TABS = ['colors', 'general', 'social'];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Site Customization</h1>
          <span className="admin-page-sub">Change colors, branding, and site details</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-btn-ghost" onClick={resetColors}><RotateCcw size={14} /> Reset Colors</button>
          <button className="admin-btn-primary" onClick={saveAll} disabled={saving}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="cust-tabs">
        {TABS.map(t => (
          <button key={t} className={`cust-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'colors' ? '🎨 Colors' : t === 'general' ? '⚙️ General' : '🔗 Social Links'}
          </button>
        ))}
      </div>

      {/* COLORS */}
      {activeTab === 'colors' && (
        <div className="admin-card" style={{ padding: 28 }}>
          <h3 className="admin-section-title">Color Scheme</h3>
          <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: 24 }}>Changes are previewed live on the site. Click "Save All Changes" to make them permanent.</p>

          <div className="color-grid">
            {Object.entries(COLOR_LABELS).map(([key, label]) => (
              <div key={key} className="color-row">
                <div className="color-preview-swatch" style={{ background: colors[key] }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#ddd', fontSize: '0.82rem', fontWeight: 500, marginBottom: 4 }}>{label}</div>
                  <div style={{ color: '#555', fontSize: '0.72rem', fontFamily: 'monospace' }}>{colors[key]}</div>
                </div>
                <input
                  type="color"
                  value={colors[key]}
                  onChange={e => handleColorChange(key, e.target.value)}
                  className="color-picker-input"
                />
              </div>
            ))}
          </div>

          {/* Preset Themes */}
          <div style={{ marginTop: 32 }}>
            <div className="admin-section-title" style={{ marginBottom: 16 }}>Quick Themes</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { name: 'Gold & Black', colors: { primary: '#c8a96e', secondary: '#1a1a1a', accent: '#f5e6d3', text: '#2d2d2d', background: '#fff9f5', nav_bg: '#1a1a1a', footer_bg: '#1a1a1a' } },
                { name: 'Rose & Cream', colors: { primary: '#c97b8a', secondary: '#2d1a1f', accent: '#fdf0f2', text: '#3d2530', background: '#fffbfc', nav_bg: '#2d1a1f', footer_bg: '#2d1a1f' } },
                { name: 'Emerald', colors: { primary: '#2e7d6b', secondary: '#1a2a26', accent: '#e8f5f2', text: '#1a3028', background: '#f5faf8', nav_bg: '#1a2a26', footer_bg: '#1a2a26' } },
                { name: 'Deep Purple', colors: { primary: '#7c4daf', secondary: '#1a1228', accent: '#f3edf9', text: '#2d1f45', background: '#faf8fd', nav_bg: '#1a1228', footer_bg: '#1a1228' } },
                { name: 'Rust & Sand', colors: { primary: '#c2622c', secondary: '#2a1a0e', accent: '#fdf4ec', text: '#2a1a0e', background: '#fffbf7', nav_bg: '#2a1a0e', footer_bg: '#2a1a0e' } },
              ].map(theme => (
                <button
                  key={theme.name}
                  className="theme-btn"
                  onClick={() => {
                    setColors(theme.colors);
                    Object.entries(theme.colors).forEach(([k, v]) => {
                      document.documentElement.style.setProperty(`--color-${k.replace(/_/g, '-')}`, v);
                    });
                    toast.info(`"${theme.name}" theme applied — save to keep`);
                  }}
                >
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                    {[theme.colors.nav_bg, theme.colors.primary, theme.colors.accent].map((c, i) => (
                      <div key={i} style={{ width: 16, height: 16, borderRadius: 4, background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GENERAL */}
      {activeTab === 'general' && (
        <div className="admin-card" style={{ padding: 28 }}>
          <h3 className="admin-section-title">General Settings</h3>
          <div className="aform-row">
            <div className="aform-group">
              <label>Site Name</label>
              <input value={general.site_name || ''} onChange={e => setGeneral(g => ({ ...g, site_name: e.target.value }))} placeholder="Zaina Boutique" />
            </div>
            <div className="aform-group">
              <label>Tagline</label>
              <input value={general.tagline || ''} onChange={e => setGeneral(g => ({ ...g, tagline: e.target.value }))} placeholder="Elegance Redefined" />
            </div>
          </div>
          <div className="aform-row">
            <div className="aform-group">
              <label>WhatsApp Number (with country code)</label>
              <input value={general.whatsapp || ''} onChange={e => setGeneral(g => ({ ...g, whatsapp: e.target.value }))} placeholder="+917418701120" />
            </div>
            <div className="aform-group">
              <label>Phone (displayed in header)</label>
              <input value={general.phone || ''} onChange={e => setGeneral(g => ({ ...g, phone: e.target.value }))} placeholder="+91 74187 01120" />
            </div>
          </div>
          <div className="aform-row">
            <div className="aform-group">
              <label>Contact Email</label>
              <input type="email" value={general.email || ''} onChange={e => setGeneral(g => ({ ...g, email: e.target.value }))} placeholder="contact@zainaboutique.com" />
            </div>
            <div className="aform-group">
              <label>Currency Symbol</label>
              <input value={general.currency_symbol || '₹'} onChange={e => setGeneral(g => ({ ...g, currency_symbol: e.target.value }))} placeholder="₹" />
            </div>
          </div>
          <div className="aform-row">
            <div className="aform-group">
              <label>Free Shipping Above (₹)</label>
              <input type="number" value={general.free_shipping_above || 999} onChange={e => setGeneral(g => ({ ...g, free_shipping_above: parseInt(e.target.value) }))} />
            </div>
            <div className="aform-group">
              <label>Referral Commission % (default)</label>
              <input type="number" min="0" max="50" step="0.5" value={general.default_commission || 5} onChange={e => setGeneral(g => ({ ...g, default_commission: parseFloat(e.target.value) }))} />
            </div>
          </div>
          <div className="aform-group">
            <label>Business Address</label>
            <input value={general.address || ''} onChange={e => setGeneral(g => ({ ...g, address: e.target.value }))} placeholder="Full business address" />
          </div>
        </div>
      )}

      {/* SOCIAL */}
      {activeTab === 'social' && (
        <div className="admin-card" style={{ padding: 28 }}>
          <h3 className="admin-section-title">Social Media Links</h3>
          <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: 24 }}>Full URLs to your social pages (shown in footer)</p>
          {[
            { key: 'instagram', label: '📸 Instagram', placeholder: 'https://instagram.com/zainaboutique' },
            { key: 'facebook', label: '📘 Facebook', placeholder: 'https://facebook.com/zainaboutique' },
            { key: 'youtube', label: '▶️ YouTube', placeholder: 'https://youtube.com/@zainaboutique' },
            { key: 'twitter', label: '🐦 Twitter / X', placeholder: 'https://x.com/zainaboutique' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="aform-group">
              <label>{label}</label>
              <input value={social[key] || ''} onChange={e => setSocial(s => ({ ...s, [key]: e.target.value }))} placeholder={placeholder} />
            </div>
          ))}
        </div>
      )}

      <style>{`
        .admin-page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px}
        .admin-page-title{color:#fff;font-size:1.4rem;font-weight:700;margin-bottom:2px}
        .admin-page-sub{color:#555;font-size:.82rem}
        .admin-btn-primary{display:flex;align-items:center;gap:8px;padding:9px 18px;background:#c8a96e;color:#fff;border-radius:8px;font-size:.82rem;font-weight:600;border:none;cursor:pointer}
        .admin-btn-primary:hover{background:#b8945a}
        .admin-btn-primary:disabled{opacity:.6;cursor:not-allowed}
        .admin-btn-ghost{display:flex;align-items:center;gap:8px;padding:9px 18px;background:#1a1a1a;color:#888;border:1px solid #2a2a2a;border-radius:8px;font-size:.82rem;cursor:pointer}
        .admin-btn-ghost:hover{color:#ddd;border-color:#444}
        .admin-card{background:#141414;border:1px solid #222;border-radius:12px;overflow:hidden}
        .admin-section-title{color:#ccc;font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:18px}
        .cust-tabs{display:flex;gap:4px;margin-bottom:20px;background:#141414;border:1px solid #222;border-radius:10px;padding:4px;width:fit-content}
        .cust-tab{padding:8px 18px;border-radius:7px;border:none;background:transparent;color:#666;font-size:.82rem;cursor:pointer;transition:all .15s;font-family:inherit}
        .cust-tab.active{background:#222;color:#c8a96e}
        .color-grid{display:flex;flex-direction:column;gap:14px}
        .color-row{display:flex;align-items:center;gap:16px;padding:12px 16px;background:#111;border:1px solid #1e1e1e;border-radius:10px}
        .color-preview-swatch{width:44px;height:44px;border-radius:8px;flex-shrink:0;border:2px solid rgba(255,255,255,0.06)}
        .color-picker-input{width:48px;height:48px;border-radius:8px;border:2px solid #2a2a2a;cursor:pointer;padding:2px;background:#111}
        .theme-btn{display:flex;flex-direction:column;align-items:center;padding:12px 16px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;cursor:pointer;transition:all .2s;color:#888;font-size:.75rem;font-family:inherit}
        .theme-btn:hover{border-color:#c8a96e44;color:#c8a96e;background:#1e1e1e}
        .aform-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .aform-group{margin-bottom:16px}
        .aform-group label{display:block;color:#777;font-size:.78rem;margin-bottom:6px}
        .aform-group input{width:100%;padding:10px 13px;background:#111;border:1px solid #2a2a2a;border-radius:8px;color:#ddd;font-size:.875rem;outline:none;box-sizing:border-box;transition:border-color .2s}
        .aform-group input:focus{border-color:#c8a96e44}
        @media(max-width:640px){.aform-row{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
