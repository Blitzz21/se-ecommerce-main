import { supabase } from './supabase';
import { initializeProducts } from './initializeProducts';
import { initializeOrders } from './initializeOrders';

/**
 * Simplified database initialization
 */
export async function initDb() {
  try {
    console.log('Starting database initialization...');
    
    // Create user_roles table if it doesn't exist
    try {
      // First try with RPC method
      const { error: userRolesError } = await supabase.rpc('execute_sql', {
        sql: `CREATE TABLE IF NOT EXISTS public.user_roles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(user_id, role)
        );`
      });
      
      if (userRolesError) {
        console.error('Error creating user_roles table with RPC:', userRolesError);
        throw userRolesError;
      } else {
        console.log('user_roles table created or already exists');
      }
    } catch (error) {
      console.error('Error with user_roles table creation:', error);
      console.log('Continuing with other initialization...');
    }
    
    // Ensure known admin user has the role
    try {
      await createAdminRole('336187fc-3f85-4de9-9df4-f5d42e5c0b92'); // johnfloydmarticio212005@gmail.com
    } catch (error) {
      console.error('Failed to ensure admin role for known user:', error);
    }
    
    // Initialize products
    await initializeProducts();
    
    // Initialize orders
    await initializeOrders();
    
    console.log('Database initialization completed');
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
}

/**
 * Set admin role for a user
 */
export async function setAdmin(userEmail: string) {
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
      await supabase.auth.updateUser({
        data: { is_admin: true }
      });
    } catch (updateError) {
      console.error('Error updating user metadata:', updateError);
    }
    
    console.log(`User ${userEmail} has been granted admin role.`);
    return { success: true, message: 'Admin role granted' };
    
  } catch (error) {
    console.error('Unexpected error setting up admin user:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Set admin role for a user by directly inserting into user_roles table
 */
export async function createAdminRole(userId: string) {
  try {
    console.log(`Creating admin role for user ${userId}...`);
    
    // First ensure the table exists
    const { error: tableError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_roles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(user_id, role)
        );
      `
    });
    
    if (tableError) {
      console.error('Error creating user_roles table:', tableError);
    }
    
    // Insert admin role directly
    const { data, error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin',
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,role' });
    
    if (error) {
      console.error('Error inserting admin role:', error);
      return { success: false, error };
    }
    
    // Also update user metadata
    try {
      await supabase.auth.updateUser({
        data: { is_admin: true }
      });
      console.log('Updated user metadata with admin flag');
    } catch (updateError) {
      console.error('Error updating user metadata:', updateError);
    }
    
    console.log(`Admin role created for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating admin role:', error);
    return { success: false, error };
  }
}

/**
 * Revoke admin role from a user
 */
export async function revokeAdmin(userEmail: string) {
  try {
    console.log(`Revoking admin role for user ${userEmail}...`);
    
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
    
    // Remove user from user_roles table
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');
    
    if (deleteError) {
      console.error('Error deleting role:', deleteError);
      return { success: false, error: 'Database error removing role' };
    }
    
    // Also update user metadata
    try {
      await supabase.auth.updateUser({
        data: { is_admin: false }
      });
    } catch (updateError) {
      console.error('Error updating user metadata:', updateError);
    }
    
    console.log(`User ${userEmail} admin role has been revoked.`);
    return { success: true, message: 'Admin role revoked' };
    
  } catch (error) {
    console.error('Unexpected error revoking admin role:', error);
    return { success: false, error: 'Unexpected error' };
  }
} 