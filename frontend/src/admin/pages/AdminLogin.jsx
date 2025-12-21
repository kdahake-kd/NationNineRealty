/**
 * Admin Login Page
 * Separate login page for admin users only
 * Uses username/password authentication (Django superuser)
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import './AdminLogin.css'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already logged in as admin
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('access_token')
    const isAdminLogin = localStorage.getItem('is_admin_login') === 'true'
    
    if (storedUser && accessToken && isAdminLogin) {
      try {
        const userData = JSON.parse(storedUser)
        const userIsAdmin = userData?.is_admin || userData?.is_staff || userData?.is_superuser
        
        if (userIsAdmin) {
          // Already logged in as admin - redirect to admin dashboard
          navigate('/admin', { replace: true })
        }
      } catch (error) {
        // Error parsing - stay on login page
      }
    }
  }, [navigate])

  // Admin login with username/password
  const handleAdminLogin = async (e) => {
    e.preventDefault()
    
    if (!username || !password) {
      setError('Please enter username and password')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.adminLogin({ username, password })
      
      if (!response.data || !response.data.user || !response.data.access_token) {
        throw new Error('Invalid response from server')
      }
      
      const { user: userData, access_token, refresh_token } = response.data
      
      // Verify user is admin
      if (!userData.is_staff && !userData.is_superuser && !userData.is_admin) {
        throw new Error('User is not authorized as admin')
      }
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('is_admin_login', 'true')
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token)
      }
      
      // Verify localStorage was set
      const verifyUser = localStorage.getItem('user')
      const verifyToken = localStorage.getItem('access_token')
      
      if (!verifyUser || !verifyToken) {
        throw new Error('Failed to save login data')
      }
      
      // Redirect to admin dashboard
      window.location.href = '/admin'
    } catch (error) {
      console.error('Admin login error:', error)
      setError(error.response?.data?.error || error.message || 'Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>Admin Login</h1>
          <p>Enter your admin credentials to access the dashboard</p>
        </div>
        
        <form onSubmit={handleAdminLogin} className="admin-login-form">
          {error && <div className="admin-error-message">{error}</div>}
          
          <div className="admin-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="admin-login-button" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <p>This is an admin-only area. Use your Django superuser credentials.</p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

