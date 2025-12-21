/**
 * Admin Route Protection Component
 * Ensures only admin users (Django superusers) can access admin routes
 * Frontend validation: Checks if user is admin before allowing access
 */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AdminRoute = ({ children }) => {
  // Check localStorage for authentication
  const storedUser = localStorage.getItem('user')
  const accessToken = localStorage.getItem('access_token')
  const isAdminLogin = localStorage.getItem('is_admin_login') === 'true'
  
  console.log('AdminRoute: Checking auth', {
    hasUser: !!storedUser,
    hasToken: !!accessToken,
    isAdminLogin
  })
  
  // If no access token, redirect to admin login
  if (!accessToken || !storedUser) {
    console.log('AdminRoute: No token or user, redirecting to admin login')
    return <Navigate to="/admin/login" replace />
  }
  
  try {
    const userData = JSON.parse(storedUser)
    console.log('AdminRoute: User data', userData)
    
    // Frontend validation: Check if user is admin
    // Must have is_staff or is_superuser (Django admin flags) or is_admin flag
    const isAdmin = userData?.is_admin === true || 
                    userData?.is_staff === true || 
                    userData?.is_superuser === true ||
                    isAdminLogin
    
    console.log('AdminRoute: Is admin?', isAdmin, {
      is_admin: userData?.is_admin,
      is_staff: userData?.is_staff,
      is_superuser: userData?.is_superuser,
      isAdminLogin
    })
    
    if (isAdmin) {
      // User is authenticated and validated as admin - render admin dashboard
      console.log('AdminRoute: Rendering admin dashboard')
      return children
    } else {
      // User exists but is NOT admin - clear admin data and redirect to home
      console.log('AdminRoute: User is not admin, redirecting to home')
      localStorage.removeItem('is_admin_login')
      return <Navigate to="/" replace />
    }
  } catch (error) {
    // Error parsing user data - clear and redirect to admin login
    console.error('AdminRoute: Error parsing user data', error)
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('is_admin_login')
    return <Navigate to="/admin/login" replace />
  }
}

export default AdminRoute
