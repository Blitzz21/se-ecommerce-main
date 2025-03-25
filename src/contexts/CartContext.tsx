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
  // Client-side only fields (not in database)
  image?: string; // This field exists only on the client, not in DB
  selected?: boolean; // This field exists only on the client, not in DB
}

export interface CartContextType {
  cartItems: CartItem[];
  selectedItems: CartItem[];
  addToCart: (product: Product & { quantity?: number }) => Promise<void>;
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
        try {
          const parsedCart = JSON.parse(savedCart);
          // Ensure all client-side properties exist
          const cartWithProps = parsedCart.map((item: any) => ({
            ...item,
            selected: item.selected !== false, // Default to true
            image: item.image || `/assets/placeholder.png` // Ensure image exists
          }));
          setCartItems(cartWithProps);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          localStorage.removeItem('cart'); // Clear invalid cart data
        }
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
          // Since 'selected' and 'image' properties don't exist in DB, handle them client-side
          const itemsWithSelection = data.map(item => ({
            ...item,
            selected: true, // Default to selected for items from DB
            // Set default image based on product ID if we have product info
            image: `/assets/placeholder.png` // Default image path
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
            // Add client-side properties since they're not in the database
            const itemWithClientProps = {
              ...newItem,
              selected: true,
              image: `/assets/placeholder.png` // Default placeholder image
            } as CartItem;
            
            setCartItems(prev => {
              // Check if we already have this item to avoid duplicates
              if (prev.some(item => item.id === itemWithClientProps.id)) {
                return prev;
              }
              return [...prev, itemWithClientProps];
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as any;
            setCartItems(prev => 
              prev.map(item => 
                item.id === updatedItem.id 
                  ? { 
                      ...item, 
                      ...updatedItem, 
                      // Preserve client-side properties
                      selected: item.selected,
                      image: item.image 
                    } 
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
      // Make sure all cart items have image and selected properties before saving
      const cartWithClientProps = cartItems.map(item => ({
        ...item,
        selected: item.selected !== false, // Default to true
        image: item.image || `/assets/placeholder.png` // Ensure image exists
      }));
      localStorage.setItem('cart', JSON.stringify(cartWithClientProps));
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
      console.log("Adding to cart:", product);
      
      // Require authentication
      if (!user) {
        toast.error('Please log in to add items to cart');
        // Instead of using navigate, we'll throw an error that the component can handle
        throw new Error('AUTH_REQUIRED');
      }

      const productQuantity = product.quantity || 1;
      
      // Handle image to ensure it's a valid string
      let imageUrl = '';
      if (product.image) {
        // If image is already a string and appears to be a URL or path
        if (typeof product.image === 'string') {
          imageUrl = product.image;
        } 
        // If it's some other type, try to get a default image
        else {
          // Apply a fallback based on brand/model if available
          if (product.brand && product.model) {
            imageUrl = `/assets/gpu/${product.brand.toLowerCase()}-${product.model.toLowerCase().replace(' ', '-')}.png`;
          } else {
            imageUrl = '/assets/placeholder.png';
          }
        }
      }
      
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        product_id: product.id,
        quantity: productQuantity,
        product_name: product.name,
        price: product.price,
        image: imageUrl,
        selected: true,
        user_id: user.id
      };

      console.log("Prepared cart item:", newItem);

      // Check if product already exists in cart for this user
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('product_id', product.id)
        .eq('user_id', user.id);
      
      if (fetchError) {
        console.error("Error checking for existing cart items:", fetchError);
        throw fetchError;
      }
      
      if (existingItems && existingItems.length > 0) {
        // If product exists, update quantity
        const existingItem = existingItems[0];
        const newQuantity = existingItem.quantity + productQuantity;
        
        console.log("Updating existing cart item quantity:", existingItem.id, "new quantity:", newQuantity);
        
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);
        
        if (updateError) {
          console.error("Error updating cart item quantity:", updateError);
          throw updateError;
        }
        
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
        const dbItem = {
          id: newItem.id,
          product_id: newItem.product_id,
          quantity: newItem.quantity,
          user_id: newItem.user_id,
          product_name: newItem.product_name,
          price: newItem.price
          // Don't include image field for database - it doesn't exist in the cart_items table
        };
        
        console.log("Adding new item to cart:", dbItem);
        
        const { error } = await supabase.from('cart_items').insert([dbItem]);
        if (error) {
          console.error("Error inserting new cart item:", error);
          throw error;
        }
        
        // Update local state
        setCartItems(prevItems => [...prevItems, newItem]);
      }

      toast.success('Added to cart');
    } catch (error: any) {
      if (error.message === 'AUTH_REQUIRED') {
        // Re-throw the auth error to be handled by the component
        throw error;
      }
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