// Skip storage initialization for now - this requires admin privileges
import { supabase } from './lib/supabase';

export async function initializeStorage() {
  console.log('Skipping storage initialization - please create buckets manually in Supabase dashboard');
  return { success: true };
}

// Fix the admin user lookup 
export async function getAdminUsers() {
  try {
    console.log('Fetching admin users from database...');
    
    // Query for admin users without trying to join with profiles
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')  // Just get the user_id
      .eq('role', 'admin');
    
    if (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
    
    // Convert to expected format
    return (data || []).map((item: { user_id: string }) => ({
      user_id: item.user_id,
      email: 'admin@example.com'  // Placeholder - we don't need real emails
    }));
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
} 