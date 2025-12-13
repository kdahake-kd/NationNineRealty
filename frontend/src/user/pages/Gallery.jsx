import React, { useState, useEffect } from 'react'
// Gallery model removed - this page may need to be updated or removed
// import { galleryAPI } from '../../services/api'
import { getImageUrl, getPlaceholderImage, handleImageError } from '../../utils/imageUtils'
import './Gallery.css'

const Gallery = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    // Gallery model removed
    setImages([])
    setLoading(false)
  }

  if (loading) {
    return <div className="loading">Loading gallery...</div>
  }

  return (
    <div className="gallery-page">
      <section className="gallery-hero">
        <div className="container">
          <h1>Gallery</h1>
          <p>Explore our property gallery</p>
        </div>
      </section>

      <section className="gallery-list section">
        <div className="container">
          <div className="gallery-grid">
            {images.map((image) => (
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
                {image.title && <div className="gallery-overlay">
                  <h3>{image.title}</h3>
                </div>}
              </div>
            ))}
          </div>
        </div>
      </section>

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

export default Gallery

