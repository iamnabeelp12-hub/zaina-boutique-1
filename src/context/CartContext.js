import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({});
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zaina_cart')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('zaina_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1, size = '', color = '') => {
    setCart(prev => {
      const key = `${product.id}-${size}-${color}`;
      const exists = prev.find(i => `${i.id}-${i.size}-${i.color}` === key);
      if (exists) return prev.map(i => `${i.id}-${i.size}-${i.color}` === key ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty, size, color, cartKey: key }];
    });
  };

  const removeFromCart = (cartKey) => setCart(prev => prev.filter(i => i.cartKey !== cartKey));
  const updateQty = (cartKey, qty) => {
    if (qty < 1) return removeFromCart(cartKey);
    setCart(prev => prev.map(i => i.cartKey === cartKey ? { ...i, qty } : i));
  };
  const clearCart = () => setCart([]);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
