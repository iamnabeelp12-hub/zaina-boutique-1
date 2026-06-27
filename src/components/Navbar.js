import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, Heart, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSite } from '../context/SiteContext';
import { supabase } from '../supabaseClient';

export default function Navbar() {
  const { customer, signOut } = useAuth();
  const { totalItems } = useCart();
  const { settings } = useSite();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true).order('display_order').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className={`navbar${scrolled ? ' scrolled' : ''}`} style={{ background: settings.colors?.nav_bg }}>
        {/* Top bar */}
        <div className="navbar-top">
          <div className="container">
            <span>✨ Free shipping on orders above ₹{settings.general?.free_shipping_above || 999}</span>
            <span>📞 {settings.general?.phone || '+917418701120'}</span>
          </div>
        </div>

        {/* Main nav */}
        <div className="navbar-main">
          <div className="container navbar-inner">
            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <span className="logo-text">{settings.general?.site_name || 'Zaina Boutique'}</span>
              <span className="logo-sub">{settings.general?.tagline || 'Elegance Redefined'}</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="navbar-links">
              <Link to="/" className="nav-link">Home</Link>
              <div className="nav-dropdown">
                <span className="nav-link">Categories <ChevronDown size={14} /></span>
                <div className="dropdown-menu">
                  <Link to="/products" className="dropdown-item">All Products</Link>
                  {categories.map(c => (
                    <Link key={c.id} to={`/category/${c.slug}`} className="dropdown-item">{c.name}</Link>
                  ))}
                </div>
              </div>
              <Link to="/products" className="nav-link">Shop</Link>
            </nav>

            {/* Actions */}
            <div className="navbar-actions">
              <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
                <Search size={20} />
              </button>

              <div className="user-menu-wrap">
                <button className="icon-btn" onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="Account">
                  <User size={20} />
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    {customer ? (
                      <>
                        <div className="user-dropdown-name">Hi, {customer.name?.split(' ')[0]}</div>
                        <Link to="/account" onClick={() => setUserMenuOpen(false)}>My Account</Link>
                        <Link to="/account?tab=orders" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                        <Link to="/account?tab=referral" onClick={() => setUserMenuOpen(false)}>My Referrals</Link>
                        <button onClick={() => { signOut(); setUserMenuOpen(false); }}>Sign Out</button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setUserMenuOpen(false)}>Sign In</Link>
                        <Link to="/register" onClick={() => setUserMenuOpen(false)}>Register</Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
                <ShoppingBag size={20} />
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>

              <button className="icon-btn mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="search-bar-wrap">
            <div className="container">
              <form onSubmit={handleSearch} className="search-form">
                <Search size={18} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search</button>
                <button type="button" onClick={() => setSearchOpen(false)}><X size={18} /></button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mobile-menu">
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)}>All Products</Link>
            {categories.map(c => (
              <Link key={c.id} to={`/category/${c.slug}`} onClick={() => setMenuOpen(false)}>— {c.name}</Link>
            ))}
            {customer ? (
              <>
                <Link to="/account" onClick={() => setMenuOpen(false)}>My Account</Link>
                <button onClick={() => { signOut(); setMenuOpen(false); }}>Sign Out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In / Register</Link>
            )}
            <Link to="/cart" onClick={() => setMenuOpen(false)}>
              Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
          </div>
        )}
      </header>

      {/* Overlay */}
      {(menuOpen || userMenuOpen) && (
        <div className="nav-overlay" onClick={() => { setMenuOpen(false); setUserMenuOpen(false); }} />
      )}

      {/* WhatsApp Float */}
      <a
        href={`https://wa.me/${(settings.general?.whatsapp || '+917418701120').replace(/\D/g, '')}`}
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      <style>{`
        .navbar { position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 20px rgba(0,0,0,0.15); }
        .navbar-top { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); font-size: 0.78rem; padding: 6px 0; }
        .navbar-top .container { display: flex; justify-content: space-between; align-items: center; }
        .navbar-main { padding: 0; }
        .navbar-inner { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; gap: 20px; }
        .navbar-logo { display: flex; flex-direction: column; }
        .logo-text { font-family: var(--font-display); font-size: 1.7rem; color: var(--color-primary); font-weight: 700; line-height: 1; }
        .logo-sub { font-size: 0.65rem; color: rgba(255,255,255,0.5); letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
        .navbar-links { display: flex; align-items: center; gap: 28px; }
        .nav-link { color: rgba(255,255,255,0.85); font-size: 0.88rem; font-weight: 500; letter-spacing: 0.5px; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: color 0.2s; }
        .nav-link:hover { color: var(--color-primary); }
        .nav-dropdown { position: relative; }
        .nav-dropdown:hover .dropdown-menu { opacity: 1; visibility: visible; transform: translateY(0); }
        .dropdown-menu { position: absolute; top: 100%; left: 0; background: #fff; min-width: 200px; border-radius: 8px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); padding: 8px 0; opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all 0.2s; z-index: 200; }
        .dropdown-item { display: block; padding: 10px 20px; color: var(--color-text); font-size: 0.88rem; transition: background 0.15s; }
        .dropdown-item:hover { background: var(--color-accent); color: var(--color-primary); }
        .navbar-actions { display: flex; align-items: center; gap: 12px; }
        .icon-btn { background: none; padding: 6px; color: rgba(255,255,255,0.85); display: flex; align-items: center; position: relative; transition: color 0.2s; }
        .icon-btn:hover { color: var(--color-primary); }
        .cart-badge { position: absolute; top: -4px; right: -6px; background: var(--color-primary); color: #fff; font-size: 0.65rem; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .mobile-menu-btn { display: none; }
        .search-bar-wrap { background: #fff; border-top: 1px solid #f0ebe4; padding: 12px 0; }
        .search-form { display: flex; align-items: center; gap: 12px; background: #f7f3ef; border-radius: 8px; padding: 10px 16px; }
        .search-form input { flex: 1; background: none; border: none; font-size: 0.95rem; }
        .search-form button { background: none; color: var(--color-primary); font-weight: 600; font-size: 0.875rem; }
        .user-menu-wrap { position: relative; }
        .user-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border-radius: 8px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); min-width: 180px; padding: 8px 0; z-index: 200; }
        .user-dropdown-name { padding: 10px 16px 6px; font-size: 0.8rem; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f0ebe4; margin-bottom: 4px; }
        .user-dropdown a, .user-dropdown button { display: block; width: 100%; text-align: left; padding: 9px 16px; font-size: 0.875rem; color: var(--color-text); background: none; transition: background 0.15s; }
        .user-dropdown a:hover, .user-dropdown button:hover { background: var(--color-accent); color: var(--color-primary); }
        .mobile-menu { display: none; flex-direction: column; padding: 0; background: #111; }
        .mobile-menu a, .mobile-menu button { padding: 14px 20px; color: rgba(255,255,255,0.85); font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: left; background: none; width: 100%; }
        .nav-overlay { position: fixed; inset: 0; z-index: 99; }
        @media (max-width: 900px) {
          .navbar-links { display: none; }
          .mobile-menu-btn { display: flex; }
          .mobile-menu { display: flex; }
        }
        @media (max-width: 480px) {
          .navbar-top .container span:last-child { display: none; }
          .logo-text { font-size: 1.4rem; }
        }
      `}</style>
    </>
  );
}
