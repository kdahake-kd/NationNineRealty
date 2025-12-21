/**
 * User Login Page
 * OTP-based authentication for normal users only
 * Admin users should use /admin/login
 */
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import './Auth.css'

const Login = () => {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  
  // For normal user: step 1 = mobile, step 2 = OTP, step 3 = registration (if needed)
  const [step, setStep] = useState(1)
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Redirect if already logged in as normal user (not admin)
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('access_token')
    const isAdminLogin = localStorage.getItem('is_admin_login') === 'true'
    
    // Only redirect if user is logged in and NOT an admin login
    if (storedUser && accessToken && !isAdminLogin && !isLoggingIn) {
      try {
        const userData = JSON.parse(storedUser)
        const userIsAdmin = userData?.is_admin || userData?.is_staff || userData?.is_superuser
        
        // If user is admin, redirect to admin dashboard
        if (userIsAdmin) {
          navigate('/admin', { replace: true })
        } else {
          // Normal user - redirect to home
          navigate('/', { replace: true })
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [isLoggingIn, navigate])
  
  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Normal user - send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      await authAPI.sendOTP({ mobile, purpose: 'login' })
      setStep(2)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Normal user - verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setIsLoggingIn(true)

    try {
      const response = await authAPI.verifyOTP({ mobile, otp_code: otp })
      
      if (response.data.needs_registration) {
        // User needs to complete registration
        setStep(3)
        setIsLoggingIn(false)
      } else {
        // User is registered, login directly
        // Store user data and token (NOT admin login)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.removeItem('is_admin_login') // Ensure not marked as admin
        
        login(response.data.user, response.data.access_token, false)
        setTimeout(() => {
          setIsLoggingIn(false)
          navigate('/', { replace: true })
        }, 50)
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid OTP')
      setIsLoggingIn(false)
    } finally {
      setLoading(false)
    }
  }

  // Complete registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name) {
      setError('First name and last name are required')
      return
    }
    
    setLoading(true)
    setError('')
    setIsLoggingIn(true)

    try {
      const response = await authAPI.completeRegistration({
        mobile,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null
      })
      
      // Store user data and token (NOT admin login)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.removeItem('is_admin_login') // Ensure not marked as admin
      
      login(response.data.user, response.data.access_token, false)
      setTimeout(() => {
        setIsLoggingIn(false)
        navigate('/', { replace: true })
      }, 50)
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed')
      setIsLoggingIn(false)
    } finally {
      setLoading(false)
    }
  }

  // Normal User Login Form (OTP based)
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>
          {step === 1 && 'Login'}
          {step === 2 && 'Verify OTP'}
          {step === 3 && 'Complete Profile'}
        </h2>
        
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }}
                maxLength="10"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            
            <p className="auth-link">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </form>
        )}
        
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
            <p className="otp-info">OTP sent to {mobile}</p>
            
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                maxLength="6"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} disabled={loading}>
              Change Number
            </button>
          </form>
        )}
        
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
            <p className="otp-info">Complete your profile to continue</p>
            
            <div className="form-group">
              <input
                type="text"
                placeholder="First Name *"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="text"
                placeholder="Last Name *"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="email"
                placeholder="Email (Optional)"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login
