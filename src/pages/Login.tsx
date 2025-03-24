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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(!isRegister)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (!isLogin) {
      const isValid = password.length >= 6
      setIsValidPassword(isValid)
      setError(isValid ? '' : 'Password must be at least 6 characters')
    }
  }, [password, isLogin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!isLogin) {
      if (!isValidPassword) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }
      
      try {
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
            setError('This email is already registered. Please use a different email or sign in.')
          } else if (error.message.includes('password')) {
            setError('Password must be at least 6 characters')
          } else {
            setError(error.message || 'Failed to create account')
          }
          setLoading(false)
          return
        }
        
        if (data?.user) {
          // Create a profile for the user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                name: email.split('@')[0]
              }
            ])
          
          if (profileError) {
            console.error('Error creating profile:', profileError)
            // Don't show error to user since account was created
            // Just log it for debugging
          }
          
          setRegistrationSuccess(true)
        }
      } catch (err: any) {
        console.error('Registration error:', err)
        setError(err.message || 'Failed to create account')
        setLoading(false)
      }
    } else {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        if (data?.user) {
          navigate(from, { replace: true })
        }
      } catch (err: any) {
        console.error('Login error:', err)
        setError(err.message || 'Invalid credentials')
        setLoading(false)
      }
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