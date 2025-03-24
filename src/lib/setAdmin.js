import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  'https://bxgpysdkbycluoggsrcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z3B5c2RrYnljbHVvZ2dzcmNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDY1MjE3OCwiZXhwIjoyMDE2MjI4MTc4fQ.XCnZ9Xm4X4ZdFLVqKAaWIfWL2zZ75Jx4CmXUQfBE9TI'
);

const userId = '336187fc-3f85-4de9-9df4-f5d42e5c0b92';
const userEmail = 'johnfloydmarticio212005@gmail.com';

// Function to directly set user as admin by inserting into user_roles table
async function setAdminRole() {
  try {
    console.log(`Setting admin role for user ID: ${userId} (${userEmail})`);
    
    // Make sure the user_roles table exists
    const { error: tableError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, role)
      );
    `);
    
    if (tableError) {
      console.error('Error creating user_roles table:', tableError);
    } else {
      console.log('Ensured user_roles table exists');
    }
    
    // Check if user exists in auth.users
    const { data: userData, error: userCheckError } = await supabase.auth.admin.getUserById(userId);
    
    if (userCheckError) {
      console.error('Error checking user:', userCheckError);
      return;
    }
    
    if (!userData || !userData.user) {
      console.error('User not found:', userId);
      return;
    }
    
    console.log('User found:', userData.user.email);
    
    // First clear any existing roles to avoid conflicts
    const { error: clearError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
      
    if (clearError) {
      console.error('Error clearing existing roles:', clearError);
    } else {
      console.log('Cleared existing roles');
    }
    
    // Insert into user_roles table with service role permissions
    const { data, error } = await supabase
      .from('user_roles')
      .insert([
        { 
          user_id: userId, 
          role: 'admin',
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error setting admin role:', error);
    } else {
      console.log('Admin role set successfully in user_roles table');
    }
    
    // Update the user metadata with is_admin flag
    const { data: metadataData, error: metadataError } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: { 
          is_admin: true 
        },
        app_metadata: {
          role: 'admin'
        }
      }
    );
    
    if (metadataError) {
      console.error('Error updating user metadata:', metadataError);
    } else {
      console.log('User metadata updated successfully');
    }
    
    // Verify the changes
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
      
    if (verifyError) {
      console.error('Error verifying role:', verifyError);
    } else {
      console.log('User roles verified:', verifyData);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
setAdminRole(); 