import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ShoppingCart, Image, Users, Palette, Search, Share2, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ADMIN_PATH = process.env.REACT_APP_ADMIN_SECRET_PATH || 'zainab-secure-admin-2024';

const NAV = [
  { path: '', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { path: 'products', label: 'Products', icon: <Package size={16} /> },
  { path: 'categories', label: 'Categories', icon: <Tag size={16} /> },
  { path: 'orders', label: 'Orders', icon: <ShoppingCart size={16} /> },
  { path: 'banners', label: 'Banners', icon: <Image size={16} /> },
  { path: 'customers', label: 'Customers', icon: <Users size={16} /> },
  { path: 'referrals', label: 'Referrals', icon: <Share2 size={16} /> },
  { path: 'customize', label: 'Customization', icon: <Palette size={16} /> },
  { path: 'seo', label: 'SEO Settings', icon: <Search size={16} /> },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    sessionStorage.removeItem('zaina_admin');
    await supabase.auth.signOut();
    navigate(`/${ADMIN_PATH}/login`);
  };

  const isActive = (path) => {
    const full = `/${ADMIN_PATH}/${path}`;
    if (path === '') return location.pathname === `/${ADMIN_PATH}` || location.pathname === `/${ADMIN_PATH}/`;
    return location.pathname.startsWith(full);
  };

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? '' : ' collapsed'}`}>
        <div className="admin-sidebar-header">
          {sidebarOpen && (
            <div>
              <div className="admin-logo">Zaina Boutique</div>
              <div className="admin-logo-sub">Admin Panel</div>
            </div>
          )}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="admin-nav">
          {NAV.map(n => (
            <Link key={n.path} to={`/${ADMIN_PATH}/${n.path}`} className={`admin-nav-item${isActive(n.path) ? ' active' : ''}`} title={!sidebarOpen ? n.label : ''}>
              <span className="nav-icon">{n.icon}</span>
              {sidebarOpen && <span className="nav-label">{n.label}</span>}
              {sidebarOpen && isActive(n.path) && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" target="_blank" className="admin-nav-item" style={{ fontSize: '0.8rem' }} title="View Site">
            <span className="nav-icon">🌐</span>
            {sidebarOpen && <span className="nav-label">View Site</span>}
          </Link>
          <button className="admin-nav-item logout-btn" onClick={handleLogout} title="Logout">
            <span className="nav-icon"><LogOut size={16} /></span>
            {sidebarOpen && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-content">{children}</div>
      </main>

      <style>{`
        * { box-sizing: border-box; }
        .admin-shell { display: flex; min-height: 100vh; background: #0f0f0f; font-family: 'Inter', sans-serif; }
        .admin-sidebar { width: 240px; background: #141414; border-right: 1px solid #222; display: flex; flex-direction: column; transition: width 0.25s ease; flex-shrink: 0; }
        .admin-sidebar.collapsed { width: 60px; }
        .admin-sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 16px 16px; border-bottom: 1px solid #222; min-height: 72px; }
        .admin-logo { font-size: 1rem; font-weight: 700; color: #c8a96e; white-space: nowrap; overflow: hidden; }
        .admin-logo-sub { font-size: 0.68rem; color: #555; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; }
        .sidebar-toggle { background: none; border: none; color: #555; cursor: pointer; padding: 4px; display: flex; align-items: center; border-radius: 6px; flex-shrink: 0; }
        .sidebar-toggle:hover { color: #c8a96e; background: #222; }
        .admin-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
        .admin-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #888; font-size: 0.82rem; font-weight: 500; text-decoration: none; border: none; background: none; cursor: pointer; width: 100%; transition: all 0.15s; white-space: nowrap; overflow: hidden; }
        .admin-nav-item:hover { background: #1f1f1f; color: #ddd; }
        .admin-nav-item.active { background: #c8a96e18; color: #c8a96e; }
        .nav-icon { flex-shrink: 0; display: flex; align-items: center; }
        .nav-label { flex: 1; }
        .admin-sidebar-footer { padding: 12px 8px; border-top: 1px solid #222; display: flex; flex-direction: column; gap: 2px; }
        .logout-btn { color: #ef4444 !important; }
        .logout-btn:hover { background: #1f0f0f !important; }
        .admin-main { flex: 1; overflow-x: hidden; }
        .admin-content { padding: 28px; max-width: 1200px; }
        @media (max-width: 768px) {
          .admin-sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 200; }
          .admin-sidebar.collapsed { width: 0; padding: 0; overflow: hidden; }
          .admin-main { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}
