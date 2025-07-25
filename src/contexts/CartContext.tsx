'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  type: 'product' | 'service';
  category?: string;
  description?: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load cart when user changes
  useEffect(() => {
    if (user && !cart) {
      loadCart();
    } else if (!user) {
      setCart(null);
      setLoading(false);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;

    try {
      // First check if cart already exists
      const cartDoc = await getDoc(doc(db, 'carts', user.uid));
      if (cartDoc.exists()) {
        const data = cartDoc.data();
        setCart({
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Cart);
      } else {
        // Only create cart if it doesn't exist
        const newCart: Cart = {
          id: user.uid,
          userId: user.uid,
          items: [],
          totalAmount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(doc(db, 'carts', user.uid), newCart);
        setCart(newCart);
        console.log('Created new cart for user:', user.uid);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const addToCart = async (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    if (!user || !cart) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    try {
      const existingItemIndex = cart.items.findIndex(cartItem => cartItem.id === item.id);
      let updatedItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = cart.items.map((cartItem, index) => 
          index === existingItemIndex 
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // Add new item
        updatedItems = [...cart.items, { ...item, quantity }];
      }

      const totalAmount = calculateTotal(updatedItems);
      
      const updatedCart: Cart = {
        ...cart,
        items: updatedItems,
        totalAmount,
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'carts', user.uid), updatedCart);
      setCart(updatedCart);
      toast.success(`${item.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user || !cart) return;

    try {
      const updatedItems = cart.items.filter(item => item.id !== itemId);
      const totalAmount = calculateTotal(updatedItems);
      
      const updatedCart: Cart = {
        ...cart,
        items: updatedItems,
        totalAmount,
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'carts', user.uid), updatedCart);
      setCart(updatedCart);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user || !cart) return;

    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      const updatedItems = cart.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      
      const totalAmount = calculateTotal(updatedItems);
      
      const updatedCart: Cart = {
        ...cart,
        items: updatedItems,
        totalAmount,
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'carts', user.uid), updatedCart);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!user || !cart) return;

    try {
      const updatedCart: Cart = {
        ...cart,
        items: [],
        totalAmount: 0,
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'carts', user.uid), updatedCart);
      setCart(updatedCart);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getCartTotal = (): number => {
    return cart?.totalAmount || 0;
  };

  const getCartItemCount = (): number => {
    return cart?.items.reduce((count, item) => count + item.quantity, 0) || 0;
  };

  const value: CartContextType = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
