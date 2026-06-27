import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const SiteContext = createContext({});
export const useSite = () => useContext(SiteContext);

const defaults = {
  colors: { primary: '#c8a96e', secondary: '#1a1a1a', accent: '#f5e6d3', text: '#2d2d2d', background: '#fff9f5', nav_bg: '#1a1a1a', footer_bg: '#1a1a1a' },
  seo: { site_title: 'Zaina Boutique', meta_description: 'Premium fashion boutique', meta_keywords: 'fashion, boutique' },
  general: { site_name: 'Zaina Boutique', tagline: 'Elegance Redefined', whatsapp: '+917418701120', currency_symbol: '₹', free_shipping_above: 999 },
  social: { instagram: '', facebook: '' }
};

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        const merged = { ...defaults };
        data.forEach(row => { merged[row.key] = { ...defaults[row.key], ...row.value }; });
        setSettings(merged);
        applyColors(merged.colors);
      }
    } catch (e) { console.error('Settings load error', e); }
    setLoaded(true);
  };

  const applyColors = (colors) => {
    const root = document.documentElement;
    if (!colors) return;
    Object.entries(colors).forEach(([k, v]) => {
      root.style.setProperty(`--color-${k.replace(/_/g, '-')}`, v);
    });
  };

  const updateSettings = async (key, value) => {
    const { error } = await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' });
    if (!error) {
      setSettings(prev => {
        const next = { ...prev, [key]: { ...prev[key], ...value } };
        if (key === 'colors') applyColors(next.colors);
        return next;
      });
    }
    return { error };
  };

  return (
    <SiteContext.Provider value={{ settings, loaded, updateSettings, reloadSettings: loadSettings }}>
      {children}
    </SiteContext.Provider>
  );
};
