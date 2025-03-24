import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { checkIsAdmin as verifyAdminStatus, createAdminRole, getAdminUsers } from '../lib/dbInit'

export interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isInitialized: boolean
  setIsAdmin: (isAdmin: boolean) => void
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<any>
  changePassword: (newPassword: string) => Promise<any>
  checkIsAdmin: () => Promise<boolean>
  getAllAdmins: () => Promise<{userId: string}[]>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const KNOWN_ADMIN_IDS = ['336187fc-3f85-4de9-9df4-f5d42e5c0b92']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false)

  const getAllAdmins = async (): Promise<{userId: string}[]> => {
    try {
      const result = await getAdminUsers();
      return result.success ? result.adminUsers : [];
    } catch (error) {
      console.error('Error getting admin users:', error);
      return [];
    }
  };

  const checkIsAdmin = async (retryCount = 3): Promise<boolean> => {
    if (!user) {
      console.log('No user found for admin check')
      return false
    }

    if (isCheckingAdmin) {
      console.log('Admin check already in progress')
      return isAdmin
    }

    try {
      setIsCheckingAdmin(true)
      console.log('Checking admin status for user:', user.id)

      // First check if user is in known admin list
      if (KNOWN_ADMIN_IDS.includes(user.id)) {
        console.log('User is a known admin')
        setIsAdmin(true)
        return true
      }

      // Then check in database
      const isUserAdmin = await verifyAdminStatus(user.id)
      
      if (isUserAdmin) {
        console.log('User verified as admin in database')
        setIsAdmin(true)
        return true
      }

      // If not admin and is known admin ID, try to create admin role
      if (KNOWN_ADMIN_IDS.includes(user.id)) {
        console.log('Creating admin role for known admin')
        const result = await createAdminRole(user.id)
        if (result.success) {
          setIsAdmin(true)
          return true
        }
      }

      setIsAdmin(false)
      return false
    } catch (error) {
      console.error('Error checking admin status:', error)
      
      // Retry logic
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

  // Initialize auth state
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
          
          // Check admin status in the background
          if (currentUser) {
            console.log('Checking admin status for user:', currentUser.id);
            await checkIsAdmin() // Wait for initial admin check
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

    // Start initialization immediately
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change - Event:', event, 'Session:', !!session);
      const currentUser = session?.user ?? null
      console.log('Auth state change - User:', currentUser?.email)
      
      setUser(currentUser)
      
      // Check admin status in the background
      if (currentUser) {
        console.log('Checking admin status after auth state change');
        await checkIsAdmin() // Wait for admin check to complete
      } else {
        console.log('No user found after auth state change');
        setIsAdmin(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      if (data.user) {
        setUser(data.user)
        
        // Check admin status and wait for result
        await checkIsAdmin()
      }
      
      return { data, error }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return { data, error }
  }

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

  const changePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    return { data, error }
  }

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

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 