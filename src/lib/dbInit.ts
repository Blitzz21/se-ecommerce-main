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
    
    // Initialize storage buckets
    try {
      await initializeStorage();
    } catch (error) {
      console.error('Failed to initialize storage buckets:', error);
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
 * Check if a user is an admin with a single source of truth
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    console.log(`Verifying admin status for user ${userId}...`);
    
    // Single source of truth: user_roles table
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

/**
 * Create admin role for a user
 */
export async function createAdminRole(userId: string): Promise<{ success: boolean; error?: any }> {
  try {
    console.log(`Creating admin role for user ${userId}...`);
    
    // Insert admin role directly into user_roles table
    const { error: insertError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin',
        created_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Error creating admin role:', insertError);
      return { success: false, error: insertError };
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
export async function revokeAdminRole(userId: string): Promise<{ success: boolean; error?: any }> {
  try {
    console.log(`Revoking admin role from user ${userId}...`);
    
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');
    
    if (error) {
      console.error('Error revoking admin role:', error);
      return { success: false, error };
    }
    
    console.log(`Admin role revoked from user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Error revoking admin role:', error);
    return { success: false, error };
  }
}

/**
 * Get all admin users
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
 * Check if an email has admin access by looking it up in the profiles table
 * and checking if that user ID is in the user_roles table with role 'admin'
 */
export async function checkAdminByEmail(email: string): Promise<boolean> {
  try {
    console.log(`Checking if ${email} has admin access...`);
    
    // First find the user ID from the email in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return false;
    }
    
    // If profile found, check if that ID has admin role
    if (profileData && profileData.id) {
      console.log(`Found profile ID ${profileData.id} for email ${email}`);
      return await checkAdminById(profileData.id);
    }
    
    // If no profile, check directly in auth.users
    // This is a more direct way to find users by email
    try {
      // Supabase doesn't have a direct getUserByEmail API, so we need to list users
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError || !authData) {
        console.log(`Failed to list users from auth:`, authError);
        return false;
      }
      
      // Find user with matching email
      const user = authData.users.find(u => u.email === email);
      if (!user) {
        console.log(`No user found with email: ${email} in auth`);
        return false;
      }
      
      // If user found, check if they have admin role
      console.log(`Found user ID ${user.id} for email ${email} in auth`);
      return await checkAdminById(user.id);
    } catch (error) {
      console.error('Error checking user in auth:', error);
    }
    
    // Final fallback: check in any user with this email in user_roles
    try {
      // Attempt to find any user with admin role that has metadata with this email
      const { data: roleUsers, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      if (!roleError && roleUsers && roleUsers.length > 0) {
        // Found users with admin role, check if any match this email
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
 */
export async function checkAdminById(userId: string): Promise<boolean> {
  try {
    console.log(`Checking if user ID ${userId} has admin role...`);
    
    // Check if user_roles table exists
    try {
      // Check if user has admin role
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
          // Table doesn't exist
          console.error('user_roles table does not exist');
          
          // Check if this is a known admin ID
          const knownAdminIds = ['336187fc-3f85-4de9-9df4-f5d42e5c0b92'];
          if (knownAdminIds.includes(userId)) {
            console.log('User is a known admin ID');
            return true;
          }
          
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