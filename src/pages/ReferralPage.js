import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ReferralPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      localStorage.setItem('referral_code', code);
      supabase.from('referral_links')
        .select('id, clicks, product_id, products(slug)')
        .eq('code', code)
        .single()
        .then(({ data }) => {
          if (data) {
            supabase.from('referral_links').update({ clicks: data.clicks + 1 }).eq('id', data.id);
            if (data.products?.slug) navigate(`/products/${data.products.slug}?ref=${code}`);
            else navigate(`/products?ref=${code}`);
          } else {
            navigate('/products');
          }
        });
    } else {
      navigate('/');
    }
  }, [code, navigate]);

  return (
    <div className="loading-center">
      <div className="spinner" />
    </div>
  );
}
