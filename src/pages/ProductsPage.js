import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Filter, X, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { useSite } from '../context/SiteContext';
import { toast } from 'react-toastify';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { settings } = useSite();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [total, setTotal] = useState(0);
  const search = searchParams.get('search') || '';
  const sym = settings.general?.currency_symbol || '₹';

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true).order('display_order').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCat, sortBy, search]);

  const loadProducts = async () => {
    setLoading(true);
    let q = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true);
    if (selectedCat) {
      const cat = categories.find(c => c.slug === selectedCat);
      if (cat) q = q.eq('category_id', cat.id);
    }
    if (search) q = q.ilike('name', `%${search}%`);
    q = q.gte('price', priceRange[0]).lte('price', priceRange[1]);
    if (sortBy === 'newest') q = q.order('created_at', { ascending: false });
    else if (sortBy === 'price_asc') q = q.order('price', { ascending: true });
    else if (sortBy === 'price_desc') q = q.order('price', { ascending: false });
    const { data, count } = await q;
    if (data) setProducts(data);
    setTotal(count || 0);
    setLoading(false);
  };

  return (
    <>
      <Helmet><title>All Products | Zaina Boutique</title></Helmet>

      <div className="page-hero">
        <h1>{search ? `Search: "${search}"` : 'Our Collection'}</h1>
        <p>{total} products</p>
      </div>

      <div className="container" style={{ padding: '32px 20px' }}>
        {/* Toolbar */}
        <div className="products-toolbar">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="filter-btn" onClick={() => setFilterOpen(!filterOpen)}>
              <Filter size={16} /> Filters {filterOpen ? <X size={14} /> : <ChevronDown size={14} />}
            </button>
            {selectedCat && (
              <span className="active-filter">
                {categories.find(c => c.slug === selectedCat)?.name}
                <button onClick={() => setSelectedCat('')}><X size={12} /></button>
              </span>
            )}
            {search && (
              <span className="active-filter">
                "{search}"
                <button onClick={() => setSearchParams({})}><X size={12} /></button>
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: '0.85rem', color: '#888' }}>Sort:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ border: '1.5px solid #e0d6cc', borderRadius: 6, padding: '7px 12px', fontSize: '0.875rem' }}>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filters Drawer */}
        {filterOpen && (
          <div className="filters-panel">
            <div>
              <h4>Categories</h4>
              <div className="filter-options">
                <button className={`filter-opt${!selectedCat ? ' active' : ''}`} onClick={() => setSelectedCat('')}>All</button>
                {categories.map(c => (
                  <button key={c.id} className={`filter-opt${selectedCat === c.slug ? ' active' : ''}`} onClick={() => setSelectedCat(c.slug)}>{c.name}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
            <h3>No products found</h3>
            <p style={{ color: '#888', marginTop: 8 }}>Try adjusting your filters</p>
            <button className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }} onClick={() => { setSelectedCat(''); setSearchParams({}); }}>Clear Filters</button>
          </div>
        ) : (
          <div className="products-grid" style={{ marginTop: 24 }}>
            {products.map(p => {
              const discount = p.compare_price ? Math.round((1 - p.price / p.compare_price) * 100) : 0;
              return (
                <div key={p.id} className="product-card">
                  <Link to={`/products/${p.slug}`}>
                    <div className="image-wrap">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" /> : <div style={{ width: '100%', height: '100%', background: '#f5ede4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, aspectRatio: '3/4' }}>👗</div>}
                      {discount > 0 && <span className="badge sale">{discount}% OFF</span>}
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
                    <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: '0.82rem' }} onClick={() => { addToCart(p); toast.success('Added to cart!'); }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .products-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: 16px 0; border-bottom: 1px solid #f0ebe4; margin-bottom: 0; }
        .filter-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1.5px solid #e0d6cc; border-radius: 6px; background: #fff; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .active-filter { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--color-accent); border-radius: 6px; font-size: 0.8rem; font-weight: 500; }
        .active-filter button { background: none; padding: 0; display: flex; }
        .filters-panel { background: #fff; border: 1px solid #f0ebe4; border-radius: 8px; padding: 20px; margin-top: 12px; }
        .filters-panel h4 { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 12px; }
        .filter-options { display: flex; flex-wrap: wrap; gap: 8px; }
        .filter-opt { padding: 6px 14px; border: 1.5px solid #e0d6cc; border-radius: 20px; background: #fff; font-size: 0.82rem; cursor: pointer; transition: all 0.2s; }
        .filter-opt.active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }
      `}</style>
    </>
  );
}
