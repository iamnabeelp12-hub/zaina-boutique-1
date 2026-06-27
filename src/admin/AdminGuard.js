import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ADMIN_PATH = process.env.REACT_APP_ADMIN_SECRET_PATH || 'zainab-secure-admin-2024';

export default function AdminGuard({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isAdmin = sessionStorage.getItem('zaina_admin') === 'true';
      if (!session || !isAdmin) {
        navigate(`/${ADMIN_PATH}/login`);
      }
      setChecking(false);
    });
  }, [navigate]);

  if (checking) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #333', borderTopColor: '#c8a96e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return children;
}
