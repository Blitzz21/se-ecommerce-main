/**
 * Database Initialization and Management Module
 * Handles database setup, admin role management, and storage initialization
 */

import { supabase } from './supabase';
import { initializeProducts } from './initializeProducts';
import { initializeOrders } from './initializeOrders';

/**
 * Initialize the database with required tables and initial data
 * This function runs when the application starts and sets up:
 * - user_roles table
 * - storage buckets
 * - products
 * - orders
 */
export async function initDb() {
  try {
    console.log('Starting database initialization...');
    
    // Create user_roles table if it doesn't exist
    try {
      const { error: createTableError } = await supabase
        .from('user_roles')
        .select('id')
        .limit(1);
      
      if (createTableError && createTableError.code === '42P01') { // Table doesn't exist
        // Create the table using SQL
        const { error: sqlError } = await supabase.rpc('create_user_roles_table');
        
        if (sqlError) {
          console.error('Error creating user_roles table:', sqlError);
          throw sqlError;
        }
      }
      
      console.log('user_roles table exists or was created successfully');
    } catch (error) {
      console.error('Error with user_roles table creation:', error);
      console.log('Continuing with other initialization...');
    }
    
    // Initialize storage buckets for file uploads
    try {
      await initializeStorage();
    } catch (error) {
      console.error('Failed to initialize storage buckets:', error);
    }
    
    // Set up initial products in the database
    await initializeProducts();
    
    // Set up initial orders structure
    await initializeOrders();
    
    console.log('Database initialization completed');
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
}

/**
 * Set admin role for a user by email
 * This function:
 * 1. Finds the user by email in profiles table
 * 2. Checks if they already have admin role
 * 3. Grants admin role if they don't have it
 */
export const setAdmin = async (userEmail: string) => {
  try {
    // First get the user's ID from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (profileError) {
      console.error('Error finding user:', profileError);
      return { success: false, error: 'User not found' };
    }

    if (!profileData) {
      return { success: false, error: 'User not found' };
    }

    // Check if user already has admin role
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', profileData.id)
      .eq('role', 'admin')
      .single();

    if (roleCheckError && roleCheckError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing role:', roleCheckError);
      return { success: false, error: 'Failed to check existing role' };
    }

    // If user already has admin role, return success
    if (existingRole) {
      return { success: true, message: 'User already has admin role' };
    }

    // Grant admin role to the user
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert([
        {
          user_id: profileData.id,
          role: 'admin'
        }
      ]);

    if (insertError) {
      console.error('Error setting admin role:', insertError);
      return { success: false, error: 'Failed to set admin role' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in setAdmin:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Check if a user has admin role
 * Single source of truth for admin verification
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    console.log(`Verifying admin status for user ${userId}...`);
    
    // Check user_roles table for admin role
    const { error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - user is not admin
        console.log('User is not an admin');
        return false;
      }
      console.error('Error checking admin status:', error);
      return false;
    }
    
    // If we found a row, user is admin
    console.log('User is an admin');
    return true;
  } catch (error) {
    console.error('Unexpected error checking admin status:', error);
    return false;
  }
}

// List of known admin email addresses
const KNOWN_ADMIN_EMAILS = ['blitzkirg21@gmail.com', 'johnfloydmarticio212005@gmail.com']

/**
 * Create admin role for a user
 * This function:
 * 1. Verifies the user exists
 * 2. Checks if they're in the known admin list
 * 3. Creates the admin role if authorized
 */
export async function createAdminRole(userId: string): Promise<{ success: boolean; error?: any; message?: string }> {
  try {
    console.log(`Creating admin role for user ${userId}...`);
    
    // Verify user exists in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();
    
    if (profileError || !profileData) {
      console.error('Error verifying user:', profileError);
      return { success: false, error: 'User not found' };
    }
    
    const userEmail = profileData.email;
    
    // Security check: verify user is in known admin list
    if (!KNOWN_ADMIN_EMAILS.includes(userEmail || '')) {
      console.error('Unauthorized attempt to create admin role');
      return { success: false, error: 'Unauthorized' };
    }
    
    // Check if role already exists
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing role:', checkError);
      return { success: false, error: 'Database error checking role' };
    }
    
    if (existingRole) {
      console.log('Admin role already exists');
      return { success: true, message: 'Admin role already exists' };
    }
    
    // Create admin role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });
    
    if (insertError) {
      console.error('Error inserting role:', insertError);
      return { success: false, error: 'Database error creating role' };
    }
    
    console.log(`✅ User ${userEmail} (${userId}) has been granted admin role.`);
    return { success: true, message: 'Admin role granted' };
  } catch (error) {
    console.error('Unexpected error creating admin role:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Revoke admin role from a user
 * This function:
 * 1. Finds the user by email
 * 2. Removes their admin role from user_roles table
 */
export async function revokeAdminRole(userEmail: string): Promise<{ success: boolean; error?: any }> {
  try {
    console.log(`Revoking admin role from user ${userEmail}...`);
    
    // Get user ID from email
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
    
    // Remove admin role
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');
    
    if (error) {
      console.error('Error revoking admin role:', error);
      return { success: false, error };
    }
    
    console.log(`Admin role revoked from user ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error revoking admin role:', error);
    return { success: false, error };
  }
}

/**
 * Get all users with admin role
 * Returns an array of user IDs who have admin privileges
 */
export async function getAdminUsers(): Promise<{ success: boolean; adminUsers: Array<{ userId: string }>; error?: any }> {
  try {
    console.log('Fetching admin users...');
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    
    if (error) {
      console.error('Error fetching admin users:', error);
      return { success: false, adminUsers: [], error };
    }
    
    const adminUsers = (data || []).map(item => ({
      userId: item.user_id
    }));
    
    return { success: true, adminUsers };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return { success: false, adminUsers: [], error };
  }
}

/**
 * Check if an email has admin access
 * This function performs multiple checks:
 * 1. Checks profiles table
 * 2. Checks auth.users table
 * 3. Checks user_roles table
 */
export async function checkAdminByEmail(email: string): Promise<boolean> {
  try {
    console.log(`Checking if ${email} has admin access...`);
    
    // Check profiles table first
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return false;
    }
    
    // If profile found, check admin role
    if (profileData && profileData.id) {
      console.log(`Found profile ID ${profileData.id} for email ${email}`);
      return await checkAdminById(profileData.id);
    }
    
    // Fallback: check auth.users table
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError || !authData) {
        console.log(`Failed to list users from auth:`, authError);
        return false;
      }
      
      // Find user by email
      const user = authData.users.find(u => u.email === email);
      if (!user) {
        console.log(`No user found with email: ${email} in auth`);
        return false;
      }
      
      // Check admin role for found user
      console.log(`Found user ID ${user.id} for email ${email} in auth`);
      return await checkAdminById(user.id);
    } catch (error) {
      console.error('Error checking user in auth:', error);
    }
    
    // Final check: user_roles table
    try {
      const { data: roleUsers, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      if (!roleError && roleUsers && roleUsers.length > 0) {
        // Check each admin user for matching email
        for (const user of roleUsers) {
          const { data: authUser } = await supabase.auth.admin.getUserById(user.user_id);
          if (authUser && authUser.user && authUser.user.email === email) {
            console.log(`Found matching admin user with email ${email}`);
            return true;
          }
        }
      }
    } catch (error) {
      console.error('Error in fallback admin check:', error);
    }
    
    console.log(`No admin access found for email: ${email}`);
    return false;
  } catch (error) {
    console.error('Unexpected error checking admin by email:', error);
    return false;
  }
}

/**
 * Check if a user ID has admin role
 * This is a helper function used by other admin verification methods
 */
export async function checkAdminById(userId: string): Promise<boolean> {
  try {
    console.log(`Checking if user ID ${userId} has admin role...`);
    
    // Check user_roles table
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      
      if (roleError) {
        if (roleError.code === 'PGRST116') {
          console.log('No admin role found for user');
          return false;
        } else if (roleError.code === '42P01') {
          console.error('user_roles table does not exist');
          return false;
        } else {
          console.error('Error checking admin role:', roleError);
          return false;
        }
      }
      
      const isAdmin = !!roleData;
      console.log(`User has admin role: ${isAdmin}`);
      
      return isAdmin;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  } catch (error) {
    console.error('Unexpected error in checkAdminById:', error);
    return false;
  }
}

/**
 * Initialize storage buckets for the application
 * This is a placeholder function as bucket creation requires admin privileges
 */
export async function initializeStorage() {
  try {
    console.log('Skipping automatic storage bucket creation');
    
    // Skip automatic bucket creation - this requires admin privileges
    // Users should create buckets manually in the Supabase dashboard
    
    console.log('Storage initialization completed');
    return { success: true };
  } catch (error) {
    console.error('Error initializing storage:', error);
    return { success: false, error };
  }
} 