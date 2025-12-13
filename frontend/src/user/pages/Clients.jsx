import React, { useState, useEffect } from 'react'
import { clientsAPI } from '../../services/api'
import { getImageUrl, getPlaceholderImage, handleImageError } from '../../utils/imageUtils'
import './Clients.css'

const Clients = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll()
      setClients(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading clients...</div>
  }

  return (
    <div className="clients-page">
      <section className="clients-hero">
        <div className="container">
          <h1>Our Clients</h1>
          <p>Our awesome clients we've had the pleasure to work with!</p>
        </div>
      </section>

      <section className="clients-list section">
        <div className="container">
          <div className="clients-grid">
            {clients.map((client) => (
              <div key={client.id} className="client-card">
                {client.logo_url ? (
                  <img 
                    src={getImageUrl(client.logo_url) || getPlaceholderImage()} 
                    alt={client.name}
                    onError={handleImageError}
                  />
                ) : (
                  <div className="client-placeholder">
                    <h3>{client.name}</h3>
                  </div>
                )}
                {client.website && (
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="client-link">
                    Visit Website
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Clients

