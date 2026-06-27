import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Share2, Check, ChevronRight, Minus, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { toast } from 'react-toastify';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { customer } = useAuth();
  const { settings } = useSite();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [refLink, setRefLink] = useState('');
  const [refCode, setRefCode] = useState('');
  const [related, setRelated] = useState([]);

  // Track referral visit
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('referral_code', ref);
      supabase.from('referral_links').select('id,clicks').eq('code', ref).single().then(({ data }) => {
        if (data) supabase.from('referral_links').update({ clicks: data.clicks + 1 }).eq('id', data.id);
      });
    }
  }, [location]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from('products').select('*, categories(name,slug)').eq('slug', slug).single();
      if (data) {
        setProduct(data);
        if (data.sizes?.length) setSelectedSize(data.sizes[0]);
        if (data.colors?.length) setSelectedColor(data.colors[0]);
        // Load related
        supabase.from('products').select('*').eq('category_id', data.category_id).neq('id', data.id).eq('is_active', true).limit(4).then(({ data: rel }) => {
          if (rel) setRelated(rel);
        });
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  useEffect(() => {
    if (!customer || !product) return;
    // Check if referral link exists
    supabase.from('referral_links').select('code').eq('customer_id', customer.id).eq('product_id', product.id).single().then(({ data }) => {
      if (data) {
        setRefCode(data.code);
        setRefLink(`${window.location.origin}/products/${product.slug}?ref=${data.code}`);
      }
    });
  }, [customer, product]);

  const generateRefLink = async () => {
    if (!customer) { toast.info('Please login to generate referral link'); return; }
    const code = `${customer.id.slice(0,8)}-${product.id.slice(0,8)}`;
    const { error } = await supabase.from('referral_links').upsert(
      { customer_id: customer.id, product_id: product.id, code, commission_percent: 5 },
      { onConflict: 'code' }
    );
    if (!error) {
      const link = `${window.location.origin}/products/${product.slug}?ref=${code}`;
      setRefCode(code);
      setRefLink(link);
      navigator.clipboard.writeText(link).then(() => toast.success('Referral link copied!'));
    }
  };

  const handleOrderNow = async () => {
    if (!customer) { toast.info('Please login to place order'); return; }
    const sym = settings.general?.currency_symbol || '₹';
    const productUrl = `${window.location.origin}/products/${product.slug}`;
    const msg = `🛍️ *New Order from Zaina Boutique*\n\n` +
      `👤 *Customer:* ${customer.name}\n` +
      `📧 *Email:* ${customer.email || 'N/A'}\n` +
      `📱 *Phone:* ${customer.phone || 'N/A'}\n\n` +
      `🏷️ *Product:* ${product.name}\n` +
      `💰 *Price:* ${sym}${product.price?.toLocaleString('en-IN')}\n` +
      `📦 *Qty:* ${qty}${selectedSize ? `\n👗 *Size:* ${selectedSize}` : ''}${selectedColor ? `\n🎨 *Color:* ${selectedColor}` : ''}\n\n` +
      `🔗 *Product Link:* ${productUrl}\n\n` +
      `Please confirm my order. Thank you! 🙏`;
    const wa = `https://wa.me/${(settings.general?.whatsapp || '917418701120').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(wa, '_blank');
    // Save order
    const refCode = localStorage.getItem('referral_code');
    await supabase.from('orders').insert({
      customer_id: customer.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone || '',
      shipping_address: {},
      items: [{ product_id: product.id, name: product.name, price: product.price, qty, size: selectedSize, color: selectedColor, image: product.images?.[0] }],
      subtotal: product.price * qty,
      total: product.price * qty,
      payment_method: 'whatsapp',
      referral_code: refCode || null,
    });
  };

  const handleAddCart = () => {
    addToCart(product, qty, selectedSize, selectedColor);
    toast.success('Added to cart!');
  };

  const shareProduct = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: product.name, url });
    else { navigator.clipboard.writeText(url); toast.success('Link copied!'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!product) return <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}><h2>Product not found</h2><Link to="/products" className="btn-primary" style={{ display: 'inline-flex', marginTop: 20 }}>Browse Products</Link></div>;

  const sym = settings.general?.currency_symbol || '₹';
  const discount = product.compare_price ? Math.round((1 - product.price / product.compare_price) * 100) : 0;

  return (
    <>
      <Helmet>
        <title>{product.meta_title || `${product.name} | Zaina Boutique`}</title>
        <meta name="description" content={product.meta_description || product.description?.slice(0, 160)} />
      </Helmet>

      <div className="container" style={{ padding: '20px' }}>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link><ChevronRight size={14} />
          <Link to="/products">Products</Link><ChevronRight size={14} />
          {product.categories && <><Link to={`/category/${product.categories.slug}`}>{product.categories.name}</Link><ChevronRight size={14} /></>}
          <span style={{ color: '#444' }}>{product.name}</span>
        </div>

        <div className="pd-grid">
          {/* Images */}
          <div className="pd-images">
            <div className="pd-main-img">
              {product.images?.[selectedImg]
                ? <img src={product.images[selectedImg]} alt={product.name} />
                : <div className="img-placeholder">👗</div>
              }
              {discount > 0 && <span className="pd-badge">{discount}% OFF</span>}
            </div>
            {product.images?.length > 1 && (
              <div className="pd-thumbs">
                {product.images.map((img, i) => (
                  <button key={i} className={`thumb${i === selectedImg ? ' active' : ''}`} onClick={() => setSelectedImg(i)}>
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="pd-details">
            {product.categories && <Link to={`/category/${product.categories.slug}`} className="pd-category">{product.categories.name}</Link>}
            <h1 className="pd-title">{product.name}</h1>

            <div className="pd-pricing">
              <span className="pd-price">{sym}{product.price?.toLocaleString('en-IN')}</span>
              {product.compare_price && <span className="pd-compare">{sym}{product.compare_price?.toLocaleString('en-IN')}</span>}
              {discount > 0 && <span className="pd-discount-badge">Save {discount}%</span>}
            </div>

            {product.description && <p className="pd-desc">{product.description}</p>}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="pd-option-group">
                <label>Size: <strong>{selectedSize}</strong></label>
                <div className="option-btns">
                  {product.sizes.map(s => (
                    <button key={s} className={`option-btn${selectedSize === s ? ' active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="pd-option-group">
                <label>Color: <strong>{selectedColor}</strong></label>
                <div className="option-btns">
                  {product.colors.map(c => (
                    <button key={c} className={`option-btn${selectedColor === c ? ' active' : ''}`} onClick={() => setSelectedColor(c)}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="pd-option-group">
              <label>Quantity</label>
              <div className="qty-control">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={16} /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}><Plus size={16} /></button>
              </div>
            </div>

            {/* Actions */}
            <div className="pd-actions">
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleOrderNow}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Order via WhatsApp
              </button>
              <button className="btn-secondary" onClick={handleAddCart}><ShoppingBag size={16} /> Add to Cart</button>
            </div>

            <button className="share-btn" onClick={shareProduct}><Share2 size={15} /> Share this product</button>

            {/* Referral */}
            <div className="referral-box">
              <div className="ref-header">
                <span>💸</span>
                <div>
                  <strong>Earn 5% Commission</strong>
                  <p>Share this product and earn when someone buys!</p>
                </div>
              </div>
              {refLink ? (
                <div className="ref-link-wrap">
                  <input readOnly value={refLink} />
                  <button onClick={() => { navigator.clipboard.writeText(refLink); toast.success('Copied!'); }}>
                    <Check size={14} /> Copy
                  </button>
                </div>
              ) : (
                <button className="btn-outline-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={generateRefLink}>
                  Generate My Referral Link
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section style={{ marginTop: 60 }}>
            <div className="section-header"><h2>You may also like</h2><div className="divider" /></div>
            <div className="products-grid">
              {related.map(p => (
                <div key={p.id} className="product-card">
                  <Link to={`/products/${p.slug}`}>
                    <div className="image-wrap" style={{ aspectRatio: '3/4' }}>
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} /> : <div style={{ width: '100%', height: '100%', background: '#f5ede4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>👗</div>}
                    </div>
                    <div className="card-body">
                      <h3>{p.name}</h3>
                      <div className="price">{sym}{p.price?.toLocaleString('en-IN')}</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        .pd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 24px; }
        .pd-images { display: flex; flex-direction: column; gap: 12px; }
        .pd-main-img { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 3/4; background: #f5ede4; }
        .pd-main-img img { width: 100%; height: 100%; object-fit: cover; }
        .img-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 80px; }
        .pd-badge { position: absolute; top: 16px; left: 16px; background: #e74c3c; color: #fff; padding: 6px 14px; border-radius: 4px; font-weight: 700; font-size: 0.85rem; }
        .pd-thumbs { display: flex; gap: 8px; flex-wrap: wrap; }
        .thumb { width: 70px; height: 70px; border-radius: 8px; overflow: hidden; border: 2px solid transparent; padding: 0; background: none; cursor: pointer; transition: border-color 0.2s; }
        .thumb.active { border-color: var(--color-primary); }
        .thumb img { width: 100%; height: 100%; object-fit: cover; }
        .pd-category { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--color-primary); }
        .pd-title { font-family: var(--font-display); font-size: 2rem; color: var(--color-secondary); margin: 10px 0 16px; line-height: 1.2; }
        .pd-pricing { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .pd-price { font-size: 1.6rem; font-weight: 700; color: var(--color-primary); }
        .pd-compare { font-size: 1.1rem; text-decoration: line-through; color: #aaa; }
        .pd-discount-badge { background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
        .pd-desc { color: #666; line-height: 1.8; margin-bottom: 24px; font-size: 0.95rem; }
        .pd-option-group { margin-bottom: 20px; }
        .pd-option-group label { font-size: 0.875rem; color: #555; margin-bottom: 8px; display: block; }
        .option-btns { display: flex; flex-wrap: wrap; gap: 8px; }
        .option-btn { padding: 7px 16px; border-radius: 6px; border: 1.5px solid #ddd; background: #fff; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
        .option-btn.active { border-color: var(--color-primary); background: var(--color-primary); color: #fff; }
        .qty-control { display: flex; align-items: center; gap: 0; border: 1.5px solid #ddd; border-radius: 8px; overflow: hidden; width: fit-content; }
        .qty-control button { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: #f7f3ef; border: none; cursor: pointer; transition: background 0.2s; }
        .qty-control button:hover { background: var(--color-accent); }
        .qty-control span { padding: 0 20px; font-weight: 600; font-size: 0.95rem; }
        .pd-actions { display: flex; gap: 12px; margin: 24px 0 12px; flex-wrap: wrap; }
        .share-btn { background: none; border: none; color: #888; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; cursor: pointer; margin-bottom: 24px; transition: color 0.2s; }
        .share-btn:hover { color: var(--color-primary); }
        .referral-box { background: linear-gradient(135deg, #fff8f0 0%, #fef3e2 100%); border: 1px solid #f0d9b0; border-radius: 12px; padding: 20px; }
        .ref-header { display: flex; gap: 14px; margin-bottom: 14px; align-items: flex-start; }
        .ref-header span { font-size: 1.5rem; }
        .ref-header strong { display: block; font-size: 0.95rem; margin-bottom: 2px; }
        .ref-header p { font-size: 0.8rem; color: #888; }
        .ref-link-wrap { display: flex; gap: 8px; }
        .ref-link-wrap input { flex: 1; padding: 9px 12px; border: 1.5px solid #e0d6cc; border-radius: 6px; font-size: 0.8rem; background: #fff; color: #555; }
        .ref-link-wrap button { background: var(--color-primary); color: #fff; padding: 9px 16px; border-radius: 6px; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 5px; white-space: nowrap; }
        @media (max-width: 860px) { .pd-grid { grid-template-columns: 1fr; gap: 28px; } }
        @media (max-width: 480px) { .pd-title { font-size: 1.5rem; } .pd-actions { flex-direction: column; } .pd-actions .btn-primary, .pd-actions .btn-secondary { width: 100%; justify-content: center; } }
      `}</style>
    </>
  );
}
