import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { isAuthenticated, isAdmin, isAdminLogin, logout, user } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  
  // Check if we're on an admin route - if so, don't show navbar at all
  const isAdminRoute = location.pathname.startsWith('/admin')
  
  // Don't render navbar if on admin route OR if this is an admin login session
  if (isAdminRoute || isAdminLogin) {
    return null
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    navigate('/')
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isPropertiesOpen && !event.target.closest('.dropdown')) {
        setIsPropertiesOpen(false)
        document.body.classList.remove('dropdown-open')
      }
    }
    if (isPropertiesOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isPropertiesOpen])

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-wrapper">
          <Link to="/" className="logo">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">NationNineRealty</span>
          </Link>
          
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="nav-icon">🏡</span>
              <span className="nav-text">Home</span>
            </Link>
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="nav-icon">ℹ️</span>
              <span className="nav-text">About Us</span>
            </Link>
            <div 
              className={`nav-link dropdown ${isActive('/projects') ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                const newState = !isPropertiesOpen
                setIsPropertiesOpen(newState)
                
                // Add/remove class to body to make headline transparent
                if (newState) {
                  document.body.classList.add('dropdown-open')
                } else {
                  document.body.classList.remove('dropdown-open')
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <span className="nav-icon">🏢</span>
              <span className="nav-text">Properties</span>
              <span className={`dropdown-arrow ${isPropertiesOpen ? 'open' : ''}`}>▼</span>
              {isPropertiesOpen && (
                <div 
                  className="dropdown-menu show"
                  onClick={(e) => e.stopPropagation()}
                >
                <Link 
                  to="/projects?property_type=residential" 
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsPropertiesOpen(false)
                    document.body.classList.remove('dropdown-open')
                  }}
                >
                  <span className="dropdown-icon">🏘️</span>
                  Residential
                </Link>
                <Link 
                  to="/projects?property_type=commercial" 
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsPropertiesOpen(false)
                    document.body.classList.remove('dropdown-open')
                  }}
                >
                  <span className="dropdown-icon">🏬</span>
                  Commercial
                </Link>
                <Link 
                  to="/projects?property_type=resale" 
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsPropertiesOpen(false)
                    document.body.classList.remove('dropdown-open')
                  }}
                >
                  <span className="dropdown-icon">🏠</span>
                  Resale
                </Link>
                </div>
              )}
            </div>
            <Link 
              to="/blog" 
              className={`nav-link ${isActive('/blog') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="nav-icon">📝</span>
              <span className="nav-text">Blog</span>
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="nav-icon">📞</span>
              <span className="nav-text">Contact Us</span>
            </Link>
            {isAuthenticated ? (
              <>
                {/* Only show admin link if user is admin AND not already on admin route */}
                {isAdmin && !isAdminRoute && (
                  <Link 
                    to="/admin" 
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-text">Admin</span>
                  </Link>
                )}
                {/* Only show user info and logout if NOT on admin route */}
                {!isAdminRoute && (
                  <>
                    <div className="nav-user-info">
                      <span className="user-name">
                        {user?.first_name || 'User'}
                      </span>
                    </div>
                    <button 
                      className="btn btn-secondary nav-cta" 
                      onClick={handleLogout}
                    >
                      <span className="cta-icon">🚪</span>
                      Logout
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">🔐</span>
                  <span className="nav-text">Login</span>
                </Link>
                <Link 
                  to="/signup" 
                  className="btn btn-primary nav-cta" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="cta-icon">📝</span>
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          <button 
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => {
              setIsMenuOpen(!isMenuOpen)
              if (!isMenuOpen) {
                document.body.style.overflow = 'hidden'
              } else {
                document.body.style.overflow = ''
              }
            }}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          {isMenuOpen && (
            <div 
              className="menu-overlay"
              onClick={() => {
                setIsMenuOpen(false)
                document.body.style.overflow = ''
              }}
            />
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

