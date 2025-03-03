import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Database } from '../types/supabase';
import { v4 as uuidv4 } from 'uuid';

type Product = Database['public']['Tables']['products']['Row'];
type CartItem = Database['public']['Tables']['cart_items']['Row'];

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart items whenever user changes
  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setCartItems(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    if (!user) {
      console.log('No user logged in');
      setError('Please log in to add items to cart');
      return;
    }

    try {
      console.log('Adding to cart:', product);
      setLoading(true);
      
      // Ensure product has a valid UUID
      const productId = product.id || uuidv4();
      
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.product_id === productId);
      console.log('Existing item:', existingItem);

      if (existingItem) {
        // Update quantity if item exists
        const newQuantity = existingItem.quantity + 1;
        console.log('Updating quantity to:', newQuantity);
        
        // Check stock
        if (newQuantity > product.stock) {
          console.log('Not enough stock');
          setError(`Only ${product.stock} items available in stock`);
          return;
        }

        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (error) {
          console.error('Error updating cart:', error);
          throw error;
        }

        setCartItems(prev =>
          prev.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        console.log('Successfully updated quantity');
      } else {
        // Add new item if it doesn't exist
        console.log('Adding new item to cart');
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            id: uuidv4(),
            user_id: user.id,
            product_id: productId,
            quantity: 1
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding to cart:', error);
          throw error;
        }
        if (data) {
          console.log('Successfully added item:', data);
          setCartItems(prev => [...prev, data]);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Cart operation failed:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setCartItems(prev => prev.filter(item => item.product_id !== productId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user || quantity < 1) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setCartItems(prev =>
        prev.map(item =>
          item.product_id === productId ? { ...item, quantity } : item
        )
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        loading,
        error,
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