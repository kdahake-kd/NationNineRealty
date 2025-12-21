/**
 * Authentication Context
 * Manages user authentication state, auto-logout after 24 hours
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

// Simple storage keys
const STORAGE_KEY = 'user'
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
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(IS_ADMIN_LOGIN_KEY)
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }, [])

  // Load user from localStorage on mount - SIMPLE: just check if tokens exist
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY)
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)

      // Simple check: if we have user and token, user is authenticated
      // Token expiration will be handled by API interceptor (401 response)
      if (storedUser && accessToken) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } else if (storedUser && !accessToken) {
        // User data exists but no token - clear it
        console.warn('AuthContext: User data exists but no token, clearing')
        handleLogout()
      }
    } catch (error) {
      console.error('AuthContext: Error loading user from storage:', error)
      if (error instanceof SyntaxError) {
        console.error('AuthContext: JSON parse error, clearing invalid data')
        handleLogout()
      }
    } finally {
      setIsLoading(false)
    }
  }, [handleLogout])

  // No periodic session check - token expiration is handled by API interceptor
  // When API returns 401, interceptor will handle refresh or logout

  const handleLogin = useCallback((userData, accessToken = null, isAdminLogin = false) => {
    try {
      // Simple: just store tokens and user data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      localStorage.setItem(IS_ADMIN_LOGIN_KEY, isAdminLogin.toString())
      
      // Store access token if provided
      if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
      }
      
      setUser(userData)
      setIsAuthenticated(true)
      
      // No setTimeout - token expiration handled by API interceptor
    } catch (error) {
      console.error('Error saving user to storage:', error)
      throw error
    }
  }, [])

  const updateUser = useCallback((userData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }, [])

  const getIsAdminLogin = useCallback(() => {
    return localStorage.getItem(IS_ADMIN_LOGIN_KEY) === 'true'
  }, [])

  // Check if user is admin (Django staff/superuser or has is_admin flag)
  const isAdmin = user?.is_admin === true || user?.is_admin === 'true' || 
                  user?.is_staff === true || user?.is_superuser === true

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isAdminLogin: getIsAdminLogin(),
    login: handleLogin,
    logout: handleLogout,
    updateUser,
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

