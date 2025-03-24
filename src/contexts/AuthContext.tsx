import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { createAdminRole } from '../lib/dbInit'

export interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  setIsAdmin: (isAdmin: boolean) => void
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<any>
  changePassword: (newPassword: string) => Promise<any>
  checkIsAdmin: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user has admin role
  const checkIsAdmin = async (): Promise<boolean> => {
    if (!user) return false
    
    try {
      console.log('Checking if user is admin:', user.id)
      
      // Direct check for specific admin user IDs - emergency override
      const knownAdminIds = [
        '336187fc-3f85-4de9-9df4-f5d42e5c0b92' // johnfloydmarticio212005@gmail.com
      ];
      
      if (knownAdminIds.includes(user.id)) {
        console.log('Admin access granted via direct ID match')
        setIsAdmin(true)
        
        // Ensure admin role is in database
        try {
          const result = await createAdminRole(user.id)
          console.log('Admin role creation result:', result)
        } catch (error) {
          console.error('Failed to create admin role in database:', error)
        }
        
        return true
      }
      
      // Check if the user has admin set in their metadata
      const metadata = user.user_metadata || {}
      const appMetadata = user.app_metadata || {}
      
      console.log('User metadata:', metadata)
      console.log('App metadata:', appMetadata)
      
      // Check various metadata locations where admin flag might be stored
      if (
        (metadata && metadata.is_admin === true) || 
        (appMetadata && appMetadata.role === 'admin') ||
        (appMetadata && appMetadata.is_admin === true)
      ) {
        console.log('Admin found in metadata')
        setIsAdmin(true)
        
        // Ensure admin role is in database
        try {
          await createAdminRole(user.id)
        } catch (error) {
          console.error('Failed to create admin role in database:', error)
        }
        
        return true
      }
      
      // If not in metadata, check the user_roles table
      console.log('Checking admin role in user_roles table')
      try {
        // First try with error handling for missing table
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single()
        
        console.log('Role check result:', { data, error })
        
        if (error) {
          if (error.code === 'PGRST116') {
            console.log('No admin role found for user')
            return false
          } else if (error.code === '42P01') {
            console.error('user_roles table does not exist, creating table...')
            // Try to create the table
            try {
              await supabase.rpc('execute_sql', {
                sql: `CREATE TABLE IF NOT EXISTS public.user_roles (
                  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                  role TEXT NOT NULL,
                  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                  UNIQUE(user_id, role)
                );`
              })
              console.log('Created user_roles table')
              // Try again after table creation
              return await checkIsAdmin()
            } catch (tableCreateError) {
              console.error('Failed to create user_roles table:', tableCreateError)
              // Fall back to known admin list
              return knownAdminIds.includes(user.id)
            }
          } else {
            console.error('Error checking admin role:', error)
            return false
          }
        }
        
        const isUserAdmin = !!data
        console.log('Is user admin from database:', isUserAdmin)
        
        if (isUserAdmin) {
          // If user is admin in the database but not in metadata,
          // update the metadata for future checks
          try {
            await supabase.auth.updateUser({
              data: { is_admin: true }
            })
            console.log('Updated user metadata with admin flag')
          } catch (updateError) {
            console.error('Error updating user metadata:', updateError)
          }
        }
        
        setIsAdmin(isUserAdmin)
        return isUserAdmin
      } catch (error) {
        console.error('Error in admin role check:', error)
        return false
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        await checkIsAdmin()
      } else {
        setIsAdmin(false)
      }
      
      setLoading(false)
    })

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        await checkIsAdmin()
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    if (data.user) {
      // Try harder to detect admin status
      const isUserAdmin = await checkIsAdmin()
      console.log('Sign-in admin check:', isUserAdmin)
      
      // If this is the known admin, force creating their role
      if (data.user.id === '336187fc-3f85-4de9-9df4-f5d42e5c0b92') {
        try {
          await createAdminRole(data.user.id)
          setIsAdmin(true)
        } catch (e) {
          console.error('Error setting admin role during sign-in:', e)
        }
      }
    }
    
    return { data, error }
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
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setIsAdmin(false)
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
    loading,
    isAdmin,
    setIsAdmin,
    signIn,
    signOut,
    signUp,
    changePassword,
    checkIsAdmin,
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