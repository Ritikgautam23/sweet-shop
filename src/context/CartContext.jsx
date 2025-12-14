import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const CartContext = createContext(undefined);

const API_BASE_URL = 'http://localhost:5000/api';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });
  const { token } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setItems(data.data.items);
      } else {
        // Fallback to localStorage
        console.log('API failed, using localStorage');
      }
    } catch (error) {
      // Fallback to localStorage
      console.log('API failed, using localStorage');
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      // If no token, use localStorage
      setItems(prev => {
        const stored = localStorage.getItem('cart');
        return stored ? JSON.parse(stored) : [];
      });
    }
  }, [token, fetchCart]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.sweet.price * item.quantity, 0);

  const addToCart = async (sweet, quantity = 1) => {
    const newItems = [...items];
    const existingIndex = newItems.findIndex(item => item.sweet.id === sweet.id);

    if (existingIndex >= 0) {
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems.push({ sweet, quantity });
    }

    setItems(newItems);
    toast.success(`Added ${sweet.name} to cart`);

    // Try to sync with API
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ sweetId: sweet.id, quantity }),
        });
      } catch (error) {
        // Ignore API errors, localStorage is the source of truth
      }
    }
  };

  const removeFromCart = async (sweetId) => {
    const item = items.find(i => i.sweet.id === sweetId);
    const newItems = items.filter(item => item.sweet.id !== sweetId);
    setItems(newItems);

    if (item) {
      toast.success(`Removed ${item.sweet.name} from cart`);
    }

    // Try to sync with API
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/cart/remove/${sweetId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Ignore API errors
      }
    }
  };

  const updateQuantity = async (sweetId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(sweetId);
      return;
    }

    const newItems = items.map(item => {
      if (item.sweet.id === sweetId) {
        return { ...item, quantity };
      }
      return item;
    });

    setItems(newItems);

    // Try to sync with API
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/cart/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ sweetId, quantity }),
        });
      } catch (error) {
        // Ignore API errors
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    toast.success('Cart cleared');

    // Try to sync with API
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/cart/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Ignore API errors
      }
    }
  };

  const placeOrder = async (shippingAddress) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('Placing order with items:', items);

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shippingAddress, items }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Clear cart after successful order
      setItems([]);
      return data.data;
    } catch (error) {
      console.error('Order placement error:', error);
      throw error;
    }
  };

  const isInCart = (sweetId) => {
    return items.some(item => item.sweet.id === sweetId);
  };

  const getItemQuantity = (sweetId) => {
    return items.find(item => item.sweet.id === sweetId)?.quantity || 0;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
