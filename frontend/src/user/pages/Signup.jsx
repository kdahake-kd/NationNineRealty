import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.mobile || !formData.first_name || !formData.last_name) {
      setError('Please fill all required fields')
      setLoading(false)
      return
    }

    try {
      await authAPI.sendOTP({
        mobile: formData.mobile,
        purpose: 'signup'
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

    try {
      const response = await authAPI.verifyOTP({
        mobile: formData.mobile,
        otp_code: otp,
        purpose: 'signup',
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null
      })
      
      // Store user data using AuthContext with tokens
      const tokens = response.data.tokens || null
      login(response.data.user, tokens)
      
      // Redirect to home
      navigate('/')
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Sign Up</h2>
        
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
                required
                pattern="[0-9]{10}"
                maxLength="10"
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
            <p className="otp-info">OTP has been sent to {formData.mobile}</p>
            
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

export default Signup

