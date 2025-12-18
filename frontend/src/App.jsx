import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminRoute from './components/AdminRoute'
import LoginModal from './components/LoginModal'
import { useAuth } from './contexts/AuthContext'
// User pages
import Home from './user/pages/Home'
import About from './user/pages/About'
import Projects from './user/pages/Projects'
import Services from './user/pages/Services'
import Clients from './user/pages/Clients'
import Reviews from './user/pages/Reviews'
import Blog from './user/pages/Blog'
import Gallery from './user/pages/Gallery'
import Contact from './user/pages/Contact'
import ProjectDetail from './user/pages/ProjectDetail'
import TowerDetail from './user/pages/TowerDetail'
import BlogDetail from './user/pages/BlogDetail'
import Login from './user/pages/Login'
import Signup from './user/pages/Signup'
// Admin pages
import AdminDashboard from './admin/pages/AdminDashboard'

function AppContent() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  
  // Auto-show login modal after 10 seconds for non-authenticated users
  useEffect(() => {
    // Don't show on admin routes, auth pages, or if already authenticated
    if (isAdminRoute || isAuthPage || isAuthenticated) {
      return
    }
    
    // Check if modal was already shown in this session
    const modalShown = sessionStorage.getItem('login_modal_shown')
    if (modalShown) {
      return
    }
    
    const timer = setTimeout(() => {
      setShowLoginModal(true)
      sessionStorage.setItem('login_modal_shown', 'true')
    }, 10000) // 10 seconds
    
    return () => clearTimeout(timer)
  }, [isAdminRoute, isAuthPage, isAuthenticated])
  
  return (
    <div className="App">
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/:projectId/towers/:towerId" element={<TowerDetail />} />
        <Route path="/services" element={<Services />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/admin/*" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
      </Routes>
      {!isAdminRoute && <Footer />}
      
      {/* Auto-popup login modal for non-authenticated users */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
