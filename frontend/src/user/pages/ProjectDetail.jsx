import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectsAPI, blogAPI } from '../../services/api'
import { getImageUrl, getPlaceholderImage, handleImageError } from '../../utils/imageUtils'
import './ProjectDetail.css'

const ProjectDetail = () => {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [blogPost, setBlogPost] = useState(null)
  const [nearbyProjects, setNearbyProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [activeSpecTab, setActiveSpecTab] = useState('all')

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      const [projectRes, blogRes, nearbyRes] = await Promise.all([
        projectsAPI.getById(id),
        blogAPI.getAll({ project: id }),
        projectsAPI.getAll({ limit: 4 })
      ])
      
      setProject(projectRes.data)
      
      // Get blog post with video for this project
      const blogs = blogRes.data.results || blogRes.data
      const blogWithVideo = blogs.find(blog => blog.video_url && blog.project === parseInt(id))
      if (blogWithVideo) {
        setBlogPost(blogWithVideo)
      }
      
      // Get nearby projects (excluding current)
      const nearby = (nearbyRes.data.results || nearbyRes.data).filter(p => p.id !== parseInt(id)).slice(0, 4)
      setNearbyProjects(nearby)
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading project details...</div>
  }

  if (!project) {
    return <div className="error">Project not found</div>
  }

  // Group images by category
  const groupedImages = project.images?.reduce((acc, img) => {
    const category = img.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(img)
    return acc
  }, {}) || {}

  // Get all unique categories
  const categories = Object.keys(groupedImages)

  // Specifications data
  const specifications = [
    { key: 'structure', label: 'Structure', value: project.structure },
    { key: 'flooring', label: 'Flooring', value: project.flooring },
    { key: 'kitchen', label: 'Kitchen', value: project.kitchen },
    { key: 'electrical', label: 'Electrical', value: project.electrical },
    { key: 'doors', label: 'Doors', value: project.doors },
    { key: 'plaster', label: 'Plaster', value: project.plaster },
    { key: 'windows', label: 'Window', value: project.windows },
    { key: 'toilet', label: 'Toilet', value: project.toilet },
    { key: 'security_safety', label: 'Security & Safety', value: project.security_safety },
    { key: 'paint', label: 'Paint', value: project.paint },
    { key: 'plumbing', label: 'Plumbing', value: project.plumbing },
    { key: 'lift', label: 'Lift', value: project.lift },
  ].filter(spec => spec.value)

  // Format flat types
  const formatFlatTypes = (flatTypes) => {
    if (!flatTypes) return ''
    return flatTypes.split(',').map(type => {
      const formatted = type.trim().replace('bhk', ' BHK').toUpperCase()
      return formatted
    }).join(', ')
  }

  return (
    <div className="project-detail">
      {/* Main Content Section - Left Details, Right Images */}
      <section className="project-main-section section">
        <div className="container">
          <div className="project-main-layout">
            {/* Left Side - Details */}
            <div className="project-details-left">
              {/* Main Image Card */}
              <div className="project-main-image-card">
                <img 
                  src={getImageUrl(project.cover_image_url) || getPlaceholderImage()} 
                  alt={project.title}
                  onError={handleImageError}
                />
              </div>

              {/* Description */}
              <div className="project-description-card">
                <h2>{project.title}</h2>
                {project.about_listing ? (
                  <div className="description-content" dangerouslySetInnerHTML={{ __html: project.about_listing }} />
                ) : (
                  <p className="description-content">{project.description}</p>
                )}
              </div>

              {/* Project Details */}
              <div className="project-details-card">
                <h3>Project Details</h3>
                <div className="project-details-grid">
                  {project.project_status && (
                    <div className="detail-item">
                      <span className="detail-label">Phase</span>
                      <span className="detail-value">{project.project_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  )}
                  {project.land_area && (
                    <div className="detail-item">
                      <span className="detail-label">Land Parcel</span>
                      <span className="detail-value">{project.land_area}</span>
                    </div>
                  )}
                  {project.amenities_area && (
                    <div className="detail-item">
                      <span className="detail-label">Amenities Area</span>
                      <span className="detail-value">{project.amenities_area}</span>
                    </div>
                  )}
                  {project.total_units && (
                    <div className="detail-item">
                      <span className="detail-label">Total Units</span>
                      <span className="detail-value">{project.total_units}</span>
                    </div>
                  )}
                  {project.rera_number && (
                    <div className="detail-item">
                      <span className="detail-label">RERA Number</span>
                      <span className="detail-value">{project.rera_number}</span>
                    </div>
                  )}
                  {project.total_towers && (
                    <div className="detail-item">
                      <span className="detail-label">Total Towers</span>
                      <span className="detail-value">{project.total_towers}</span>
                    </div>
                  )}
                  {project.available_flat_types && (
                    <div className="detail-item">
                      <span className="detail-label">Flat Types</span>
                      <span className="detail-value">{formatFlatTypes(project.available_flat_types)}</span>
                    </div>
                  )}
                  {project.status && (
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span className="detail-value">{project.status === 'ongoing' ? 'Token Started' : 'Completed'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities Section */}
              {project.amenities && project.amenities.length > 0 && (
                <div className="amenities-card">
                  <h3>Amenities</h3>
                  <ul className="amenities-list">
                    {project.amenities.map((amenity) => (
                      <li key={amenity.id}>
                        {amenity.icon && <span className="amenity-icon">{amenity.icon}</span>}
                        <span>{amenity.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Video Section - if blog with video exists */}
              {blogPost && blogPost.video_url && (
                <div className="project-video-card">
                  <h3>Project Video</h3>
                  <div className="video-wrapper">
                    <video controls>
                      <source src={getImageUrl(blogPost.video_url)} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {/* Contact Developer */}
              <div className="contact-developer-card">
                <h3>Contact Developer</h3>
                <Link to={`/contact?project=${project.id}`} className="btn btn-primary">
                  Contact Developer
                </Link>
              </div>
            </div>

            {/* Right Side - Images */}
            <div className="project-images-right">
              {project.images && project.images.length > 0 && (
                <>
                  <h3>Project Images</h3>
                  <div className="project-images-grid">
                    {project.images.map((image) => (
                      <div
                        key={image.id}
                        className="project-image-item"
                        onClick={() => setSelectedImage(image)}
                      >
                        <img 
                          src={getImageUrl(image.image_url) || getPlaceholderImage()} 
                          alt={image.title || 'Project image'}
                          onError={handleImageError}
                        />
                        {image.title && (
                          <div className="image-overlay">
                            <span>{image.title}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Areas Slider */}
      {nearbyProjects.length > 0 && (
        <section className="nearby-projects-section section">
          <div className="container">
            <h2 className="section-title">Nearby Areas</h2>
            <div className="nearby-projects-slider">
              {nearbyProjects.map((nearbyProject) => (
                <Link
                  key={nearbyProject.id}
                  to={`/projects/${nearbyProject.id}`}
                  className="nearby-project-card"
                >
                  <div className="nearby-project-image">
                    <img 
                      src={getImageUrl(nearbyProject.cover_image_url) || getPlaceholderImage()} 
                      alt={nearbyProject.title}
                      onError={handleImageError}
                    />
                  </div>
                  <div className="nearby-project-info">
                    <h4>{nearbyProject.title}</h4>
                    <p>{nearbyProject.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Towers Section */}
      {project.towers && project.towers.length > 0 && (
        <section className="towers-section section">
          <div className="container">
            <h2 className="section-title">Select Tower To View Details & Available Flats</h2>
            <div className="towers-grid">
              {project.towers.map((tower) => (
                <Link 
                  key={tower.id} 
                  to={`/projects/${project.id}/towers/${tower.id}`}
                  className="tower-card"
                >
                  <div className="tower-header">
                    <h3>{tower.name}</h3>
                    {tower.tower_number && <span className="tower-number">{tower.tower_number}</span>}
                  </div>
                  <div className="tower-status">
                    <span className={`status-badge ${tower.booking_status}`}>
                      {tower.booking_status === 'booking_open' ? 'Booking Open' : 
                       tower.booking_status === 'booking_closed' ? 'Booking Closed' : 'Sold Out'}
                    </span>
                  </div>
                  <div className="tower-details">
                    <div className="tower-detail-item">
                      <span className="detail-label">Total Floors</span>
                      <span className="detail-value">{tower.total_floors}</span>
                    </div>
                    <div className="tower-detail-item">
                      <span className="detail-label">Total Flats</span>
                      <span className="detail-value">{tower.total_flats || tower.available_flats_count + tower.sold_flats_count || 0}</span>
                    </div>
                    {tower.available_flats_count !== undefined && (
                      <div className="tower-detail-item">
                        <span className="detail-label">Available</span>
                        <span className="detail-value available">{tower.available_flats_count}</span>
                      </div>
                    )}
                    {tower.sold_flats_count !== undefined && (
                      <div className="tower-detail-item">
                        <span className="detail-label">Sold</span>
                        <span className="detail-value sold">{tower.sold_flats_count}</span>
                      </div>
                    )}
                  </div>
                  <div className="tower-footer">
                    <span className="view-details">View Details →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Specifications Section */}
      {specifications.length > 0 && (
        <section className="specifications-section section">
          <div className="container">
            <h2 className="section-title">All Specifications</h2>
            
            <div className="specifications-grid">
              {specifications.map((spec) => (
                <div key={spec.key} className="spec-item">
                  <h3 className="spec-label">{spec.label}</h3>
                  <div className="spec-content">
                    {spec.value.split('\n').map((line, idx) => (
                      <p key={idx}>{line.trim()}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {project.images && project.images.length > 0 && (
        <section className="project-gallery-section section">
          <div className="container">
            <h2 className="section-title">Gallery</h2>
            
            {categories.length > 1 && (
              <div className="gallery-filters">
                <button
                  className={activeSpecTab === 'all' ? 'active' : ''}
                  onClick={() => setActiveSpecTab('all')}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={activeSpecTab === category ? 'active' : ''}
                    onClick={() => setActiveSpecTab(category)}
                  >
                    {groupedImages[category][0]?.get_category_display || category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            )}

            <div className="project-gallery-grid">
              {(activeSpecTab === 'all' 
                ? project.images 
                : groupedImages[activeSpecTab] || []
              ).map((image) => (
                <div
                  key={image.id}
                  className="gallery-item"
                  onClick={() => setSelectedImage(image)}
                >
                  <img 
                    src={getImageUrl(image.image_url) || getPlaceholderImage()} 
                    alt={image.title || 'Gallery image'}
                    onError={handleImageError}
                  />
                  {image.title && (
                    <div className="gallery-overlay">
                      <span>{image.title}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* Lightbox for Gallery Images */}
      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>×</button>
            <img 
              src={getImageUrl(selectedImage.image_url) || getPlaceholderImage()} 
              alt={selectedImage.title || 'Gallery image'}
              onError={handleImageError}
            />
            {selectedImage.title && <p>{selectedImage.title}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
