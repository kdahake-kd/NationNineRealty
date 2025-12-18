/**
 * Admin Route Protection Component
 * Ensures only admin users (Django superusers) can access admin routes
 */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AdminRoute = ({ children }) => {
  // ONLY check localStorage - if access token exists, allow access (as requested)
  const storedUser = localStorage.getItem('user')
  const accessToken = localStorage.getItem('access_token')
  
  // If access token exists in localStorage, allow access immediately
  if (accessToken && storedUser) {
    try {
      const userData = JSON.parse(storedUser)
      // Check if user is admin (Django superuser/staff)
      const isAdmin = userData?.is_admin || userData?.is_staff || userData?.is_superuser
      
      if (isAdmin) {
        // User is authenticated and is admin - render immediately
        return children
      } else {
        // User exists but not admin
        return <Navigate to="/" replace />
      }
    } catch (error) {
      // Error parsing user data - clear and redirect
      localStorage.removeItem('user')
      localStorage.removeItem('access_token')
      return <Navigate to="/login?admin=true" replace />
    }
  }
  
  // No access token - redirect to login
  return <Navigate to="/login?admin=true" replace />
}

export default AdminRoute
