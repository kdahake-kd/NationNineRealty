import React, { useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import './LoginModal.css'

const LoginModal = ({ isOpen, onClose }) => {
  const { login, isAuthenticated } = useAuth()
  const [step, setStep] = useState(1) // 1: mobile, 2: OTP, 3: registration
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Close modal if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      onClose()
    }
  }, [isAuthenticated, onClose])

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

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.verifyOTP({ mobile, otp_code: otp })
      
      if (response.data.needs_registration) {
        // User needs to complete registration
        setStep(3)
      } else {
        // User is registered, login directly
        login(response.data.user, response.data.access_token, false)
        onClose()
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteRegistration = async (e) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name) {
      setError('First name and last name are required')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.completeRegistration({
        mobile,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null
      })
      
      login(response.data.user, response.data.access_token, false)
      onClose()
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <h2>
          {step === 1 && 'Welcome!'}
          {step === 2 && 'Verify OTP'}
          {step === 3 && 'Complete Profile'}
        </h2>
        
        {error && <div className="modal-error">{error}</div>}
        
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <p className="modal-subtitle">Enter your mobile number to continue</p>
            <div className="modal-input-group">
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength="10"
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}
        
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <p className="modal-subtitle">OTP sent to {mobile}</p>
            <div className="modal-input-group">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
              Change Number
            </button>
          </form>
        )}
        
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration}>
            <p className="modal-subtitle">Complete your profile to continue</p>
            <div className="modal-input-group">
              <input
                type="text"
                placeholder="First Name *"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                required
              />
            </div>
            <div className="modal-input-group">
              <input
                type="text"
                placeholder="Last Name *"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                required
              />
            </div>
            <div className="modal-input-group">
              <input
                type="email"
                placeholder="Email (Optional)"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default LoginModal

