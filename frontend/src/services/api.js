import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'
const BACKEND_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401 (Unauthorized), token is expired or invalid
    // User needs to login again using OTP
    if (error.response?.status === 401) {
      // Check admin status BEFORE clearing storage
      const wasAdminLogin = localStorage.getItem('is_admin_login') === 'true'
      
      // Clear all auth data
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      localStorage.removeItem('login_time')
      localStorage.removeItem('is_admin_login')
      
      // Redirect to login page
      // Check if we're already on login page to avoid redirect loop
      if (!window.location.pathname.includes('/login')) {
        window.location.href = wasAdminLogin ? '/login?admin=true' : '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// Helper function to get full image URL
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

// Helper function to get placeholder image
export const getPlaceholderImage = () => {
  return 'https://via.placeholder.com/800x600/667eea/ffffff?text=No+Image+Available'
}

export const citiesAPI = {
  getAll: () => api.get('/cities/'),
}

export const projectsAPI = {
  getAll: (params) => api.get('/projects/', { params }),
  getById: (id) => api.get(`/projects/${id}/`),
  search: (query) => api.get('/projects/', { params: { search: query } }),
  // Advanced search with filters
  searchAdvanced: (filters) => api.get('/projects/', { params: filters }),
}

export const towersAPI = {
  getAll: (params) => api.get('/towers/', { params }),
  getById: (id) => api.get(`/towers/${id}/`),
  getByProject: (projectId) => api.get('/towers/', { params: { project: projectId } }),
}

export const flatsAPI = {
  getAll: (params) => api.get('/flats/', { params }),
  getById: (id) => api.get(`/flats/${id}/`),
  getByTower: (towerId) => api.get('/flats/', { params: { tower: towerId } }),
  getByTowerAndFloor: (towerId, floor) => api.get('/flats/', { params: { tower: towerId, floor } }),
}

export const clientsAPI = {
  getAll: () => api.get('/clients/'),
}

export const reviewsAPI = {
  getAll: () => api.get('/reviews/'),
  getFeatured: () => api.get('/reviews/featured/'),
}

export const blogAPI = {
  getAll: (params) => api.get('/blog/', { params }),
  getBySlug: (slug) => api.get(`/blog/${slug}/`),
}

export const contactAPI = {
  create: (data) => api.post('/contact/', data),
}

export const achievementsAPI = {
  getAll: () => api.get('/achievements/'),
}

export const authAPI = {
  // User auth (OTP based)
  sendOTP: (data) => api.post('/auth/send-otp/', data),
  verifyOTP: (data) => api.post('/auth/verify-otp/', data),
  completeRegistration: (data) => api.post('/auth/complete-registration/', data),
  // Admin auth (username/password)
  adminLogin: (data) => api.post('/admin/login/', data),
}

export const adminAPI = {
  // Leads
  getLeadsStats: () => api.get('/admin/leads/stats/'),
  getLeadsList: (params) => api.get('/admin/leads/', { params }),
  markLeadRead: (leadId) => api.post(`/admin/leads/${leadId}/read/`),
  
  // Projects
  getProjects: (params) => api.get('/projects/', { params }),
  getProject: (id) => api.get(`/projects/${id}/`),
  createProject: (data) => api.post('/projects/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProject: (id, data) => api.patch(`/projects/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProject: (id) => api.delete(`/projects/${id}/`),
  
  // Project Images
  createProjectImage: (data) => api.post('/project-images/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProjectImage: (id, data) => api.patch(`/project-images/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProjectImage: (id) => api.delete(`/project-images/${id}/`),
  
  // Project Amenities
  createProjectAmenity: (data) => api.post('/project-amenities/', data),
  updateProjectAmenity: (id, data) => api.patch(`/project-amenities/${id}/`, data),
  deleteProjectAmenity: (id) => api.delete(`/project-amenities/${id}/`),
  
  // Cities
  getCities: () => api.get('/cities/'),
  createCity: (data) => api.post('/cities/', data),
  updateCity: (id, data) => api.patch(`/cities/${id}/`, data),
  deleteCity: (id) => api.delete(`/cities/${id}/`),
  
  // Clients
  getClients: () => api.get('/clients/'),
  createClient: (data) => api.post('/clients/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateClient: (id, data) => api.patch(`/clients/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteClient: (id) => api.delete(`/clients/${id}/`),
  
  // Reviews
  getReviews: () => api.get('/reviews/'),
  createReview: (data) => api.post('/reviews/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateReview: (id, data) => api.patch(`/reviews/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteReview: (id) => api.delete(`/reviews/${id}/`),
  
  // Blog Posts
  getBlogPosts: (params) => api.get('/blog/', { params }),
  getBlogPost: (slug) => api.get(`/blog/${slug}/`),
  createBlogPost: (data) => api.post('/blog/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateBlogPost: (slug, data) => api.patch(`/blog/${slug}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteBlogPost: (slug) => api.delete(`/blog/${slug}/`),
  
  // Achievements
  getAchievements: () => api.get('/achievements/'),
  createAchievement: (data) => api.post('/achievements/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateAchievement: (id, data) => api.patch(`/achievements/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAchievement: (id) => api.delete(`/achievements/${id}/`),
  
  // Towers
  getTowers: (params) => api.get('/towers/', { params }),
  getTower: (id) => api.get(`/towers/${id}/`),
  createTower: (data) => api.post('/towers/', data),
  updateTower: (id, data) => api.patch(`/towers/${id}/`, data),
  deleteTower: (id) => api.delete(`/towers/${id}/`),
  
  // Flats
  getFlats: (params) => api.get('/flats/', { params }),
  getFlat: (id) => api.get(`/flats/${id}/`),
  createFlat: (data) => api.post('/flats/', data),
  updateFlat: (id, data) => api.patch(`/flats/${id}/`, data),
  deleteFlat: (id) => api.delete(`/flats/${id}/`),
  
  // Project Images
  getProjectImages: (params) => api.get('/project-images/', { params }),
  createProjectImage: (data) => api.post('/project-images/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProjectImage: (id, data) => api.patch(`/project-images/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProjectImage: (id) => api.delete(`/project-images/${id}/`),
  
  // Project Amenities
  getProjectAmenities: (params) => api.get('/project-amenities/', { params }),
  createProjectAmenity: (data) => api.post('/project-amenities/', data),
  updateProjectAmenity: (id, data) => api.patch(`/project-amenities/${id}/`, data),
  deleteProjectAmenity: (id) => api.delete(`/project-amenities/${id}/`),
  
  // Tower Amenities
  getTowerAmenities: (params) => api.get('/tower-amenities/', { params }),
  createTowerAmenity: (data) => api.post('/tower-amenities/', data),
  updateTowerAmenity: (id, data) => api.patch(`/tower-amenities/${id}/`, data),
  deleteTowerAmenity: (id) => api.delete(`/tower-amenities/${id}/`),
  
  // Contacts
  getContacts: () => api.get('/contact/'),
  getContact: (id) => api.get(`/contact/${id}/`),
  deleteContact: (id) => api.delete(`/contact/${id}/`),
}

export default api

