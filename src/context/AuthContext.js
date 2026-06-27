import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchCustomer(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await fetchCustomer(session.user.id);
      else { setCustomer(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCustomer = async (authId) => {
    const { data } = await supabase.from('customers').select('*').eq('auth_id', authId).single();
    setCustomer(data);
    setLoading(false);
  };

  const signUp = async ({ email, password, name, phone }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      const { error: customerError } = await supabase.from('customers').insert({
        auth_id: data.user.id, name, email, phone
      });
      if (customerError) throw customerError;
    }
    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCustomer(null);
  };

  const refreshCustomer = () => user && fetchCustomer(user.id);

  return (
    <AuthContext.Provider value={{ user, customer, loading, signUp, signIn, signOut, refreshCustomer }}>
      {children}
    </AuthContext.Provider>
  );
};
