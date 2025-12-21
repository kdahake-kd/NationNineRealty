import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI, projectsAPI, getImageUrl } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  
  const [stats, setStats] = useState(null)
  const [leads, setLeads] = useState([])
  const [projects, setProjects] = useState([])
  const [cities, setCities] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Project form state
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    property_type: 'residential',
    project_status: '',
    location: '',
    city: '',
    city_name: '',
    state: 'Maharashtra',
    map_location: '',
    description: '',
    about_listing: '',
    price: '',
    available_flat_types: [],
    rera_number: '',
    land_area: '',
    amenities_area: '',
    total_units: '',
    total_towers: '',
    developer_name: '',
    is_hot: false,
    featured: false,
    cover_image: null,
  })
  const [orderErrors, setOrderErrors] = useState({
    projectImages: {},
    projectAmenities: {},
    towers: {}
  })
  const [projectImages, setProjectImages] = useState([{ image: null, title: '', category: 'other', order: 0 }])
  const [projectAmenities, setProjectAmenities] = useState([{ name: '', order: 0 }])
  const [towers, setTowers] = useState([{
    name: '',
    tower_number: '',
    total_floors: '',
    parking_floors: '',
    residential_floors: '',
    refugee_floors: '',
    per_floor_flats: '',
    total_lifts: '',
    total_stairs: '',
    booking_status: 'available',
    is_active: true,
    order: 0,
    flats: [{ flat_number: '', floor: '', flat_type: '', area: '', price: '', availability: 'available', order: 0 }],
    amenities: [{ name: '', icon: '', order: 0 }]
  }])
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    location: true,
    searchFilters: true,
    projectDetails: true,
    media: true,
    settings: true,
    projectImages: true,
    projectAmenities: true,
    towers: true
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Handle body scroll lock when modal is open
  useEffect(() => {
    console.log('showProjectForm changed to:', showProjectForm)
    if (showProjectForm) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showProjectForm])

  useEffect(() => {
    // AdminRoute already handles auth check, just fetch data
    console.log('AdminDashboard: Component mounted, fetching initial data')
    fetchInitialData()
  }, [])

  useEffect(() => {
    console.log('AdminDashboard: activeTab changed to', activeTab)
    if (activeTab === 'dashboard') {
      fetchDashboardData()
    } else if (activeTab === 'projects') {
      fetchProjects()
    } else if (activeTab === 'leads') {
      fetchLeads()
    }
  }, [activeTab, selectedPeriod])

  const fetchInitialData = async () => {
    try {
      const citiesRes = await adminAPI.getCities()
      setCities(citiesRes.data.results || citiesRes.data)
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('AdminDashboard: Fetching leads stats...')
      const statsRes = await adminAPI.getLeadsStats()
      console.log('AdminDashboard: Leads stats received:', statsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('AdminDashboard: Error fetching dashboard data:', error)
      console.error('AdminDashboard: Error response:', error.response)
      setError(error.response?.data?.error || error.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchLeads = async () => {
    setLoading(true)
    setError('')
    try {
      const leadsRes = await adminAPI.getLeadsList({ period: selectedPeriod })
      setLeads(leadsRes.data)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load leads')
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    setLoading(true)
    setError('')
    try {
      const projectsRes = await adminAPI.getProjects({})
      setProjects(projectsRes.data.results || projectsRes.data)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load projects')
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (leadId) => {
    try {
      await adminAPI.markLeadRead(leadId)
      setLeads(leads.map(lead => lead.id === leadId ? { ...lead, read: true } : lead))
      setSuccess('Lead marked as read')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to mark lead as read')
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleProjectFormChange = (e) => {
    const { name, value, type, checked, files } = e.target
    if (type === 'file') {
      setProjectFormData({ ...projectFormData, [name]: files[0] })
    } else if (type === 'checkbox') {
      setProjectFormData({ ...projectFormData, [name]: checked })
    } else {
      setProjectFormData({ ...projectFormData, [name]: value })
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate duplicate orders
      const imageOrders = projectImages.map(img => parseInt(img.order)).filter(o => !isNaN(o))
      const amenityOrders = projectAmenities.map(a => parseInt(a.order)).filter(o => !isNaN(o))
      const towerOrders = towers.map(t => parseInt(t.order)).filter(o => !isNaN(o))
      
      if (new Set(imageOrders).size !== imageOrders.length) {
        setError('Duplicate order numbers found in project images. Please use unique order numbers.')
        setLoading(false)
        return
      }
      if (new Set(amenityOrders).size !== amenityOrders.length) {
        setError('Duplicate order numbers found in project amenities. Please use unique order numbers.')
        setLoading(false)
        return
      }
      if (new Set(towerOrders).size !== towerOrders.length) {
        setError('Duplicate order numbers found in towers. Please use unique order numbers.')
        setLoading(false)
        return
      }

      // Validate mandatory fields
      if (!projectFormData.title?.trim()) {
        setError('Project Title is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.property_type) {
        setError('Property Type is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.project_status) {
        setError('Project Status is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.description?.trim()) {
        setError('Description is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.location?.trim()) {
        setError('Location is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.city_name?.trim() && !projectFormData.city) {
        setError('City is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.state?.trim()) {
        setError('State is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.map_location?.trim()) {
        setError('Map Location is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.rera_number?.trim()) {
        setError('RERA Number is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.land_area?.trim()) {
        setError('Land Area is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.amenities_area?.trim()) {
        setError('Amenities Area is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.total_units) {
        setError('Total Units is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.total_towers) {
        setError('Total Towers is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.developer_name?.trim()) {
        setError('Developer Name is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.cover_image && !editingProject) {
        setError('Cover Image is mandatory')
        setLoading(false)
        return
      }
      if (!projectFormData.price) {
        setError('Price is mandatory')
        setLoading(false)
        return
      }
      
      // Validate project images - at least one image required
      const validImages = projectImages.filter(img => img.image)
      if (validImages.length === 0) {
        setError('At least one project image is mandatory')
        setLoading(false)
        return
      }

      // Validate project amenities - all mandatory
      const validAmenities = projectAmenities.filter(a => a.name?.trim())
      if (validAmenities.length === 0) {
        setError('At least one project amenity is mandatory')
        setLoading(false)
        return
      }
      for (const amenity of projectAmenities) {
        if (amenity.name?.trim() && !amenity.name.trim()) {
          setError('All project amenities must have a name')
          setLoading(false)
          return
        }
      }

      // Validate towers based on property type
      if (projectFormData.property_type === 'residential') {
        if (towers.length === 0) {
          setError('At least one tower is mandatory for residential projects')
          setLoading(false)
          return
        }
        for (const tower of towers) {
          if (!tower.name?.trim()) {
            setError('All towers must have a name for residential projects')
            setLoading(false)
            return
          }
          if (!tower.total_floors) {
            setError('All towers must have total floors for residential projects')
            setLoading(false)
            return
          }
        }
      }

      // Step 1: Create/Update Project
      const formData = new FormData()
      Object.keys(projectFormData).forEach(key => {
        if (key === 'cover_image' && projectFormData[key]) {
          formData.append(key, projectFormData[key])
        } else if (key === 'available_flat_types' && Array.isArray(projectFormData[key])) {
          formData.append(key, projectFormData[key].join(','))
        } else if (projectFormData[key] !== null && projectFormData[key] !== '') {
          formData.append(key, projectFormData[key])
        }
      })

      let projectResponse
      if (editingProject) {
        projectResponse = await adminAPI.updateProject(editingProject.id, formData)
      } else {
        projectResponse = await adminAPI.createProject(formData)
      }
      
      const projectId = editingProject ? editingProject.id : projectResponse.data.id

      // Step 2: Create Project Images
      for (const img of projectImages) {
        if (img.image) {
          const imgFormData = new FormData()
          imgFormData.append('project', projectId)
          imgFormData.append('image', img.image)
          imgFormData.append('title', img.title || '')
          imgFormData.append('category', img.category)
          imgFormData.append('order', img.order)
          await adminAPI.createProjectImage(imgFormData)
        }
      }

      // Step 3: Create Project Amenities
      for (const amenity of projectAmenities) {
        if (amenity.name) {
          await adminAPI.createProjectAmenity({
            project: projectId,
            name: amenity.name,
            icon: '',
            order: amenity.order
          })
        }
      }

      // Step 4: Create Towers with Flats and Tower Amenities
      for (const tower of towers) {
        if (tower.name) {
          const towerData = {
            project: projectId,
            name: tower.name,
            tower_number: tower.tower_number || '',
            total_floors: tower.total_floors || '',
            parking_floors: tower.parking_floors || 0,
            residential_floors: tower.residential_floors || 0,
            refugee_floors: tower.refugee_floors || 0,
            per_floor_flats: tower.per_floor_flats || 0,
            total_lifts: tower.total_lifts || 0,
            total_stairs: tower.total_stairs || 0,
            booking_status: tower.booking_status,
            is_active: tower.is_active,
            order: tower.order
          }
          const towerResponse = await adminAPI.createTower(towerData)
          const towerId = towerResponse.data.id

          // Create Flats for this Tower
          for (const flat of tower.flats) {
            if (flat.flat_number) {
              await adminAPI.createFlat({
                tower: towerId,
                flat_number: flat.flat_number,
                floor: flat.floor || '',
                flat_type: flat.flat_type || '',
                area: flat.area || '',
                price: flat.price || '',
                availability: flat.availability,
                order: flat.order
              })
            }
          }

          // Create Tower Amenities
          for (const amenity of tower.amenities) {
            if (amenity.name) {
              await adminAPI.createTowerAmenity({
                tower: towerId,
                name: amenity.name,
                icon: amenity.icon || '',
                order: amenity.order
              })
            }
          }
        }
      }

      setSuccess(editingProject ? 'Project updated successfully!' : 'Project created successfully!')

      // Reset form
      setShowProjectForm(false)
      setEditingProject(null)
      setProjectFormData({
        title: '',
        property_type: 'residential',
        project_status: '',
        location: '',
        city: '',
        city_name: '',
        state: 'Maharashtra',
        map_location: '',
        description: '',
        about_listing: '',
        price: '',
        available_flat_types: [],
        rera_number: '',
        land_area: '',
        amenities_area: '',
        total_units: '',
        total_towers: '',
        developer_name: '',
        is_hot: false,
        featured: false,
        cover_image: null,
      })
      setProjectImages([{ image: null, title: '', category: 'other', order: 0 }])
      setProjectAmenities([{ name: '', order: 0 }])
      setOrderErrors({ projectImages: {}, projectAmenities: {}, towers: {} })
      setTowers([{
        name: '',
        tower_number: '',
        total_floors: '',
        parking_floors: '',
        residential_floors: '',
        refugee_floors: '',
        per_floor_flats: '',
        total_lifts: '',
        total_stairs: '',
        booking_status: 'available',
        is_active: true,
        order: 0,
        flats: [{ flat_number: '', floor: '', flat_type: '', area: '', price: '', availability: 'available', order: 0 }],
        amenities: [{ name: '', icon: '', order: 0 }]
      }])
      
      // Refresh projects list
      fetchProjects()
      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
        (error.response?.data ? JSON.stringify(error.response.data) : 'Failed to save project')
      setError(errorMsg)
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setProjectFormData({
      title: project.title || '',
      property_type: project.property_type || 'residential',
      project_status: project.project_status || '',
      location: project.location || '',
      city: project.city || '',
      city_name: project.city_name || '',
      state: project.state || 'Maharashtra',
      map_location: project.map_location || '',
      description: project.description || '',
      about_listing: project.about_listing || '',
      price: project.price || '',
      available_flat_types: project.available_flat_types ? (typeof project.available_flat_types === 'string' ? project.available_flat_types.split(',').map(ft => ft.trim()).filter(ft => ft) : project.available_flat_types) : [],
      rera_number: project.rera_number || '',
      land_area: project.land_area || '',
      amenities_area: project.amenities_area || '',
      total_units: project.total_units || '',
      total_towers: project.total_towers || '',
      developer_name: project.developer_name || '',
      is_hot: project.is_hot || false,
      featured: project.featured || false,
      cover_image: null,
    })
    setOrderErrors({ projectImages: {}, projectAmenities: {}, towers: {} })
    setShowProjectForm(true)
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return
    }
    try {
      await adminAPI.deleteProject(projectId)
      setSuccess('Project deleted successfully')
      fetchProjects()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete project')
      setTimeout(() => setError(''), 5000)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const addProjectImage = () => {
    setProjectImages([...projectImages, { image: null, title: '', category: 'other', order: projectImages.length }])
  }

  const removeProjectImage = (index) => {
    setProjectImages(projectImages.filter((_, i) => i !== index))
  }

  const updateProjectImage = (index, field, value) => {
    const updated = [...projectImages]
    updated[index] = { ...updated[index], [field]: value }
    setProjectImages(updated)
    
    // Validate duplicate order for project images
    if (field === 'order') {
      const orderValue = parseInt(value)
      const duplicateIndex = updated.findIndex((img, idx) => idx !== index && parseInt(img.order) === orderValue)
      const newErrors = { ...orderErrors }
      if (duplicateIndex !== -1) {
        newErrors.projectImages[index] = `This order number is already used by another image`
        newErrors.projectImages[duplicateIndex] = `This order number is already used by another image`
      } else {
        delete newErrors.projectImages[index]
        // Clear error for the other item if it was the only duplicate
        Object.keys(newErrors.projectImages).forEach(key => {
          if (newErrors.projectImages[key] && key != index) {
            const otherIndex = parseInt(key)
            const otherOrder = parseInt(updated[otherIndex]?.order)
            const hasOtherDuplicate = updated.some((img, idx) => idx !== otherIndex && parseInt(img.order) === otherOrder)
            if (!hasOtherDuplicate) {
              delete newErrors.projectImages[key]
            }
          }
        })
      }
      setOrderErrors(newErrors)
    }
  }

  const addProjectAmenity = () => {
    setProjectAmenities([...projectAmenities, { name: '', order: projectAmenities.length }])
  }

  const removeProjectAmenity = (index) => {
    setProjectAmenities(projectAmenities.filter((_, i) => i !== index))
  }

  const updateProjectAmenity = (index, field, value) => {
    const updated = [...projectAmenities]
    updated[index] = { ...updated[index], [field]: value }
    setProjectAmenities(updated)
    
    // Validate duplicate order for project amenities
    if (field === 'order') {
      const orderValue = parseInt(value)
      const duplicateIndex = updated.findIndex((amenity, idx) => idx !== index && parseInt(amenity.order) === orderValue)
      const newErrors = { ...orderErrors }
      if (duplicateIndex !== -1) {
        newErrors.projectAmenities[index] = `This order number is already used by another amenity`
        newErrors.projectAmenities[duplicateIndex] = `This order number is already used by another amenity`
      } else {
        delete newErrors.projectAmenities[index]
        // Clear error for the other item if it was the only duplicate
        Object.keys(newErrors.projectAmenities).forEach(key => {
          if (newErrors.projectAmenities[key] && key != index) {
            const otherIndex = parseInt(key)
            const otherOrder = parseInt(updated[otherIndex]?.order)
            const hasOtherDuplicate = updated.some((amenity, idx) => idx !== otherIndex && parseInt(amenity.order) === otherOrder)
            if (!hasOtherDuplicate) {
              delete newErrors.projectAmenities[key]
            }
          }
        })
      }
      setOrderErrors(newErrors)
    }
  }

  const addTower = () => {
    setTowers([...towers, {
      name: '',
      tower_number: '',
      total_floors: '',
      parking_floors: '',
      residential_floors: '',
      refugee_floors: '',
      per_floor_flats: '',
      total_lifts: '',
      total_stairs: '',
      booking_status: 'available',
      is_active: true,
      order: towers.length,
      flats: [{ flat_number: '', floor: '', flat_type: '', area: '', price: '', availability: 'available', order: 0 }],
      amenities: [{ name: '', icon: '', order: 0 }]
    }])
  }

  const removeTower = (index) => {
    setTowers(towers.filter((_, i) => i !== index))
  }

  const updateTower = (index, field, value) => {
    const updated = [...towers]
    updated[index] = { ...updated[index], [field]: value }
    setTowers(updated)
    
    // Validate duplicate order for towers
    if (field === 'order') {
      const orderValue = parseInt(value)
      const duplicateIndex = updated.findIndex((tower, idx) => idx !== index && parseInt(tower.order) === orderValue)
      const newErrors = { ...orderErrors }
      if (duplicateIndex !== -1) {
        newErrors.towers[index] = `This order number is already used by another tower`
        newErrors.towers[duplicateIndex] = `This order number is already used by another tower`
      } else {
        delete newErrors.towers[index]
        // Clear error for the other item if it was the only duplicate
        Object.keys(newErrors.towers).forEach(key => {
          if (newErrors.towers[key] && key != index) {
            const otherIndex = parseInt(key)
            const otherOrder = parseInt(updated[otherIndex]?.order)
            const hasOtherDuplicate = updated.some((tower, idx) => idx !== otherIndex && parseInt(tower.order) === otherOrder)
            if (!hasOtherDuplicate) {
              delete newErrors.towers[key]
            }
          }
        })
      }
      setOrderErrors(newErrors)
    }
  }

  const addTowerFlat = (towerIndex) => {
    const updated = [...towers]
    updated[towerIndex].flats.push({ flat_number: '', floor: '', flat_type: '', area: '', price: '', availability: 'available', order: updated[towerIndex].flats.length })
    setTowers(updated)
  }

  const removeTowerFlat = (towerIndex, flatIndex) => {
    const updated = [...towers]
    updated[towerIndex].flats = updated[towerIndex].flats.filter((_, i) => i !== flatIndex)
    setTowers(updated)
  }

  const updateTowerFlat = (towerIndex, flatIndex, field, value) => {
    const updated = [...towers]
    updated[towerIndex].flats[flatIndex] = { ...updated[towerIndex].flats[flatIndex], [field]: value }
    setTowers(updated)
  }

  const addTowerAmenity = (towerIndex) => {
    const updated = [...towers]
    updated[towerIndex].amenities.push({ name: '', icon: '', order: updated[towerIndex].amenities.length })
    setTowers(updated)
  }

  const removeTowerAmenity = (towerIndex, amenityIndex) => {
    const updated = [...towers]
    updated[towerIndex].amenities = updated[towerIndex].amenities.filter((_, i) => i !== amenityIndex)
    setTowers(updated)
  }

  const updateTowerAmenity = (towerIndex, amenityIndex, field, value) => {
    const updated = [...towers]
    updated[towerIndex].amenities[amenityIndex] = { ...updated[towerIndex].amenities[amenityIndex], [field]: value }
    setTowers(updated)
  }

  // Debug: Log current state
  console.log('AdminDashboard: Rendering with state:', {
    activeTab,
    loading,
    error,
    stats,
    user: user?.username,
    hasUser: !!user,
    accessToken: !!localStorage.getItem('access_token')
  })

  // Ensure component always renders something visible
  if (!user) {
    console.warn('AdminDashboard: No user in context, but AdminRoute should have checked this')
  }

  return (
    <div className="admin-dashboard" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Admin Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              Welcome, {user?.username || 'Admin'}
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="sidebar-menu">
            <button
              className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="sidebar-icon">📊</span>
              <span className="sidebar-text">Dashboard</span>
            </button>
            <button
              className={`sidebar-item ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <span className="sidebar-icon">🏢</span>
              <span className="sidebar-text">Projects</span>
            </button>
            <button
              className={`sidebar-item ${activeTab === 'leads' ? 'active' : ''}`}
              onClick={() => setActiveTab('leads')}
            >
              <span className="sidebar-icon">📋</span>
              <span className="sidebar-text">Leads</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-main-content">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-tab">
              <h2>Dashboard Overview</h2>
              {loading && !stats && (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p>Loading dashboard data...</p>
                </div>
              )}
              {error && (
                <div className="alert alert-error" style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
                  <strong>Error:</strong> {error}
                  <br />
                  <small>Check browser console (F12) for more details</small>
                </div>
              )}
              {!loading && !stats && !error && (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p>No data available. Click "Dashboard" in the sidebar to refresh.</p>
                </div>
              )}
              {stats && (
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>Today</h3>
                    <div className="stat-value">{stats.today}</div>
                    <p>Leads</p>
                  </div>
                  <div className="stat-card">
                    <h3>Yesterday</h3>
                    <div className="stat-value">{stats.yesterday}</div>
                    <p>Leads</p>
                  </div>
                  <div className="stat-card">
                    <h3>Last Week</h3>
                    <div className="stat-value">{stats.last_week}</div>
                    <p>Leads</p>
                  </div>
                  <div className="stat-card">
                    <h3>Last Month</h3>
                    <div className="stat-value">{stats.last_month}</div>
                    <p>Leads</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total</h3>
                    <div className="stat-value">{stats.total}</div>
                    <p>Leads</p>
                  </div>
                  <div className="stat-card unread">
                    <h3>Unread</h3>
                    <div className="stat-value">{stats.unread}</div>
                    <p>Leads</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="projects-tab">
              <div className="tab-header">
                <h2>Projects Management</h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Add Project button clicked, current showProjectForm:', showProjectForm)
                    setEditingProject(null)
                    setProjectFormData({
                      title: '',
                      id_number: '',
                      property_type: 'residential',
                      project_status: '',
                      location: '',
                      city: '',
                      city_name: '',
                      state: 'Maharashtra',
                      map_location: '',
                      description: '',
                      about_listing: '',
                      price: '',
                      available_flat_types: '',
                      rera_number: '',
                      land_area: '',
                      amenities_area: '',
                      total_units: '',
                      total_towers: '',
                      developer_name: '',
                      is_hot: false,
                      featured: false,
                      cover_image: null,
                    })
                    setProjectImages([{ image: null, title: '', category: 'other', order: 0 }])
                    setProjectAmenities([{ name: '', order: 0 }])
                    setTowers([{
                      name: '',
                      tower_number: '',
                      total_floors: '',
                      parking_floors: '',
                      residential_floors: '',
                      refugee_floors: '',
                      per_floor_flats: '',
                      total_lifts: '',
                      total_stairs: '',
                      booking_status: 'available',
                      is_active: true,
                      order: 0,
                      flats: [{ flat_number: '', floor: '', flat_type: '', area: '', price: '', availability: 'available', order: 0 }],
                      amenities: [{ name: '', icon: '', order: 0 }]
                    }])
                    setExpandedSections({
                      basic: true,
                      location: true,
                      searchFilters: true,
                      projectDetails: true,
                      media: true,
                      settings: true,
                      projectImages: true,
                      projectAmenities: true,
                      towers: true
                    })
                    console.log('Setting showProjectForm to true')
                    setShowProjectForm(true)
                    // Force a re-render check
                    setTimeout(() => {
                      console.log('After setting showProjectForm, value is:', showProjectForm)
                    }, 100)
                  }}
                >
                  + Add New Project
                </button>
              </div>

              {showProjectForm && (
                <div 
                  className="project-form-modal"
                  style={{ display: 'flex', visibility: 'visible', opacity: 1 }}
                  onClick={(e) => {
                    // Close modal if clicking on backdrop
                    if (e.target.classList.contains('project-form-modal')) {
                      setShowProjectForm(false)
                      setEditingProject(null)
                    }
                  }}
                >
                  <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
                    <div className="modal-header">
                      <h3>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
                      <button
                        className="close-btn"
                        onClick={() => {
                          setShowProjectForm(false)
                          setEditingProject(null)
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <form onSubmit={handleCreateProject}>
                      {/* Basic Information Section */}
                      <div className="form-section">
                        <div className="section-header" onClick={() => toggleSection('basic')}>
                          <h4>Basic Information</h4>
                          <span>{expandedSections.basic ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.basic && (
                          <div className="form-grid">
                            <div className="form-group">
                              <label>Project Title *</label>
                              <input
                                type="text"
                                name="title"
                                value={projectFormData.title}
                                onChange={handleProjectFormChange}
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label>Property Type <span style={{ color: 'red' }}>*</span></label>
                              <select
                                name="property_type"
                                value={projectFormData.property_type}
                                onChange={handleProjectFormChange}
                                required
                              >
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="resale">Resale</option>
                              </select>
                            </div>

                            <div className="form-group">
                              <label>Project Status <span style={{ color: 'red' }}>*</span></label>
                              <select
                                name="project_status"
                                value={projectFormData.project_status}
                                onChange={handleProjectFormChange}
                                required
                              >
                                <option value="">Select Status</option>
                                <option value="pre_launch">Pre Launch</option>
                                <option value="new_launch">New Launch</option>
                                <option value="new_tower_launch">New Tower Launch</option>
                                <option value="ready_to_move">Ready To Move</option>
                                <option value="nearing_possession">Nearing Possession</option>
                              </select>
                            </div>

                            <div className="form-group full-width">
                              <label>Description <span style={{ color: 'red' }}>*</span></label>
                              <textarea
                                name="description"
                                value={projectFormData.description}
                                onChange={handleProjectFormChange}
                                rows="4"
                                required
                              />
                            </div>

                            <div className="form-group full-width">
                              <label>About Listing</label>
                              <textarea
                                name="about_listing"
                                value={projectFormData.about_listing}
                                onChange={handleProjectFormChange}
                                rows="4"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Location Section */}
                      <div className="form-section">
                        <div className="section-header" onClick={() => toggleSection('location')}>
                          <h4>Location</h4>
                          <span>{expandedSections.location ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.location && (
                          <div className="form-grid">
                            <div className="form-group">
                              <label>Location <span style={{ color: 'red' }}>*</span></label>
                              <input
                                type="text"
                                name="location"
                                value={projectFormData.location}
                                onChange={handleProjectFormChange}
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label>City <span style={{ color: 'red' }}>*</span></label>
                              <select
                                name="city"
                                value={projectFormData.city}
                                onChange={handleProjectFormChange}
                              >
                                <option value="">Select City</option>
                                {cities.map(city => (
                                  <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="form-group">
                              <label>City Name (Fallback)</label>
                              <input
                                type="text"
                                name="city_name"
                                value={projectFormData.city_name}
                                onChange={handleProjectFormChange}
                                placeholder="Pune"
                              />
                            </div>

                            <div className="form-group">
                              <label>State <span style={{ color: 'red' }}>*</span></label>
                              <input
                                type="text"
                                name="state"
                                value={projectFormData.state}
                                onChange={handleProjectFormChange}
                              />
                            </div>

                            <div className="form-group full-width">
                              <label>Map Location <span style={{ color: 'red' }}>*</span></label>
                              <textarea
                                name="map_location"
                                value={projectFormData.map_location}
                                onChange={handleProjectFormChange}
                                rows="3"
                                placeholder="Full address for map"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Search Filters Section */}
                      <div className="form-section">
                        <div className="section-header" onClick={() => toggleSection('searchFilters')}>
                          <h4>Search Filters</h4>
                          <span>{expandedSections.searchFilters ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.searchFilters && (
                          <div className="form-grid">
                            <div className="form-group full-width">
                              <label>Available Flat Types</label>
                              <div className="checkbox-group">
                                {['1bhk', '1.5bhk', '2bhk', '2.5bhk', '3bhk', '3.5bhk', '4bhk', '4.5bhk', '5bhk', '5.5bhk'].map(flatType => (
                                  <label key={flatType} className="checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={projectFormData.available_flat_types.includes(flatType)}
                                      onChange={(e) => {
                                        const current = projectFormData.available_flat_types || []
                                        if (e.target.checked) {
                                          setProjectFormData({ ...projectFormData, available_flat_types: [...current, flatType] })
                                        } else {
                                          setProjectFormData({ ...projectFormData, available_flat_types: current.filter(ft => ft !== flatType) })
                                        }
                                      }}
                                    />
                                    <span>{flatType.toUpperCase()}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Project Details Section */}
                      <div className="form-section">
                        <div className="section-header" onClick={() => toggleSection('projectDetails')}>
                          <h4>Project Details</h4>
                          <span>{expandedSections.projectDetails ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.projectDetails && (
                          <div className="form-grid">
                            <div className="form-group">
                              <label>RERA Number <span style={{ color: 'red' }}>*</span></label>
                              <input
                                type="text"
                                name="rera_number"
                                value={projectFormData.rera_number}
                                onChange={handleProjectFormChange}
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label>Land Area <span style={{ color: 'red' }}>*</span></label>
                              <input
                                type="text"
                                name="land_area"
                                value={projectFormData.land_area}
                                onChange={handleProjectFormChange}
                                placeholder="e.g., 2.2 ACRES"
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label>Amenities Area <span style={{ color: 'red' }}>*</span></label>
                              <input
                                type="text"
                                name="amenities_area"
                                value={projectFormData.amenities_area}
                                onChange={handleProjectFormChange}
                                placeholder="e.g., 25K SQ FT"
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label>Total Units <span style={{ color: 'red' }}>*</span></label>
                              <input
                                type="number"
                                name="total_units"
                                value={projectFormData.total_units}
                                onChange={handleProjectFormChange}
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label>Total Towers <span style={{ color: 'red' }}>*</span></label>
                              <input
                                type="number"
                                name="total_towers"
                                value={projectFormData.total_towers}
                                onChange={handleProjectFormChange}
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label>Developer Name <span style={{ color: 'red' }}>*</span></label>
                              <input
                                type="text"
                                name="developer_name"
                                value={projectFormData.developer_name}
                                onChange={handleProjectFormChange}
                                required
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Media & Pricing Section */}
                      <div className="form-section">
                        <div className="section-header" onClick={() => toggleSection('media')}>
                          <h4>Media & Pricing</h4>
                          <span>{expandedSections.media ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.media && (
                          <div className="form-grid">
                            <div className="form-group full-width">
                              <label>Cover Image <span style={{ color: 'red' }}>*</span></label>
                              <input
                                type="file"
                                name="cover_image"
                                accept="image/*"
                                onChange={handleProjectFormChange}
                                required={!editingProject}
                              />
                            </div>

                            <div className="form-group">
                              <label>Price (₹) <span style={{ color: 'red' }}>*</span></label>
                              <input
                                type="number"
                                name="price"
                                required
                                value={projectFormData.price}
                                onChange={handleProjectFormChange}
                                step="0.01"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Settings Section */}
                      <div className="form-section">
                        <div className="section-header" onClick={() => toggleSection('settings')}>
                          <h4>Settings</h4>
                          <span>{expandedSections.settings ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.settings && (
                          <div className="form-grid">
                            <div className="form-group">
                              <label className="checkbox-label-large">
                                <input
                                  type="checkbox"
                                  name="featured"
                                  checked={projectFormData.featured}
                                  onChange={handleProjectFormChange}
                                  className="large-checkbox"
                                />
                                <span>Featured</span>
                              </label>
                            </div>

                            <div className="form-group">
                              <label className="checkbox-label-large">
                                <input
                                  type="checkbox"
                                  name="is_hot"
                                  checked={projectFormData.is_hot}
                                  onChange={handleProjectFormChange}
                                  className="large-checkbox"
                                />
                                <span>Is hot (Mark as Hot property)</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Project Images Section */}
                      <div className="form-section">
                        <div className="section-header" onClick={() => toggleSection('projectImages')}>
                          <h4>PROJECT IMAGES</h4>
                          <span>{expandedSections.projectImages ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.projectImages && (
                          <div className="nested-form-section">
                            <table className="nested-table">
                              <thead>
                                <tr>
                                  <th>IMAGE</th>
                                  <th>TITLE</th>
                                  <th>CATEGORY</th>
                                  <th>ORDER</th>
                                  <th>DELETE?</th>
                                </tr>
                              </thead>
                              <tbody>
                                {projectImages.map((img, index) => (
                                  <tr key={index}>
                                    <td>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => updateProjectImage(index, 'image', e.target.files[0])}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        value={img.title}
                                        onChange={(e) => updateProjectImage(index, 'title', e.target.value)}
                                        placeholder="Image title"
                                      />
                                    </td>
                                    <td>
                                      <select
                                        value={img.category}
                                        onChange={(e) => updateProjectImage(index, 'category', e.target.value)}
                                      >
                                        <option value="other">Other</option>
                                        <option value="inside_view">Inside View</option>
                                        <option value="left_view">Left View</option>
                                        <option value="right_view">Right View</option>
                                        <option value="front_view">Front View</option>
                                        <option value="back_view">Back View</option>
                                        <option value="amenity">Amenity</option>
                                        <option value="gym">Gym</option>
                                        <option value="lawn">Lawn</option>
                                        <option value="pool">Pool</option>
                                      </select>
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        value={img.order}
                                        onChange={(e) => updateProjectImage(index, 'order', parseInt(e.target.value))}
                                        style={{ width: '60px' }}
                                        className={orderErrors.projectImages[index] ? 'error-input' : ''}
                                      />
                                      {orderErrors.projectImages[index] && (
                                        <small style={{ color: 'red', display: 'block', fontSize: '0.75rem', marginTop: '4px' }}>
                                          {orderErrors.projectImages[index]}
                                        </small>
                                      )}
                                    </td>
                                    <td>
                                      <button
                                        type="button"
                                        className="btn-remove"
                                        onClick={() => removeProjectImage(index)}
                                      >
                                        ×
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <button
                              type="button"
                              className="btn-add-another"
                              onClick={addProjectImage}
                            >
                              + Add another Project image
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Project Amenities Section */}
                      <div className="form-section">
                        <div className="section-header" onClick={() => toggleSection('projectAmenities')}>
                          <h4>PROJECT AMENITIES</h4>
                          <span>{expandedSections.projectAmenities ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.projectAmenities && (
                          <div className="nested-form-section">
                            <table className="nested-table">
                              <thead>
                                <tr>
                                  <th>NAME *</th>
                                  <th>ORDER</th>
                                  <th>DELETE?</th>
                                </tr>
                              </thead>
                              <tbody>
                                {projectAmenities.map((amenity, index) => (
                                  <tr key={index}>
                                    <td>
                                      <input
                                        type="text"
                                        value={amenity.name}
                                        onChange={(e) => updateProjectAmenity(index, 'name', e.target.value)}
                                        placeholder="Amenity name"
                                        required
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        value={amenity.order}
                                        onChange={(e) => updateProjectAmenity(index, 'order', parseInt(e.target.value))}
                                        style={{ width: '60px' }}
                                        className={orderErrors.projectAmenities[index] ? 'error-input' : ''}
                                      />
                                      {orderErrors.projectAmenities[index] && (
                                        <small style={{ color: 'red', display: 'block', fontSize: '0.75rem', marginTop: '4px' }}>
                                          {orderErrors.projectAmenities[index]}
                                        </small>
                                      )}
                                    </td>
                                    <td>
                                      <button
                                        type="button"
                                        className="btn-remove"
                                        onClick={() => removeProjectAmenity(index)}
                                      >
                                        ×
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <button
                              type="button"
                              className="btn-add-another"
                              onClick={addProjectAmenity}
                            >
                              + Add another Project amenity
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Towers Section */}
                      <div className="form-section">
                        <div className="section-header" onClick={() => toggleSection('towers')}>
                          <h4>TOWERS</h4>
                          <span>{expandedSections.towers ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.towers && (
                          <div className="nested-form-section">
                            {towers.map((tower, towerIndex) => (
                              <div key={towerIndex} className="tower-section">
                                <div className="tower-header">
                                  <h5>Tower {towerIndex + 1}</h5>
                                  {towers.length > 1 && (
                                    <button
                                      type="button"
                                      className="btn-remove"
                                      onClick={() => removeTower(towerIndex)}
                                    >
                                      Remove Tower
                                    </button>
                                  )}
                                </div>
                                <div className="form-grid">
                                  <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                      type="text"
                                      value={tower.name}
                                      onChange={(e) => updateTower(towerIndex, 'name', e.target.value)}
                                      placeholder="e.g., A, B, C or Tower 1"
                                      required
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Tower Number</label>
                                    <input
                                      type="text"
                                      value={tower.tower_number}
                                      onChange={(e) => updateTower(towerIndex, 'tower_number', e.target.value)}
                                      placeholder="e.g., A Wing, B Wing"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Total Floors</label>
                                    <input
                                      type="number"
                                      value={tower.total_floors}
                                      onChange={(e) => updateTower(towerIndex, 'total_floors', e.target.value)}
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Parking Floors</label>
                                    <input
                                      type="number"
                                      value={tower.parking_floors}
                                      onChange={(e) => updateTower(towerIndex, 'parking_floors', e.target.value)}
                                      placeholder="Number of parking floors"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Residential Floors</label>
                                    <input
                                      type="number"
                                      value={tower.residential_floors}
                                      onChange={(e) => updateTower(towerIndex, 'residential_floors', e.target.value)}
                                      placeholder="Number of residential floors"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Refuge Floors</label>
                                    <input
                                      type="number"
                                      value={tower.refugee_floors}
                                      onChange={(e) => updateTower(towerIndex, 'refugee_floors', e.target.value)}
                                      placeholder="Number of refuge floors"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Per Floor Flats</label>
                                    <input
                                      type="number"
                                      value={tower.per_floor_flats}
                                      onChange={(e) => updateTower(towerIndex, 'per_floor_flats', e.target.value)}
                                      placeholder="Number of flats per floor"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Total Lifts</label>
                                    <input
                                      type="number"
                                      value={tower.total_lifts}
                                      onChange={(e) => updateTower(towerIndex, 'total_lifts', e.target.value)}
                                      placeholder="Total number of lifts"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Total Stairs</label>
                                    <input
                                      type="number"
                                      value={tower.total_stairs}
                                      onChange={(e) => updateTower(towerIndex, 'total_stairs', e.target.value)}
                                      placeholder="Total number of stairs"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Booking Status</label>
                                    <select
                                      value={tower.booking_status}
                                      onChange={(e) => updateTower(towerIndex, 'booking_status', e.target.value)}
                                    >
                                      <option value="available">Available</option>
                                      <option value="sold_out">Sold Out</option>
                                      <option value="booking_open">Booking Open</option>
                                    </select>
                                  </div>
                                  <div className="form-group">
                                    <label className="checkbox-label-large">
                                      <input
                                        type="checkbox"
                                        checked={tower.is_active}
                                        onChange={(e) => updateTower(towerIndex, 'is_active', e.target.checked)}
                                        className="large-checkbox"
                                      />
                                      <span>Is Active</span>
                                    </label>
                                  </div>
                                  <div className="form-group">
                                    <label>Order</label>
                                    <input
                                      type="number"
                                      value={tower.order}
                                      onChange={(e) => updateTower(towerIndex, 'order', parseInt(e.target.value))}
                                      className={orderErrors.towers[towerIndex] ? 'error-input' : ''}
                                    />
                                    {orderErrors.towers[towerIndex] && (
                                      <small style={{ color: 'red', display: 'block', fontSize: '0.75rem', marginTop: '4px' }}>
                                        {orderErrors.towers[towerIndex]}
                                      </small>
                                    )}
                                  </div>
                                </div>

                                {/* Tower Flats */}
                                <div className="nested-subsection">
                                  <h6>Flats</h6>
                                  <table className="nested-table">
                                    <thead>
                                      <tr>
                                        <th>FLAT NUMBER</th>
                                        <th>FLOOR</th>
                                        <th>FLAT TYPE</th>
                                        <th>AREA</th>
                                        <th>PRICE</th>
                                        <th>AVAILABILITY</th>
                                        <th>ORDER</th>
                                        <th>DELETE?</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {tower.flats.map((flat, flatIndex) => (
                                        <tr key={flatIndex}>
                                          <td>
                                            <input
                                              type="text"
                                              value={flat.flat_number}
                                              onChange={(e) => updateTowerFlat(towerIndex, flatIndex, 'flat_number', e.target.value)}
                                              placeholder="101, 102, etc."
                                            />
                                          </td>
                                          <td>
                                            <input
                                              type="text"
                                              value={flat.floor}
                                              onChange={(e) => updateTowerFlat(towerIndex, flatIndex, 'floor', e.target.value)}
                                              placeholder="1, 2, 3, etc."
                                            />
                                          </td>
                                          <td>
                                            <select
                                              value={flat.flat_type}
                                              onChange={(e) => updateTowerFlat(towerIndex, flatIndex, 'flat_type', e.target.value)}
                                            >
                                              <option value="">Select</option>
                                              <option value="1bhk">1 BHK</option>
                                              <option value="1.5bhk">1.5 BHK</option>
                                              <option value="2bhk">2 BHK</option>
                                              <option value="2.5bhk">2.5 BHK</option>
                                              <option value="3bhk">3 BHK</option>
                                              <option value="3.5bhk">3.5 BHK</option>
                                              <option value="4bhk">4 BHK</option>
                                              <option value="4.5bhk">4.5 BHK</option>
                                              <option value="5bhk">5 BHK</option>
                                              <option value="5.5bhk">5.5 BHK</option>
                                            </select>
                                          </td>
                                          <td>
                                            <input
                                              type="text"
                                              value={flat.area}
                                              onChange={(e) => updateTowerFlat(towerIndex, flatIndex, 'area', e.target.value)}
                                              placeholder="e.g., 1200 sq ft"
                                            />
                                          </td>
                                          <td>
                                            <input
                                              type="number"
                                              value={flat.price}
                                              onChange={(e) => updateTowerFlat(towerIndex, flatIndex, 'price', e.target.value)}
                                              placeholder="Price"
                                            />
                                          </td>
                                          <td>
                                            <select
                                              value={flat.availability}
                                              onChange={(e) => updateTowerFlat(towerIndex, flatIndex, 'availability', e.target.value)}
                                            >
                                              <option value="available">Available</option>
                                              <option value="sold">Sold</option>
                                              <option value="reserved">Reserved</option>
                                            </select>
                                          </td>
                                          <td>
                                            <input
                                              type="number"
                                              value={flat.order}
                                              onChange={(e) => updateTowerFlat(towerIndex, flatIndex, 'order', parseInt(e.target.value))}
                                              style={{ width: '60px' }}
                                            />
                                          </td>
                                          <td>
                                            <button
                                              type="button"
                                              className="btn-remove"
                                              onClick={() => removeTowerFlat(towerIndex, flatIndex)}
                                            >
                                              ×
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <button
                                    type="button"
                                    className="btn-add-another"
                                    onClick={() => addTowerFlat(towerIndex)}
                                  >
                                    + Add another Flat
                                  </button>
                                </div>

                                {/* Tower Amenities */}
                                <div className="nested-subsection">
                                  <h6>Tower Amenities</h6>
                                  <table className="nested-table">
                                    <thead>
                                      <tr>
                                        <th>NAME</th>
                                        <th>ICON</th>
                                        <th>ORDER</th>
                                        <th>DELETE?</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {tower.amenities.map((amenity, amenityIndex) => (
                                        <tr key={amenityIndex}>
                                          <td>
                                            <input
                                              type="text"
                                              value={amenity.name}
                                              onChange={(e) => updateTowerAmenity(towerIndex, amenityIndex, 'name', e.target.value)}
                                              placeholder="Amenity name"
                                            />
                                          </td>
                                          <td>
                                            <input
                                              type="text"
                                              value={amenity.icon}
                                              onChange={(e) => updateTowerAmenity(towerIndex, amenityIndex, 'icon', e.target.value)}
                                              placeholder="Icon/Emoji"
                                            />
                                          </td>
                                          <td>
                                            <input
                                              type="number"
                                              value={amenity.order}
                                              onChange={(e) => updateTowerAmenity(towerIndex, amenityIndex, 'order', parseInt(e.target.value))}
                                              style={{ width: '60px' }}
                                            />
                                          </td>
                                          <td>
                                            <button
                                              type="button"
                                              className="btn-remove"
                                              onClick={() => removeTowerAmenity(towerIndex, amenityIndex)}
                                            >
                                              ×
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <button
                                    type="button"
                                    className="btn-add-another"
                                    onClick={() => addTowerAmenity(towerIndex)}
                                  >
                                    + Add another Tower amenity
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="btn-add-another"
                              onClick={addTower}
                            >
                              + Add another Tower
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          {loading ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowProjectForm(false)
                            setEditingProject(null)
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="projects-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Hot</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.length > 0 ? (
                      projects.map((project) => (
                        <tr key={project.id}>
                          <td>{project.title}</td>
                          <td>{project.property_type}</td>
                          <td>{project.location}</td>
                          <td>{project.project_status || '-'}</td>
                          <td>{project.is_hot ? '✓' : '-'}</td>
                          <td>{project.featured ? '✓' : '-'}</td>
                          <td>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleEditProject(project)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-data">No projects found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div className="leads-tab">
              <div className="tab-header">
                <h2>Leads Management</h2>
                <div className="period-filter">
                  <button
                    className={selectedPeriod === 'today' ? 'active' : ''}
                    onClick={() => setSelectedPeriod('today')}
                  >
                    Today
                  </button>
                  <button
                    className={selectedPeriod === 'yesterday' ? 'active' : ''}
                    onClick={() => setSelectedPeriod('yesterday')}
                  >
                    Yesterday
                  </button>
                  <button
                    className={selectedPeriod === 'week' ? 'active' : ''}
                    onClick={() => setSelectedPeriod('week')}
                  >
                    Last Week
                  </button>
                  <button
                    className={selectedPeriod === 'month' ? 'active' : ''}
                    onClick={() => setSelectedPeriod('month')}
                  >
                    Last Month
                  </button>
                  <button
                    className={selectedPeriod === 'all' ? 'active' : ''}
                    onClick={() => setSelectedPeriod('all')}
                  >
                    All
                  </button>
                </div>
              </div>

              <div className="leads-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Project</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length > 0 ? (
                      leads.map((lead) => (
                        <tr key={lead.id} className={lead.read ? '' : 'unread'}>
                          <td>{lead.name}</td>
                          <td>{lead.email || '-'}</td>
                          <td>{lead.phone}</td>
                          <td>{lead.project_title || '-'}</td>
                          <td>{lead.subject}</td>
                          <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${lead.read ? 'read' : 'unread'}`}>
                              {lead.read ? 'Read' : 'Unread'}
                            </span>
                          </td>
                          <td>
                            {!lead.read && (
                              <button
                                className="btn btn-sm"
                                onClick={() => handleMarkRead(lead.id)}
                              >
                                Mark Read
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => {
                                alert(`Message: ${lead.message || 'No message'}`)
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="no-data">No leads found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
