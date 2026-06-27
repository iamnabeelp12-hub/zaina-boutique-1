// CategoryPage.js
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { useSite } from '../context/SiteContext';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';

export default function CategoryPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { settings } = useSite();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sym = settings.general?.currency_symbol || '₹';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).single();
      if (cat) {
        setCategory(cat);
        const { data: prods } = await supabase.from('products').select('*').eq('category_id', cat.id).eq('is_active', true).order('created_at', { ascending: false });
        if (prods) setProducts(prods);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!category) return <div className="container" style={{ padding: 80, textAlign: 'center' }}><h2>Category not found</h2></div>;

  return (
    <>
      <Helmet><title>{category.name} | Zaina Boutique</title></Helmet>
      <div className="page-hero">
        <h1>{category.name}</h1>
        <p>{products.length} products</p>
      </div>
      <div className="container" style={{ padding: '40px 20px' }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 60 }}>🛍️</div>
            <h3 style={{ marginTop: 16 }}>No products in this category yet</h3>
            <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', marginTop: 20 }}>Browse All</Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(p => {
              const discount = p.compare_price ? Math.round((1 - p.price / p.compare_price) * 100) : 0;
              return (
                <div key={p.id} className="product-card">
                  <Link to={`/products/${p.slug}`}>
                    <div className="image-wrap">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" /> : <div style={{ width: '100%', aspectRatio: '3/4', background: '#f5ede4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50 }}>👗</div>}
                      {discount > 0 && <span className="badge sale">{discount}% OFF</span>}
                    </div>
                    <div className="card-body">
                      <h3>{p.name}</h3>
                      <div className="price">{sym}{p.price?.toLocaleString('en-IN')}{p.compare_price && <span className="compare">{sym}{p.compare_price?.toLocaleString('en-IN')}</span>}</div>
                    </div>
                  </Link>
                  <div className="card-actions">
                    <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '9px', fontSize: '0.82rem' }} onClick={() => { addToCart(p); toast.success('Added!'); }}>Add to Cart</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
