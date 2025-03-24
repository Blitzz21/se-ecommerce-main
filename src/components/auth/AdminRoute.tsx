import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { toast } from 'react-hot-toast'
import { createAdminRole } from '../../lib/dbInit'

type AdminRouteProps = {
  children: JSX.Element;
};

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading, isAdmin, checkIsAdmin, setIsAdmin } = useAuth()
  const [verifying, setVerifying] = useState(true)
  const [verificationFailed, setVerificationFailed] = useState(false)

  // Verify admin token and role with backend
  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (!user) {
        setVerifying(false)
        return
      }

      try {
        // First check if admin flag is in local state
        if (!isAdmin) {
          // Try to refresh admin status
          const isUserAdmin = await checkIsAdmin()
          if (!isUserAdmin) {
            console.warn('User is not authorized as admin')
            setVerificationFailed(true)
            setVerifying(false)
            return
          }
        }

        // If we have a known admin user, try to create the role entry first
        if (['336187fc-3f85-4de9-9df4-f5d42e5c0b92'].includes(user.id)) {
          try {
            await createAdminRole(user.id);
            console.log('Admin role created successfully for known admin user');
            setIsAdmin(true);
            setVerifying(false);
            return;
          } catch (e) {
            console.error('Failed to create admin role:', e);
            // Continue with normal verification
          }
        }

        // Perform second verification against user_roles table
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single()

          if (error) {
            if (error.code === '42P01') {
              // Table doesn't exist, try creating it
              await createAdminRole(user.id);
              setIsAdmin(true);
              setVerifying(false);
              return;
            } else if (error.code === 'PGRST116') {
              // No matching row found - not an admin
              console.log('No admin role found for user');
              setVerificationFailed(true);
              setIsAdmin(false);
            } else {
              console.error('Admin verification failed:', error)
              setVerificationFailed(true)
              toast.error('Admin verification failed', { id: 'admin-auth-failed' })
            }
          } else if (!data) {
            console.error('No admin role found')
            setVerificationFailed(true)
            toast.error('Admin verification failed', { id: 'admin-auth-failed' })
          } else {
            // Admin role found!
            console.log('Admin role verified from database');
            setIsAdmin(true);
            setVerificationFailed(false);
          }
        } catch (error) {
          console.error('Error during role check:', error)
          setVerificationFailed(true)
        }
      } catch (error) {
        console.error('Error during admin verification:', error)
        setVerificationFailed(true)
      } finally {
        setVerifying(false)
      }
    }

    verifyAdminAccess()
  }, [user, isAdmin, checkIsAdmin, setIsAdmin, createAdminRole])

  // Check for attempted security breaches or manipulation
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-verification if storage changes
      setVerifying(true)
      checkIsAdmin().then(() => setVerifying(false))
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [checkIsAdmin])

  if (loading || verifying) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  // Redirect to login if not logged in
  if (!user) {
    console.log('AdminRoute - Redirecting to login because user is not logged in')
    return <Navigate to="/login" replace />
  }
  
  // Redirect to home if logged in but not admin
  if (!isAdmin || verificationFailed) {
    console.log('AdminRoute - Access denied')
    toast.error('You do not have admin access', { id: 'admin-access-denied' })
    return <Navigate to="/" replace />
  }

  console.log('AdminRoute - Access granted to admin area')
  return children;
}

export default AdminRoute 