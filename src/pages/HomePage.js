import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useSite } from '../context/SiteContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

export default function HomePage() {
  const { settings } = useSite();
  const { addToCart } = useCart();
  const [heroBanners, setHeroBanners] = useState([]);
  const [offerBanners, setOfferBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [{ data: banners }, { data: cats }, { data: prods }] = await Promise.all([
        supabase.from('banners').select('*').eq('is_active', true).order('display_order'),
        supabase.from('categories').select('*').eq('is_active', true).order('display_order').limit(6),
        supabase.from('products').select('*').eq('is_active', true).eq('is_featured', true).limit(8),
      ]);
      if (banners) {
        setHeroBanners(banners.filter(b => b.type === 'hero'));
        setOfferBanners(banners.filter(b => b.type === 'offer'));
      }
      if (cats) setCategories(cats);
      if (prods) setFeatured(prods);
    };
    load();
  }, []);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroBanners.length), 5000);
    return () => clearInterval(t);
  }, [heroBanners]);

  const g = settings.general || {};
  const seo = settings.seo || {};
  const sym = g.currency_symbol || '₹';

  return (
    <>
      <Helmet>
        <title>{seo.site_title || 'Zaina Boutique - Premium Fashion'}</title>
        <meta name="description" content={seo.meta_description || ''} />
        <meta name="keywords" content={seo.meta_keywords || ''} />
      </Helmet>

      {/* HERO */}
      {heroBanners.length > 0 ? (
        <section className="hero-section">
          {heroBanners.map((b, i) => (
            <div key={b.id} className={`hero-slide${i === heroIdx ? ' active' : ''}`}>
              <img src={b.image_url} alt={b.title} />
              <div className="hero-overlay">
                <div className="hero-content">
                  <p className="hero-eyebrow">New Collection</p>
                  <h1>{b.title}</h1>
                  <p className="hero-sub">{b.subtitle}</p>
                  <div className="hero-btns">
                    {b.link && <Link to={b.link} className="btn-primary">{b.button_text || 'Shop Now'} <ArrowRight size={16} /></Link>}
                    <Link to="/products" className="btn-hero-outline">View All</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {heroBanners.length > 1 && (
            <div className="hero-dots">
              {heroBanners.map((_, i) => (
                <button key={i} className={`dot${i === heroIdx ? ' active' : ''}`} onClick={() => setHeroIdx(i)} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="hero-section hero-default">
          <div className="hero-content">
            <p className="hero-eyebrow">Welcome to</p>
            <h1>{g.site_name || 'Zaina Boutique'}</h1>
            <p className="hero-sub">{g.tagline || 'Elegance Redefined'}</p>
            <div className="hero-btns">
              <Link to="/products" className="btn-primary">Shop Now <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* TRUST BADGES */}
      <section className="trust-bar">
        <div className="container trust-grid">
          {[
            { icon: <Truck size={22} />, title: `Free Shipping`, sub: `On orders above ${sym}${g.free_shipping_above || 999}` },
            { icon: <Shield size={22} />, title: 'Secure Payment', sub: 'Safe & encrypted checkout' },
            { icon: <RefreshCw size={22} />, title: 'Easy Returns', sub: '7-day hassle-free returns' },
            { icon: <Star size={22} />, title: 'Premium Quality', sub: 'Curated fashion picks' },
          ].map((t, i) => (
            <div key={i} className="trust-item">
              <div className="trust-icon">{t.icon}</div>
              <div><div className="trust-title">{t.title}</div><div className="trust-sub">{t.sub}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Shop by Category</h2>
              <p>Explore our curated collections</p>
              <div className="divider" />
            </div>
            <div className="cat-grid">
              {categories.map(c => (
                <Link key={c.id} to={`/category/${c.slug}`} className="cat-card">
                  <div className="cat-img">
                    {c.image_url
                      ? <img src={c.image_url} alt={c.name} />
                      : <div className="cat-placeholder">{c.name[0]}</div>
                    }
                  </div>
                  <div className="cat-name">{c.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* OFFER BANNERS */}
      {offerBanners.length > 0 && (
        <section className="offer-section">
          <div className="container">
            <div className="offer-grid">
              {offerBanners.slice(0, 2).map(b => (
                <Link key={b.id} to={b.link || '/products'} className="offer-card">
                  <img src={b.image_url} alt={b.title} />
                  <div className="offer-content">
                    <h3>{b.title}</h3>
                    <p>{b.subtitle}</p>
                    <span className="offer-btn">{b.button_text || 'Shop Now'} →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="section" style={{ background: '#fff' }}>
          <div className="container">
            <div className="section-header">
              <h2>Featured Products</h2>
              <p>Handpicked favorites just for you</p>
              <div className="divider" />
            </div>
            <div className="products-grid">
              {featured.map(p => (
                <ProductCard key={p.id} product={p} sym={sym} onAddCart={() => { addToCart(p); toast.success('Added to cart!'); }} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link to="/products" className="btn-outline-gold">View All Products <ArrowRight size={15} /></Link>
            </div>
          </div>
        </section>
      )}

      <style>{`
        /* HERO */
        .hero-section { position: relative; height: 80vh; min-height: 500px; overflow: hidden; background: var(--color-secondary); }
        .hero-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.8s ease; }
        .hero-slide.active { opacity: 1; }
        .hero-slide img { width: 100%; height: 100%; object-fit: cover; }
        .hero-default { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a1a 0%, #2d2020 100%); }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 100%); display: flex; align-items: center; }
        .hero-content { color: #fff; padding: 0 60px; max-width: 600px; }
        .hero-default .hero-content { padding: 40px; text-align: center; }
        .hero-eyebrow { font-size: 0.8rem; letter-spacing: 3px; text-transform: uppercase; color: var(--color-primary); margin-bottom: 16px; }
        .hero-content h1 { font-family: var(--font-display); font-size: 3.5rem; line-height: 1.1; margin-bottom: 16px; }
        .hero-sub { font-size: 1.05rem; color: rgba(255,255,255,0.75); margin-bottom: 32px; line-height: 1.6; }
        .hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn-hero-outline { border: 2px solid rgba(255,255,255,0.5); color: #fff; padding: 12px 28px; border-radius: var(--radius); font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
        .btn-hero-outline:hover { border-color: #fff; background: rgba(255,255,255,0.1); }
        .hero-dots { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.4); border: none; cursor: pointer; transition: all 0.2s; }
        .dot.active { background: var(--color-primary); width: 24px; border-radius: 4px; }

        /* TRUST */
        .trust-bar { background: var(--color-accent); border-bottom: 1px solid #f0e8dc; }
        .trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); padding: 20px 0; }
        .trust-item { display: flex; align-items: center; gap: 14px; padding: 16px; border-right: 1px solid rgba(0,0,0,0.06); }
        .trust-item:last-child { border-right: none; }
        .trust-icon { color: var(--color-primary); flex-shrink: 0; }
        .trust-title { font-weight: 600; font-size: 0.875rem; margin-bottom: 2px; }
        .trust-sub { font-size: 0.78rem; color: #888; }

        /* CATEGORIES */
        .section { padding: 64px 0; }
        .cat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
        .cat-card { display: flex; flex-direction: column; align-items: center; gap: 10px; text-decoration: none; }
        .cat-img { width: 110px; height: 110px; border-radius: 50%; overflow: hidden; border: 3px solid transparent; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .cat-card:hover .cat-img { border-color: var(--color-primary); transform: translateY(-4px); }
        .cat-img img { width: 100%; height: 100%; object-fit: cover; }
        .cat-placeholder { width: 100%; height: 100%; background: var(--color-accent); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 2rem; color: var(--color-primary); }
        .cat-name { font-size: 0.85rem; font-weight: 600; color: var(--color-text); text-align: center; }

        /* OFFERS */
        .offer-section { padding: 40px 0; }
        .offer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .offer-card { position: relative; border-radius: 12px; overflow: hidden; height: 280px; display: block; }
        .offer-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .offer-card:hover img { transform: scale(1.04); }
        .offer-content { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%); display: flex; flex-direction: column; justify-content: flex-end; padding: 28px; color: #fff; }
        .offer-content h3 { font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 6px; }
        .offer-content p { font-size: 0.875rem; opacity: 0.8; margin-bottom: 14px; }
        .offer-btn { display: inline-block; background: var(--color-primary); padding: 8px 20px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; }

        @media (max-width: 900px) {
          .trust-grid { grid-template-columns: repeat(2,1fr); }
          .cat-grid { grid-template-columns: repeat(3,1fr); }
          .offer-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .hero-content { padding: 0 24px; }
          .hero-content h1 { font-size: 2.2rem; }
          .cat-grid { grid-template-columns: repeat(3,1fr); gap: 10px; }
          .cat-img { width: 80px; height: 80px; }
        }
      `}</style>
    </>
  );
}

function ProductCard({ product: p, sym, onAddCart }) {
  const discount = p.compare_price ? Math.round((1 - p.price / p.compare_price) * 100) : 0;
  const img = p.images?.[0] || '';
  return (
    <div className="product-card">
      <Link to={`/products/${p.slug}`}>
        <div className="image-wrap">
          {img ? <img src={img} alt={p.name} loading="lazy" /> : <div style={{ width: '100%', height: '100%', background: '#f5ede4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>👗</div>}
          {discount > 0 && <span className="badge sale">{discount}% OFF</span>}
          {p.is_featured && !discount && <span className="badge">New</span>}
        </div>
        <div className="card-body">
          <h3>{p.name}</h3>
          <div className="price">
            {sym}{p.price?.toLocaleString('en-IN')}
            {p.compare_price && <span className="compare">{sym}{p.compare_price?.toLocaleString('en-IN')}</span>}
          </div>
        </div>
      </Link>
      <div className="card-actions">
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: '0.82rem' }} onClick={onAddCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
