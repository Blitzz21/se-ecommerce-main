import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, isInitialized, checkIsAdmin } = useAuth()
  const [isChecking, setIsChecking] = React.useState(true)
  const [isVerified, setIsVerified] = React.useState(false)

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!user) {
        setIsChecking(false)
        return
      }

      try {
        console.log('AdminRoute - Verifying admin for user:', user.email);
        
        // Force check admin status
        const adminStatus = await checkIsAdmin();
        console.log('AdminRoute - Admin status check result:', adminStatus);
        
        // Also directly check database for double verification
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        
        if (error) {
          console.error('Error checking admin role directly:', error);
          setIsVerified(false);
        } else if (data) {
          console.log('AdminRoute - User has admin role in database');
          setIsVerified(true);
        } else {
          console.log('AdminRoute - User does NOT have admin role in database');
          setIsVerified(false);
        }
      } catch (error) {
        console.error('Error verifying admin status:', error)
        setIsVerified(false)
      } finally {
        setIsChecking(false)
      }
    }

    verifyAdmin()
  }, [user, checkIsAdmin])

  // Show loading state while checking admin status
  if (isChecking || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('AdminRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />
  }

  // Redirect to home if not admin or not verified
  if (!isAdmin || !isVerified) {
    console.log('AdminRoute - Not admin or not verified, redirecting to home');
    console.log('AdminRoute - isAdmin:', isAdmin, 'isVerified:', isVerified);
    return <Navigate to="/" replace />
  }

  console.log('AdminRoute - Access granted to admin area');
  return <>{children}</>
}

export default AdminRoute 