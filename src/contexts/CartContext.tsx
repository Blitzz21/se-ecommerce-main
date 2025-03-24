import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { Product } from '../data/products';
import { initializeOrders } from '../lib/initializeOrders';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  user_id?: string;
  product_name: string;
  price: number;
  image?: string;
  selected?: boolean;
}

export interface CartContextType {
  cartItems: CartItem[];
  selectedItems: CartItem[];
  addToCart: (product: Product & { quantity?: number }) => void;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  getSubtotal: () => number;
  selectedItemsTotal: number;
  toggleItemSelection: (itemId: string, selected: boolean) => Promise<void>;
  selectAllItems: (selected: boolean) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize orders table on app startup
    initializeOrders().catch(error => {
      console.error('Failed to initialize orders:', error);
    });

    // Load cart from localStorage if no user is logged in
    if (!user) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      return;
    }

    // If user is logged in, fetch their cart from Supabase
    const fetchCart = async () => {
      try {
        console.log("Fetching cart for user:", user.id);
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        if (data) {
          // Since 'selected' property doesn't exist in DB, set it to true by default for all items
          const itemsWithSelection = data.map(item => ({
            ...item,
            selected: true, // Default to selected for items from DB
            image: item.image || undefined // Handle missing image field
          })) as CartItem[];
          
          console.log("Loaded cart items:", itemsWithSelection.length);
          setCartItems(itemsWithSelection);
        }
      } catch (error: any) {
        console.error('Error fetching cart:', error.message);
      }
    };

    fetchCart();

    // Set up real-time subscription for cart changes
    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Cart change detected:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as any;
            // Add selection property since it's not in the database
            const itemWithSelection = {
              ...newItem,
              selected: true,
              image: newItem.image || undefined
            } as CartItem;
            
            setCartItems(prev => {
              // Check if we already have this item to avoid duplicates
              if (prev.some(item => item.id === itemWithSelection.id)) {
                return prev;
              }
              return [...prev, itemWithSelection];
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as any;
            setCartItems(prev => 
              prev.map(item => 
                item.id === updatedItem.id 
                  ? { ...item, ...updatedItem, selected: item.selected } // Keep the selected state
                  : item
              )
            );
          }
          else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old as any;
            setCartItems(prev => 
              prev.filter(item => item.id !== deletedItem.id)
            );
          }
          else {
            // For any other changes, just refresh the cart
            fetchCart();
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Save cart to localStorage whenever it changes (for non-logged in users)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // Get selected items and calculate their total
  useEffect(() => {
    setSelectedItems(cartItems.filter(item => item.selected !== false));  // Consider items selected by default
  }, [cartItems]);

  const selectedItemsTotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Add to cart
  const addToCart = async (product: Product & { quantity?: number }) => {
    try {
      const productQuantity = product.quantity || 1; // Use passed quantity or default to 1
      
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        product_id: product.id,
        quantity: productQuantity,
        product_name: product.name,
        price: product.price,
        image: product.image,
        selected: true,
      };

      // If user is logged in, add to Supabase
      if (user) {
        newItem.user_id = user.id;
        
        // Check if product already exists in cart for this user
        const { data: existingItems, error: fetchError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('product_id', product.id)
          .eq('user_id', user.id);
        
        if (fetchError) throw fetchError;
        
        if (existingItems && existingItems.length > 0) {
          // If product exists, update quantity
          const existingItem = existingItems[0];
          const newQuantity = existingItem.quantity + productQuantity;
          
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', existingItem.id);
          
          if (updateError) throw updateError;
          
          // Update local state for immediate UI update
          setCartItems(prevItems => 
            prevItems.map(item => 
              item.id === existingItem.id 
                ? { ...item, quantity: newQuantity } 
                : item
            )
          );
        } else {
          // If product is new, add to cart
          // Only send fields that exist in the database schema
          const dbItem = {
            id: newItem.id,
            product_id: newItem.product_id,
            quantity: newItem.quantity,
            user_id: newItem.user_id,
            product_name: newItem.product_name,
            price: newItem.price
            // Omitting image and selected as they seem to not exist in the DB
          };
          
          const { error } = await supabase.from('cart_items').insert([dbItem]);
          if (error) throw error;
          
          // Update local state
          setCartItems(prevItems => [...prevItems, newItem]);
        }
      } else {
        // If no user, just update local state
        setCartItems((prevItems) => {
          // Check if product already exists in cart
          const existingItemIndex = prevItems.findIndex(
            (item) => item.product_id === product.id
          );

          if (existingItemIndex >= 0) {
            // If exists, increase quantity
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex].quantity += productQuantity;
            return updatedItems;
          } else {
            // If new, add to cart
            return [...prevItems, newItem];
          }
        });
      }

      toast.success('Added to cart');
    } catch (error: any) {
      console.error('Error adding to cart:', error.message);
      toast.error('Failed to add to cart');
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId: string) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        
        // Also update local state for immediate UI update
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      } else {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      }
    } catch (error: any) {
      console.error('Error removing from cart:', error.message);
      toast.error('Failed to remove item');
    }
  };

  // Update quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        return;
      }

      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        
        // Also update local state for immediate UI update
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      } else {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      }
    } catch (error: any) {
      console.error('Error updating quantity:', error.message);
      toast.error('Failed to update quantity');
    }
  };

  // Toggle item selection
  const toggleItemSelection = async (itemId: string, selected: boolean) => {
    try {
      console.log(`Toggling selection for item ${itemId} to ${selected}`);
      
      // For database storage, since 'selected' column doesn't exist in the DB,
      // we'll just track it locally for logged-in users too
      setCartItems((prevItems) => {
        const newItems = prevItems.map((item) =>
          item.id === itemId ? { ...item, selected } : item
        );
        console.log('Updated local cart items with selection');
        return newItems;
      });
    } catch (error: any) {
      console.error('Error toggling selection:', error.message);
      toast.error('Failed to update selection');
    }
  };

  // Select all items
  const selectAllItems = async (selected: boolean) => {
    try {
      console.log(`Setting all items selection to: ${selected}`);
      
      // Since 'selected' column doesn't exist in DB, we'll just track it locally for all users
      setCartItems((prevItems) => {
        const newItems = prevItems.map((item) => ({ ...item, selected }));
        console.log('Updated all local items selection');
        return newItems;
      });
    } catch (error: any) {
      console.error('Error selecting all items:', error.message);
      toast.error('Failed to update selections');
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      }
      
      setCartItems([]);
    } catch (error: any) {
      console.error('Error clearing cart:', error.message);
      toast.error('Failed to clear cart');
    }
  };

  // Calculate subtotal
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        getSubtotal,
        selectedItemsTotal,
        toggleItemSelection,
        selectAllItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};