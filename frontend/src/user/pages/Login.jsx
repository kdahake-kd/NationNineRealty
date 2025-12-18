import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import './Auth.css'

const Login = () => {
  const { login, isAuthenticated, isAdmin, isLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isAdminLogin = searchParams.get('admin') === 'true'
  
  // For normal user: step 1 = mobile, step 2 = OTP, step 3 = registration (if needed)
  // For admin: single step with username + password
  const [step, setStep] = useState(1)
  const [mobile, setMobile] = useState('')
  const [username, setUsername] = useState('') // For admin login
  const [password, setPassword] = useState('') // For admin login
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Redirect if already logged in (wait for loading to complete)
  // Skip this on initial render to avoid race conditions
  useEffect(() => {
    if (isLoading) return // Wait for auth state to load
    
    // Check localStorage directly for more reliable auth state
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('access_token')
    const hasAuth = storedUser && accessToken
    
    if (hasAuth && !isLoggingIn) {
      const userData = JSON.parse(storedUser)
      const userIsAdmin = userData?.is_admin || userData?.is_staff || userData?.is_superuser
      
      if (isAdminLogin) {
        if (userIsAdmin) {
          navigate('/admin', { replace: true })
        }
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [isAdminLogin, isLoggingIn, isLoading, navigate])
  
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

  // Admin login with username/password
  const handleAdminLogin = async (e) => {
    e.preventDefault()
    
    // Get values from form directly (handles browser autofill)
    const form = e.target
    const formUsername = form.elements.username?.value || username
    const formPassword = form.elements.password?.value || password
    
    if (!formUsername || !formPassword) {
      setError('Please enter username and password')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.adminLogin({ username: formUsername, password: formPassword })
      const { user: userData, access_token, refresh_token } = response.data
      
      // Store in localStorage FIRST
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('login_time', Date.now().toString())
      localStorage.setItem('is_admin_login', 'true')
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token)
      }
      
      // Update auth context (this will update React state)
      login(userData, access_token, true)
      
      // Set isLoggingIn to prevent useEffect from interfering
      setIsLoggingIn(true)
      
      // Small delay to ensure state updates propagate, then navigate
      setLoading(false)
      setTimeout(() => {
        navigate('/admin', { replace: true })
      }, 100)
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid credentials')
      setLoading(false)
    }
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

  // Admin Login Form
  if (isAdminLogin) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h2>Admin Login</h2>
          <p className="admin-notice" style={{ 
            color: '#667eea', 
            marginBottom: '1rem', 
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            Use your admin credentials (createsuperuser)
          </p>
          
          <form onSubmit={handleAdminLogin} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError('') }}
                autoComplete="username"
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                autoComplete="current-password"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
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
