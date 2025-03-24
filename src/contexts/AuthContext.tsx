/**
 * Authentication Context
 * Provides authentication state and functions throughout the application
 * Handles user authentication, admin verification, and session management
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { getAdminUsers } from '../lib/dbInit'

/**
 * AuthContextType Interface
 * Defines the shape of the authentication context
 */
export interface AuthContextType {
  user: User | null                                      // Current authenticated user
  isAdmin: boolean                                       // Whether the current user is an admin
  isInitialized: boolean                                // Whether auth has been initialized
  setIsAdmin: (isAdmin: boolean) => void                // Function to set admin status
  signIn: (email: string, password: string) => Promise<any>  // Sign in function
  signOut: () => Promise<void>                          // Sign out function
  signUp: (email: string, password: string) => Promise<any>  // Sign up function
  changePassword: (newPassword: string) => Promise<any>  // Change password function
  checkIsAdmin: () => Promise<boolean>                  // Check admin status function
  getAllAdmins: () => Promise<{userId: string}[]>       // Get all admin users
}

// Create the auth context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// List of known admin email addresses
const KNOWN_ADMIN_EMAILS = ['blitzkirg21@gmail.com', 'johnfloydmarticio212005@gmail.com']

/**
 * AuthProvider Component
 * Provides authentication context to the application
 * Manages authentication state and provides auth-related functions
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State management
  const [user, setUser] = useState<User | null>(null)           // Current user
  const [isAdmin, setIsAdmin] = useState(false)                 // Admin status
  const [isInitialized, setIsInitialized] = useState(false)     // Initialization status
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false) // Admin check status

  /**
   * Get all admin users from the database
   */
  const getAllAdmins = async (): Promise<{userId: string}[]> => {
    try {
      const result = await getAdminUsers();
      return result.success ? result.adminUsers : [];
    } catch (error) {
      console.error('Error getting admin users:', error);
      return [];
    }
  };

  /**
   * Check if the current user is an admin
   * Includes retry logic for reliability
   */
  const checkIsAdmin = async (retryCount = 3): Promise<boolean> => {
    if (!user) {
      console.log('No user found for admin check')
      setIsAdmin(false)
      return false
    }

    if (isCheckingAdmin) {
      console.log('Admin check already in progress')
      return isAdmin
    }

    try {
      setIsCheckingAdmin(true)
      console.log('Checking admin status for user:', user.email)

      // First check known admin emails
      if (KNOWN_ADMIN_EMAILS.includes(user.email || '')) {
        console.log('User is a known admin')
        setIsAdmin(true)
        return true
      }

      // Then check database for admin role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin status:', error)
        return false
      }
      
      const isUserAdmin = !!data
      console.log('User admin status:', isUserAdmin)
      setIsAdmin(isUserAdmin)
      return isUserAdmin
    } catch (error) {
      console.error('Error checking admin status:', error)
      
      // Retry logic for reliability
      if (retryCount > 0) {
        console.log(`Retrying admin check... (${retryCount} attempts remaining)`)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
        return checkIsAdmin(retryCount - 1)
      }
      
      setIsAdmin(false)
      return false
    } finally {
      setIsCheckingAdmin(false)
    }
  }

  /**
   * Initialize authentication state and set up auth state change listener
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          return;
        }
        
        const currentUser = session?.user ?? null
        console.log('Initial session check - User:', currentUser?.email, 'Session:', !!session)
        
        if (mounted) {
          setUser(currentUser)
          
          // Check admin status if user exists
          if (currentUser) {
            console.log('Checking admin status for user:', currentUser.id);
            await checkIsAdmin()
          } else {
            console.log('No user found during initialization');
            setIsAdmin(false)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) {
          console.log('Auth initialization completed');
          setIsInitialized(true)
        }
      }
    }

    // Start initialization
    initializeAuth()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change - Event:', event, 'Session:', !!session);
      const currentUser = session?.user ?? null
      console.log('Auth state change - User:', currentUser?.email)
      
      setUser(currentUser)
      
      // Update admin status on auth state change
      if (currentUser) {
        console.log('Checking admin status after auth state change');
        await checkIsAdmin()
      } else {
        console.log('No user found after auth state change');
        setIsAdmin(false)
      }
    })

    // Cleanup function
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      if (data.user) {
        setUser(data.user)
        
        // Check admin status after successful sign in
        const isAdminStatus = await checkIsAdmin()
        console.log('Sign in - Admin status check result:', isAdminStatus)
        setIsAdmin(isAdminStatus)
      }
      
      return { data, error }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return { data, error }
  }

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setIsAdmin(false)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  /**
   * Change the current user's password
   */
  const changePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    return { data, error }
  }

  // Create the context value object
  const value = {
    user,
    isAdmin,
    isInitialized,
    setIsAdmin,
    signIn,
    signOut,
    signUp,
    changePassword,
    checkIsAdmin,
    getAllAdmins,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to use the auth context
 * Throws an error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 