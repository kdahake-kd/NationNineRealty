import React, { useState, useEffect } from 'react'
// Services model removed - this page may need to be updated or removed
// import { servicesAPI } from '../../services/api'
import './Services.css'

const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    // Services model removed
    setServices([])
    setLoading(false)
  }

  if (loading) {
    return <div className="loading">Loading services...</div>
  }

  return (
    <div className="services-page">
      <section className="services-hero">
        <div className="container">
          <h1>Our Services</h1>
          <p>Comprehensive real estate solutions for all your needs</p>
        </div>
      </section>

      <section className="services-list section">
        <div className="container">
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon || '🏢'}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services

