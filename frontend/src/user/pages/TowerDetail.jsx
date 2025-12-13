import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { towersAPI, flatsAPI, projectsAPI } from '../../services/api'
import { getImageUrl, getPlaceholderImage, handleImageError } from '../../utils/imageUtils'
import './TowerDetail.css'

const TowerDetail = () => {
  const { projectId, towerId } = useParams()
  const [tower, setTower] = useState(null)
  const [project, setProject] = useState(null)
  const [flats, setFlats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [filterFlatType, setFilterFlatType] = useState('all')

  useEffect(() => {
    fetchData()
  }, [projectId, towerId])

  const fetchData = async () => {
    try {
      const [towerRes, projectRes, flatsRes] = await Promise.all([
        towersAPI.getById(towerId),
        projectsAPI.getById(projectId),
        flatsAPI.getByTower(towerId)
      ])
      
      setTower(towerRes.data)
      setProject(projectRes.data)
      setFlats(flatsRes.data.results || flatsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading tower details...</div>
  }

  if (!tower || !project) {
    return <div className="error">Tower not found</div>
  }

  // Get unique floors
  const floors = [...new Set(flats.map(flat => flat.floor_number))].sort((a, b) => b - a)
  
  // Get unique flat types
  const flatTypes = [...new Set(flats.map(flat => flat.flat_type))].sort()
  
  // Filter flats
  const filteredFlats = filterFlatType === 'all' 
    ? flats 
    : flats.filter(flat => flat.flat_type === filterFlatType)

  // Group flats by floor
  const flatsByFloor = filteredFlats.reduce((acc, flat) => {
    if (!acc[flat.floor_number]) {
      acc[flat.floor_number] = []
    }
    acc[flat.floor_number].push(flat)
    return acc
  }, {})

  // Get status counts
  const statusCounts = {
    available: flats.filter(f => f.status === 'available').length,
    sold: flats.filter(f => f.status === 'sold').length,
    reserved: flats.filter(f => f.status === 'reserved').length,
    hold: flats.filter(f => f.status === 'hold').length,
  }

  return (
    <div className="tower-detail">
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <Link to="/projects">Projects</Link> / 
          <Link to={`/projects/${projectId}`}>{project.title}</Link> / 
          <span>{tower.name}</span>
        </div>
      </div>

      {/* Tower Header */}
      <section className="tower-header-section">
        <div className="container">
          <h1>{tower.name} {tower.tower_number && `- ${tower.tower_number}`}</h1>
          <p className="tower-subtitle">A Project By {project.developer_name || 'NationNineRealty'} At {project.location}</p>
          <div className="tower-status-badge">
            <span className={`status ${tower.booking_status}`}>
              {tower.booking_status === 'booking_open' ? 'Booking Open' : 
               tower.booking_status === 'booking_closed' ? 'Booking Closed' : 'Sold Out'}
            </span>
          </div>
        </div>
      </section>

      {/* Tower Details */}
      <section className="tower-details-section section">
        <div className="container">
          <h2 className="section-title">Tower Details - {tower.name} {tower.tower_number && `(${tower.tower_number})`}</h2>
          
          <div className="tower-details-grid">
            <div className="tower-details-column">
              <div className="detail-row">
                <span className="detail-label">Total Floors</span>
                <span className="detail-value">{tower.total_floors}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Parking Floors</span>
                <span className="detail-value">{tower.parking_floors}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Residential Floors</span>
                <span className="detail-value">{tower.residential_floors}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Refuge Floors</span>
                <span className="detail-value">{tower.refugee_floors}</span>
              </div>
              {tower.start_date && (
                <div className="detail-row">
                  <span className="detail-label">Start Date</span>
                  <span className="detail-value">{new Date(tower.start_date).toLocaleDateString()}</span>
                </div>
              )}
              {tower.rera_number && (
                <div className="detail-row">
                  <span className="detail-label">RERA Number</span>
                  <span className="detail-value">{tower.rera_number}</span>
                </div>
              )}
            </div>
            
            <div className="tower-details-column">
              <div className="detail-row">
                <span className="detail-label">Total Flats</span>
                <span className="detail-value">{tower.total_flats || flats.length}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Per Floor Flats</span>
                <span className="detail-value">{tower.per_floor_flats}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Lifts</span>
                <span className="detail-value">{tower.total_lifts}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Stairs</span>
                <span className="detail-value">{tower.total_stairs}</span>
              </div>
              {tower.completion_date && (
                <div className="detail-row">
                  <span className="detail-label">Completion Date</span>
                  <span className="detail-value">{new Date(tower.completion_date).toLocaleDateString()}</span>
                </div>
              )}
              {tower.rera_completion_date && (
                <div className="detail-row">
                  <span className="detail-label">RERA Completion Date</span>
                  <span className="detail-value">{new Date(tower.rera_completion_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tower Amenities */}
      {tower.amenities && tower.amenities.length > 0 && (
        <section className="tower-amenities-section section">
          <div className="container">
            <h2 className="section-title">Tower Amenities</h2>
            <div className="amenities-grid">
              {tower.amenities.map((amenity) => (
                <div key={amenity.id} className="amenity-item">
                  {amenity.icon && <span className="amenity-icon">{amenity.icon}</span>}
                  <span className="amenity-name">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flats Section */}
      {flats.length > 0 && (
        <section className="flats-section section">
          <div className="container">
            <div className="flats-header">
              <h2 className="section-title">Flat Details</h2>
              
              {/* Status Legend */}
              <div className="status-legend">
                <div className="legend-item">
                  <span className="legend-dot available"></span>
                  <span>Flats Available</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot sold"></span>
                  <span>Flats Sold</span>
                </div>
              </div>

              {/* Filters */}
              <div className="flats-filters">
                <button
                  className={`filter-btn ${filterFlatType === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterFlatType('all')}
                >
                  All Types
                </button>
                {flatTypes.map(type => (
                  <button
                    key={type}
                    className={`filter-btn ${filterFlatType === type ? 'active' : ''}`}
                    onClick={() => setFilterFlatType(type)}
                  >
                    {type.toUpperCase().replace('BH', ' BHK')}
                  </button>
                ))}
              </div>

              {/* Status Summary */}
              <div className="status-summary">
                <div className="summary-item">
                  <span className="summary-label">Available:</span>
                  <span className="summary-value available">{statusCounts.available}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Sold:</span>
                  <span className="summary-value sold">{statusCounts.sold}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Reserved:</span>
                  <span className="summary-value reserved">{statusCounts.reserved}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Hold:</span>
                  <span className="summary-value hold">{statusCounts.hold}</span>
                </div>
              </div>
            </div>

            {/* Flats Grid by Floor */}
            <div className="flats-by-floor">
              {floors.map(floor => (
                <div key={floor} className="floor-section">
                  <h3 className="floor-title">Floor {floor}</h3>
                  <div className="flats-grid">
                    {flatsByFloor[floor]?.map(flat => (
                      <div
                        key={flat.id}
                        className={`flat-card ${flat.status}`}
                        onClick={() => setSelectedFloor(floor)}
                      >
                        <div className="flat-number">{flat.flat_number}</div>
                        <div className="flat-type">{flat.flat_type.toUpperCase().replace('BH', ' BHK')}</div>
                        <div className="flat-area">{flat.carpet_area} SQFT</div>
                        {flat.price && (
                          <div className="flat-price">₹{flat.price.toLocaleString()}</div>
                        )}
                        <div className={`flat-status ${flat.status}`}>
                          {flat.status === 'available' ? 'Available' :
                           flat.status === 'sold' ? 'Sold' :
                           flat.status === 'reserved' ? 'Reserved' : 'Hold'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="tower-contact-section section">
        <div className="container">
          <div className="contact-box-large">
            <h2>Interested in this tower?</h2>
            <p>Contact us for more information about {tower.name} in {project.title}</p>
            <Link to="/contact" className="btn btn-primary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TowerDetail

