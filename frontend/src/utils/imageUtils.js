// Utility functions for handling images

const BACKEND_BASE_URL = 'http://localhost:8000'

// Get full image URL from backend
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null
  
  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // If relative URL, prepend backend base URL
  if (imageUrl.startsWith('/')) {
    return `${BACKEND_BASE_URL}${imageUrl}`
  }
  
  // Otherwise, assume it's a media URL
  return `${BACKEND_BASE_URL}/media/${imageUrl}`
}

// Get placeholder image URL
export const getPlaceholderImage = () => {
  return 'https://via.placeholder.com/800x600/667eea/ffffff?text=No+Image+Available'
}

// Handle image load error
export const handleImageError = (e) => {
  e.target.src = getPlaceholderImage()
}

