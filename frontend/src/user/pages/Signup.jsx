import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import './Auth.css'

const Signup = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: form, 2: OTP
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: ''
  })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !isSigningUp) {
      navigate('/')
    }
  }, [isAuthenticated, isSigningUp, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'mobile') {
      setFormData({ ...formData, [name]: value.replace(/\D/g, '').slice(0, 10) })
    } else {
      setFormData({ ...formData, [name]: value })
    }
    setError('')
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    
    if (!formData.mobile || formData.mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    
    if (!formData.first_name || !formData.last_name) {
      setError('Please fill all required fields')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      await authAPI.sendOTP({ mobile: formData.mobile, purpose: 'signup' })
      setStep(2)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setIsSigningUp(true)

    try {
      // First verify OTP
      await authAPI.verifyOTP({ mobile: formData.mobile, otp_code: otp })
      
      // Then complete registration
      const response = await authAPI.completeRegistration({
        mobile: formData.mobile,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null
      })
      
      login(response.data.user, response.data.access_token, false)
      setTimeout(() => {
        setIsSigningUp(false)
        navigate('/', { replace: true })
      }, 50)
    } catch (error) {
      setError(error.response?.data?.error || 'Signup failed')
      setIsSigningUp(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>{step === 1 ? 'Sign Up' : 'Verify OTP'}</h2>
        
        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <input
                type="text"
                name="first_name"
                placeholder="First Name *"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="text"
                name="last_name"
                placeholder="Last Name *"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email (Optional)"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number *"
                value={formData.mobile}
                onChange={handleChange}
                maxLength="10"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            
            <p className="auth-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
            <p className="otp-info">OTP sent to {formData.mobile}</p>
            
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
              {loading ? 'Verifying...' : 'Verify & Sign Up'}
            </button>
            
            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} disabled={loading}>
              Change Details
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Signup
