import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import './Auth.css'

const Login = () => {
  const { login, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isAdminLogin = searchParams.get('admin') === 'true'
  const [step, setStep] = useState(1) // 1: mobile, 2: OTP
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false) // Track if we're in the middle of login

  // Redirect if already logged in (but not during active login flow)
  useEffect(() => {
    // Only redirect if we're not in the middle of logging in
    if (isAuthenticated && !isLoggingIn && step === 1) {
      // Check if this is an admin login page
      if (isAdminLogin) {
        // If on admin login page and user is admin, redirect to admin
        if (isAdmin) {
          navigate('/admin', { replace: true })
        }
        // If not admin, stay on login page to show error
      } else {
        // Regular login - redirect based on user type
        // BUT: if user logged in via admin login, don't redirect to user section
        const isAdminLoginSession = localStorage.getItem('is_admin_login') === 'true'
        if (isAdminLoginSession) {
          // Admin login session - redirect to admin
          navigate('/admin', { replace: true })
        } else if (isAdmin) {
          // Regular admin user - redirect to admin
          navigate('/admin', { replace: true })
        } else {
          // Regular user - redirect to home
          navigate('/', { replace: true })
        }
      }
    }
  }, [isAuthenticated, isAdmin, isAdminLogin, isLoggingIn, step, navigate])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!mobile) {
      setError('Please enter mobile number')
      setLoading(false)
      return
    }

    try {
      await authAPI.sendOTP({
        mobile: mobile,
        purpose: 'login'
      })
      setStep(2)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setIsLoggingIn(true) // Mark that we're in the login process

    try {
      const response = await authAPI.verifyOTP({
        mobile: mobile,
        otp_code: otp,
        purpose: 'login'
      })
      
      // Store user data using AuthContext
      const userData = response.data.user
      
      // Debug logging
      console.log('User data received:', userData)
      console.log('Is admin?', userData.is_admin)
      console.log('Is admin login?', isAdminLogin)
      
      // Get tokens from response
      const tokens = response.data.tokens || null
      
      // If this is an admin login attempt
      if (isAdminLogin) {
        if (userData.is_admin === true || userData.is_admin === 'true') {
          // User is admin, login with tokens and redirect to admin dashboard
          login(userData, tokens, true) // Pass isAdminLogin = true
          console.log('Redirecting to admin dashboard...')
          // Use setTimeout to ensure state is updated and prevent useEffect from interfering
          setTimeout(() => {
            setIsLoggingIn(false)
            navigate('/admin', { replace: true })
          }, 50)
        } else {
          // User is not admin, show error message
          console.log('User is not admin, showing error')
          setError('Access Denied: This account does not have admin privileges. If you are the first user, you will be automatically granted admin access. Otherwise, please contact an existing administrator to enable admin access for your account via Django admin panel.')
          setIsLoggingIn(false)
          // Don't login, let them see the error
        }
      } else {
        // Regular login - login with tokens and redirect based on user type
        login(userData, tokens, false) // Pass isAdminLogin = false
        // Use setTimeout to ensure state is updated before navigation
        setTimeout(() => {
          setIsLoggingIn(false)
          if (userData.is_admin === true || userData.is_admin === 'true') {
            navigate('/admin', { replace: true })
          } else {
            navigate('/', { replace: true })
          }
        }, 50)
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid OTP. Please try again.')
      setIsLoggingIn(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>{isAdminLogin ? 'Admin Login' : 'Login'}</h2>
        {isAdminLogin && (
          <p className="admin-notice" style={{ 
            color: '#667eea', 
            marginBottom: '1rem', 
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            Admin access required. Only users with admin privileges can access the dashboard.
          </p>
        )}
        
        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value)
                  setError('')
                }}
                required
                pattern="[0-9]{10}"
                maxLength="10"
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            
            <p className="auth-link">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
            <p className="otp-info">OTP has been sent to {mobile}</p>
            
            <div className="form-group">
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value)
                  setError('')
                }}
                required
                maxLength="6"
                pattern="[0-9]{6}"
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Change Number
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login

