/**
 * Authentication Context
 * Manages user authentication state, auto-logout after 24 hours
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const STORAGE_KEY = 'user'
const LOGIN_TIME_KEY = 'login_time'
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const IS_ADMIN_LOGIN_KEY = 'is_admin_login'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Define handleLogout first so it can be used in useEffect
  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(LOGIN_TIME_KEY)
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(IS_ADMIN_LOGIN_KEY)
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }, [])

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY)
      const loginTime = localStorage.getItem(LOGIN_TIME_KEY)
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)

      // Check if we have both user data and access token
      if (storedUser && accessToken) {
        const userData = JSON.parse(storedUser)
        const loginTimestamp = loginTime ? parseInt(loginTime, 10) : Date.now()
        const now = Date.now()
        const timeElapsed = now - loginTimestamp

        // Check if session is still valid (within 24 hours)
        if (timeElapsed < SESSION_DURATION) {
          setUser(userData)
          setIsAuthenticated(true)
          
          // Set auto-logout timer for remaining time
          const remainingTime = SESSION_DURATION - timeElapsed
          setTimeout(() => {
            handleLogout()
          }, remainingTime)
        } else {
          // Session expired, clear storage
          handleLogout()
        }
      } else if (storedUser && !accessToken) {
        // User data exists but no token - clear it
        handleLogout()
      }
    } catch (error) {
      console.error('Error loading user from storage:', error)
      handleLogout()
    } finally {
      setIsLoading(false)
    }
  }, [handleLogout])

  // Check session validity periodically (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return

    const checkSession = setInterval(() => {
      const loginTime = localStorage.getItem(LOGIN_TIME_KEY)
      if (loginTime) {
        const loginTimestamp = parseInt(loginTime, 10)
        const now = Date.now()
        const timeElapsed = now - loginTimestamp

        if (timeElapsed >= SESSION_DURATION) {
          handleLogout()
        }
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(checkSession)
  }, [isAuthenticated, handleLogout])

  const handleLogin = useCallback((userData, tokens = null, isAdminLogin = false) => {
    try {
      const now = Date.now()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      localStorage.setItem(LOGIN_TIME_KEY, now.toString())
      localStorage.setItem(IS_ADMIN_LOGIN_KEY, isAdminLogin.toString())
      
      // Store JWT tokens if provided
      if (tokens) {
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
      }
      
      setUser(userData)
      setIsAuthenticated(true)

      // Set auto-logout timer
      setTimeout(() => {
        handleLogout()
      }, SESSION_DURATION)
    } catch (error) {
      console.error('Error saving user to storage:', error)
      throw error
    }
  }, [handleLogout])

  const updateUser = useCallback((userData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }, [])

  const getRemainingSessionTime = useCallback(() => {
    const loginTime = localStorage.getItem(LOGIN_TIME_KEY)
    if (!loginTime) return 0
    
    const loginTimestamp = parseInt(loginTime, 10)
    const now = Date.now()
    const timeElapsed = now - loginTimestamp
    const remaining = SESSION_DURATION - timeElapsed
    
    return Math.max(0, remaining)
  }, [])

  const getIsAdminLogin = useCallback(() => {
    return localStorage.getItem(IS_ADMIN_LOGIN_KEY) === 'true'
  }, [])

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.is_admin === true || user?.is_admin === 'true',
    isAdminLogin: getIsAdminLogin(),
    login: handleLogin,
    logout: handleLogout,
    updateUser,
    getRemainingSessionTime,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

