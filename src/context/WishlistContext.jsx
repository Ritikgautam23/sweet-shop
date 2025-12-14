import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(undefined);

const API_BASE_URL = 'http://localhost:5000/api';

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('wishlist');
    return stored ? JSON.parse(stored) : [];
  });
  const { token } = useAuth();

  const fetchWishlist = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setItems(data.data);
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
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (token) {
      fetchWishlist();
    } else {
      // If no token, use localStorage
      setItems(prev => {
        const stored = localStorage.getItem('wishlist');
        return stored ? JSON.parse(stored) : [];
      });
    }
  }, [token, fetchWishlist]);

  const totalItems = items.length;

  const addToWishlist = async (sweet) => {
    const existingIndex = items.findIndex(item => item.sweet.id === sweet.id);

    if (existingIndex >= 0) {
      toast.info(`${sweet.name} is already in your wishlist`);
      return;
    }

    const newItems = [...items, { sweet, addedAt: new Date().toISOString() }];
    setItems(newItems);
    toast.success(`Added ${sweet.name} to wishlist`);

    // Try to sync with API
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/wishlist/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ sweetId: sweet.id }),
        });
      } catch (error) {
        // Ignore API errors, localStorage is the source of truth
      }
    }
  };

  const removeFromWishlist = async (sweetId) => {
    const item = items.find(i => i.sweet.id === sweetId);
    const newItems = items.filter(item => item.sweet.id !== sweetId);
    setItems(newItems);

    if (item) {
      toast.success(`Removed ${item.sweet.name} from wishlist`);
    }

    // Try to sync with API
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/wishlist/remove/${sweetId}`, {
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

  const isInWishlist = (sweetId) => {
    return items.some(item => item.sweet.id === sweetId);
  };

  const clearWishlist = async () => {
    setItems([]);
    toast.success('Wishlist cleared');

    // Try to sync with API
    if (token) {
      try {
        // Remove all items from API wishlist
        for (const item of items) {
          await fetch(`${API_BASE_URL}/wishlist/remove/${item.sweet.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        }
      } catch (error) {
        // Ignore API errors
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}