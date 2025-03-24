import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';

interface UserInfoProps {
  className?: string;
}

export const UserInfo: React.FC<UserInfoProps> = ({ className = '' }) => {
  const { user, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [profileForm, setProfileForm] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileForm.fullName,
          phone: profileForm.phone,
        },
      });

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      
      // Verify current password by attempting to sign in with it
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password: passwordForm.currentPassword,
        });
        
        if (error) {
          toast.error('Current password is incorrect');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error verifying current password:', error);
        toast.error('Failed to verify current password');
        setLoading(false);
        return;
      }
      
      // If we get here, current password is correct
      await changePassword(passwordForm.newPassword);
      
      toast.success('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-gray-900">Account Information</h2>
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="text-sm font-medium text-green-600 hover:text-green-800"
          >
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPasswordForm(false)}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleProfileUpdate}
              className="text-sm font-medium text-green-600 hover:text-green-800"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleProfileUpdate}>
        <div className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              disabled
              value={profileForm.email}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </form>

      {showPasswordForm && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}; 