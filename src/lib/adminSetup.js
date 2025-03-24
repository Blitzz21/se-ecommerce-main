import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  'https://bxgpysdkbycluoggsrcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z3B5c2RrYnljbHVvZ2dzcmNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDY1MjE3OCwiZXhwIjoyMDE2MjI4MTc4fQ.XCnZ9Xm4X4ZdFLVqKAaWIfWL2zZ75Jx4CmXUQfBE9TI'
);

/**
 * Comprehensive function to set up a user as an admin
 * 
 * @param {string} userId - The UUID of the user to make admin
 * @param {string} [userEmail] - Optional email for logging purposes
 */
async function setupAdmin(userId, userEmail = 'Unknown') {
  console.log(`==========================================`);
  console.log(`ADMIN SETUP: Starting admin setup for user ${userId} (${userEmail})`);
  console.log(`==========================================`);

  try {
    // 1. Check if the user exists
    console.log('Checking if user exists...');
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData || !userData.user) {
      console.error('❌ Error: User not found:', userError || 'No user data returned');
      return;
    }
    
    console.log(`✅ User found: ${userData.user.email}`);
    
    // 2. Create user_roles table if it doesn't exist
    console.log('Checking user_roles table...');
    
    try {
      // First try to query the table to see if it exists
      const { data, error } = await supabase
        .from('user_roles')
        .select('count(*)', { count: 'exact', head: true });
      
      if (error && error.code === '42P01') { // Table doesn't exist error code
        console.log('User_roles table does not exist, creating it...');
        
        // Create the table
        const { error: createError } = await supabase.query(`
          CREATE TABLE IF NOT EXISTS user_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, role)
          );
        `);
        
        if (createError) {
          console.error('❌ Error creating user_roles table:', createError);
          return;
        }
        
        console.log('✅ user_roles table created successfully');
      } else {
        console.log('✅ user_roles table already exists');
      }
    } catch (tableError) {
      console.error('❌ Error checking/creating table:', tableError);
      return;
    }
    
    // 3. Add the user to the user_roles table as an admin
    console.log('Adding user to user_roles table...');
    
    // First clear any existing roles to avoid conflicts
    const { error: clearError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
      
    if (clearError) {
      console.log('⚠️ Warning clearing existing roles:', clearError);
    }
    
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .insert([
        { 
          user_id: userId, 
          role: 'admin',
          created_at: new Date().toISOString()
        }
      ]);
    
    if (roleError) {
      console.error('❌ Error setting admin role in database:', roleError);
    } else {
      console.log('✅ Admin role added to database');
    }
    
    // 4. Update user metadata to mark as admin
    console.log('Updating user metadata...');
    const { data: metaData, error: metaError } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: { is_admin: true },
        app_metadata: { role: 'admin' }
      }
    );
    
    if (metaError) {
      console.error('❌ Error updating user metadata:', metaError);
    } else {
      console.log('✅ User metadata updated successfully');
    }
    
    // 5. Verify everything was set up correctly
    console.log('Verifying admin setup...');
    
    // Check user_roles table
    const { data: verifyRoles, error: verifyRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
      
    if (verifyRolesError) {
      console.error('❌ Error verifying roles:', verifyRolesError);
    } else if (!verifyRoles || verifyRoles.length === 0) {
      console.error('❌ No roles found in database for user');
    } else {
      console.log('✅ User roles verified in database:', verifyRoles);
    }
    
    // Check user metadata
    const { data: verifyUser, error: verifyUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (verifyUserError) {
      console.error('❌ Error verifying user metadata:', verifyUserError);
    } else {
      console.log('✅ User metadata:', verifyUser.user.user_metadata);
      console.log('✅ App metadata:', verifyUser.user.app_metadata);
    }
    
    // Final status
    console.log(`==========================================`);
    console.log(`ADMIN SETUP: Completed admin setup for user ${userId}`);
    console.log(`The user should now have admin access on next login`);
    console.log(`If issues persist, try having the user log out and log in again`);
    console.log(`==========================================`);
    
  } catch (error) {
    console.error('❌ Unexpected error in admin setup:', error);
  }
}

// Example usage - Set a user as admin
// You can modify this with the specific user ID you want to make admin
const targetUserId = '336187fc-3f85-4de9-9df4-f5d42e5c0b92';
const targetUserEmail = 'johnfloydmarticio212005@gmail.com';

// Run the setup for the target user
setupAdmin(targetUserId, targetUserEmail);

// Instructions for running this script:
// 1. Save this file to your project
// 2. Run with Node.js: node src/lib/adminSetup.js
// 3. Check the console output to see if setup was successful 