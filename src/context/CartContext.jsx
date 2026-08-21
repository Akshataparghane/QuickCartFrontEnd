import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addToCart as addToCartApi,
  getCart,
  removeCartItem as removeCartItemApi,
  updateCartItem as updateCartItemApi,
  clearCart as clearCartApi,
} from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return null;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getCart();
      setCart(data.data.cart);
      return data.data.cart;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      refreshCart();
    }
  }, [authLoading, refreshCart]);

  const addItem = async (productId, quantity = 1) => {
    const data = await addToCartApi(productId, quantity);
    setCart(data.data.cart);
    return data;
  };

  const updateItem = async (productId, quantity) => {
    const data = await updateCartItemApi(productId, quantity);
    setCart(data.data.cart);
    return data;
  };

  const removeItem = async (productId) => {
    const data = await removeCartItemApi(productId);
    setCart(data.data.cart);
    return data;
  };

  const clear = async () => {
    const data = await clearCartApi();
    setCart(data.data.cart);
    return data;
  };

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      itemCount: cart?.totalQuantity || 0,
      refreshCart,
      addItem,
      updateItem,
      removeItem,
      clear,
    }),
    [cart, loading, error, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
