import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Helmet } from 'react-helmet-async'

interface LoginProps {
  isRegister?: boolean;
}

const Login: React.FC<LoginProps> = ({ isRegister = false }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isValidPassword, setIsValidPassword] = useState(true)
  const [isAvailable, setIsAvailable] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(!isRegister)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!email || isLogin) return
      
      try {
        // Check if email exists in profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)
          .single();
        
        if (profileData) {
          setIsAvailable(false);
          setError('Email already exists');
          return;
        }
        
        // Additional check against auth metadata
        try {
          // Try to check if account exists via a sign-in attempt with a known-invalid password
          // This will return a specific error if the email exists but password is wrong
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password: 'checkIfEmailExists_1234567890!', // Deliberately wrong password
          });
          
          if (error && error.message.includes('Invalid login credentials')) {
            // Email exists, but password is wrong (which is expected here)
            setIsAvailable(false);
            setError('Email already exists');
          } else {
            // Any other error means email likely doesn't exist in auth
            setIsAvailable(true);
            setError('');
          }
        } catch (signInError) {
          console.error('Error during availability check:', signInError);
          // Default to available if we can't determine
          setIsAvailable(true);
          setError('');
        }
      } catch (err) {
        // If we get a "not found" error from profiles, that's good - email isn't registered
        if (err instanceof Error && err.message.includes('PGRST116')) {
          setIsAvailable(true);
          setError('');
        } else {
          console.error('Error checking email:', err);
        }
      }
    };
    
    const debounce = setTimeout(checkEmailAvailability, 500);
    return () => clearTimeout(debounce);
  }, [email, isLogin]);

  useEffect(() => {
    if (!isLogin) {
      const isValid = password.length >= 6
      setIsValidPassword(isValid)
      setError(isValid ? '' : 'Password must be at least 6 characters')
    }
  }, [password, isLogin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLogin) {
      if (!isValidPassword) {
        setError('Please fix password validation errors')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      
      // Perform one final check to make sure the email is available
      try {
        const { data } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)
          .single()
        
        if (data) {
          setError('This email is already registered. Please use a different email or sign in.')
          return
        }
      } catch (err) {
        // If error is PGRST116 (not found), that's good - it means the email is available
        if (err instanceof Error && !err.message.includes('PGRST116')) {
          console.error('Error checking email availability:', err)
        }
      }
    }

    try {
      setError('')
      setLoading(true)
      
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        if (data?.user) {
          navigate(from, { replace: true })
        }
      } else {
        // For registration, we'll use the regular sign-up method first
        console.log('Attempting to sign up user with email:', email);
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0],
              email_confirmed: false
            }
          }
        })
        
        console.log('Sign up response:', { data, error });
        
        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('This email is already registered. Please use a different email or sign in.')
          }
          throw error
        }
        
        // If sign up is successful and credentials are created
        if (data?.user) {
          setRegistrationSuccess(true)
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err)
      setError(err.message || (isLogin ? 'Invalid credentials' : 'Failed to create account'))
      setLoading(false)
    }
  }

  // Display registration success screen
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Helmet>
          <title>Registration Successful | ShopSmart</title>
        </Helmet>
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Account Created Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Please check your email for a confirmation link to verify your account.
            </p>
            <p className="text-gray-500 text-sm mb-4">
              If you don't see the email, please check your spam folder.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Helmet>
        <title>{isLogin ? 'Sign In' : 'Create Account'} | ShopSmart</title>
      </Helmet>
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            {isLogin ? 'Sign in to your account' : 'Create an account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {error === 'Account created successfully! Please check your email for verification.' && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-700">{error}</p>
              <p className="text-sm text-gray-500 mt-2">
                If you don't see the email, please check your spam folder.
              </p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none z-0 rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 z-10 right-0 pr-3 text-xs flex items-center hover:cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {!isLogin && (
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none z-0 rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create Account')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                navigate(isLogin ? '/register' : '/login');
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {isLogin ? 'Need an account? Register' : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login 