import { supabase } from './supabase';

/**
 * This script can be used to promote a user to admin role. 
 * Run this in a development environment or in a secure context.
 * IMPORTANT: This should never be exposed to client-side code in production.
 */

const setUpAdminUser = async (userEmail: string, shouldBeAdmin: boolean = true) => {
  try {
    console.log(`Setting up admin role for user ${userEmail}...`);
    
    // First, get the user ID from the email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (userError || !userData) {
      console.error('User not found:', userError);
      return { success: false, error: 'User not found' };
    }
    
    const userId = userData.id;
    
    // Check if the user role entry exists
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
      
    if (roleError && roleError.code !== 'PGRST116') {
      console.error('Error checking existing role:', roleError);
      return { success: false, error: 'Database error checking role' };
    }
    
    if (shouldBeAdmin) {
      // If we want to make the user an admin and they're not already one
      if (!existingRole) {
        // Create user_roles record
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'admin',
            created_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error inserting role:', insertError);
          return { success: false, error: 'Database error creating role' };
        }
        
        // Also update user metadata
        try {
          // Try to use updateUser instead of admin.updateUserById which might not be available
          await supabase.auth.updateUser({
            data: { is_admin: true }
          });
          console.log('Updated user metadata with admin status');
        } catch (updateError) {
          console.error('Error updating user metadata:', updateError);
          // Non-fatal, continue anyway
        }
        
        console.log(`✅ User ${userEmail} (${userId}) has been granted admin role.`);
        return { success: true, message: 'Admin role granted' };
      } else {
        console.log(`⚠️ User ${userEmail} already has admin role.`);
        return { success: true, message: 'User is already an admin' };
      }
    } else {
      // If we want to remove admin role
      if (existingRole) {
        // Remove user_roles record
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        
        if (deleteError) {
          console.error('Error removing role:', deleteError);
          return { success: false, error: 'Database error removing role' };
        }
        
        // Also update user metadata
        try {
          await supabase.auth.updateUser({
            data: { is_admin: false }
          });
        } catch (updateError) {
          console.error('Error updating user metadata:', updateError);
          // Non-fatal, continue anyway
        }
        
        console.log(`✅ Admin role removed from user ${userEmail} (${userId}).`);
        return { success: true, message: 'Admin role removed' };
      } else {
        console.log(`⚠️ User ${userEmail} doesn't have admin role to remove.`);
        return { success: true, message: 'User is not an admin' };
      }
    }
  } catch (error) {
    console.error('Unexpected error setting up admin user:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Run this function in development to create your admin
 * Example usage:
 * 
 * import { initAdminUser } from './lib/adminSetup';
 * 
 * // In a development environment
 * if (process.env.NODE_ENV === 'development') {
 *   initAdminUser('your-email@example.com');
 * }
 */
const initAdminUser = async (email: string) => {
  const result = await setUpAdminUser(email, true);
  console.log('Admin setup result:', result);
  return result;
}

export { setUpAdminUser, initAdminUser }; 