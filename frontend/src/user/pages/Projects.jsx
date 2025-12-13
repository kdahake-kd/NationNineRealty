import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { projectsAPI, citiesAPI } from '../../services/api'
import { getImageUrl, getPlaceholderImage, handleImageError } from '../../utils/imageUtils'
import './Projects.css'

const Projects = () => {
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  
  // Get property_type from URL (from navbar dropdown)
  const urlPropertyType = searchParams.get('property_type') || searchParams.get('type') || ''
  
  const [filters, setFilters] = useState({
    property_type: urlPropertyType,
    city: '',
    search: '',
    flat_type: '',
    possession_year: '',
    project_status: ''
  })

  // Possession years - dynamic from current year to next 5 years
  const getPossessionYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = 0; i <= 5; i++) {
      years.push(currentYear + i)
    }
    return years
  }
  
  const possessionYears = getPossessionYears()
  
  // Flat type options
  const flatTypes = [
    { value: '1bhk', label: '1 BHK' },
    { value: '1.5bhk', label: '1.5 BHK' },
    { value: '2bhk', label: '2 BHK' },
    { value: '2.5bhk', label: '2.5 BHK' },
    { value: '3bhk', label: '3 BHK' },
    { value: '3.5bhk', label: '3.5 BHK' },
    { value: '4bhk', label: '4 BHK' },
    { value: '4.5bhk', label: '4.5 BHK' },
    { value: '5bhk', label: '5 BHK' },
    { value: '5.5bhk', label: '5.5 BHK' },
  ]
  
  // Project status options
  const projectStatuses = [
    { value: 'pre_launch', label: 'Pre Launch' },
    { value: 'new_launch', label: 'New Launch' },
    { value: 'new_tower_launch', label: 'New Tower Launch' },
    { value: 'ready_to_move', label: 'Ready To Move' },
    { value: 'nearing_possession', label: 'Nearing Possession' },
  ]

  useEffect(() => {
    fetchCities()
    // Show search if property_type is selected from URL
    if (urlPropertyType) {
      setShowSearch(true)
      setFilters(prev => ({ ...prev, property_type: urlPropertyType }))
    }
  }, [urlPropertyType])

  useEffect(() => {
    fetchProjects()
  }, [filters])

  const fetchCities = async () => {
    try {
      const response = await citiesAPI.getAll()
      setCities(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.property_type) params.property_type = filters.property_type
      if (filters.city) params.city_id = filters.city
      if (filters.search) params.search = filters.search
      if (filters.flat_type) params.flat_type = filters.flat_type
      if (filters.possession_year) params.possession_year = filters.possession_year
      if (filters.project_status) params.project_status = filters.project_status
      
      const response = await projectsAPI.getAll(params)
      setProjects(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
    if (!showSearch) {
      setShowSearch(true)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProjects()
  }

  if (loading) {
    return <div className="loading">Loading projects...</div>
  }

  // Format price helper function
  const formatPrice = (price) => {
    if (!price) return ''
    const priceNum = parseFloat(price)
    if (priceNum >= 10000000) {
      const crores = (priceNum / 10000000).toFixed(1)
      return `₹${crores}CR onwards`
    } else if (priceNum >= 100000) {
      const lakhs = (priceNum / 100000).toFixed(0)
      return `₹${lakhs}L onwards`
    } else {
      return `₹${priceNum.toLocaleString()} onwards`
    }
  }

  return (
    <div className="projects-page">
      <section className="projects-hero">
        <div className="container">
          <h1>Our Properties</h1>
          <p>Discover premium residential and commercial properties</p>
          {filters.property_type && (
            <p className="filter-indicator">
              Showing: <strong>{filters.property_type.charAt(0).toUpperCase() + filters.property_type.slice(1)}</strong> Properties
            </p>
          )}
        </div>
      </section>

      {/* Search Section - Same as Home Page */}
      {showSearch && (
        <section className="projects-search-section section">
          <div className="container">
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-row">
                {/* Location/City Dropdown */}
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="search-input"
                >
                  <option value="">Location</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
                
                {/* Project Name Search */}
                <input
                  type="text"
                  placeholder="Project Name"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="search-input"
                />
                
                {/* Flat Type Dropdown */}
                <select
                  value={filters.flat_type}
                  onChange={(e) => handleFilterChange('flat_type', e.target.value)}
                  className="search-input"
                >
                  <option value="">Flat Type</option>
                  {flatTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                
                {/* Possession Year Dropdown */}
                <select
                  value={filters.possession_year}
                  onChange={(e) => handleFilterChange('possession_year', e.target.value)}
                  className="search-input"
                >
                  <option value="">Possession Year</option>
                  {possessionYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                
                {/* Project Status Dropdown */}
                <select
                  value={filters.project_status}
                  onChange={(e) => handleFilterChange('project_status', e.target.value)}
                  className="search-input"
                >
                  <option value="">Project Status</option>
                  {projectStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                
                <button type="submit" className="btn btn-primary search-btn">Search</button>
              </div>
            </form>
          </div>
        </section>
      )}

      <section className="projects-list section">
        <div className="container">
          {projects.length > 0 ? (
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-image">
                    <img 
                      src={getImageUrl(project.cover_image_url) || getPlaceholderImage()} 
                      alt={project.title}
                      onError={handleImageError}
                    />
                    <span className="project-badge">{project.property_type}</span>
                    <span className="status-badge">{project.status}</span>
                  </div>
                  <div className="project-info">
                    <h3>{project.title}</h3>
                    <p className="project-location">
                      <span>📍</span> {project.location}
                    </p>
                    <p className="project-description">{project.description.substring(0, 100)}...</p>
                    <div className="project-meta">
                      {project.price && (
                        <span className="project-price">{formatPrice(project.price)}</span>
                      )}
                    </div>
                    <div className="project-footer">
                      <span className="views">👁 {project.views} views</span>
                      <Link to={`/projects/${project.id}`} className="btn btn-primary">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-projects">
              <p>No projects found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Projects

