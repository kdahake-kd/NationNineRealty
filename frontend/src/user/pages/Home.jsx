import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { citiesAPI, projectsAPI, reviewsAPI, blogAPI, achievementsAPI, clientsAPI } from '../../services/api'
import { getImageUrl, getPlaceholderImage, handleImageError } from '../../utils/imageUtils'
import './Home.css'

const Home = () => {
  const [projects, setProjects] = useState([])
  const [featuredProjects, setFeaturedProjects] = useState([])
  const [trendingProjects, setTrendingProjects] = useState([])
  const [hotThisWeekProjects, setHotThisWeekProjects] = useState([])
  const [reviews, setReviews] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  // Statistics model removed
  // const [statistics, setStatistics] = useState([])
  const [achievements, setAchievements] = useState([])
  const [cities, setCities] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [cardSliderIndex, setCardSliderIndex] = useState(0)
  const [citySliderIndex, setCitySliderIndex] = useState(0)
  const [trendingSliderIndex, setTrendingSliderIndex] = useState(0)
  const [faqOpenIndex, setFaqOpenIndex] = useState(null)
  
  // Search form state
  const [searchForm, setSearchForm] = useState({
    city: '',
    search: '',
    flat_type: '',
    possession_year: '',
    project_status: ''
  })
  
  const [trendingSearch, setTrendingSearch] = useState('')
  const [hotSearch, setHotSearch] = useState('')
  
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
  
  // FAQ Data
  const faqs = [
    {
      question: "What types of properties does NationNineRealty offer?",
      answer: "We offer residential and commercial properties including apartments, villas, plots, and commercial spaces across prime locations."
    },
    {
      question: "How can I schedule a property visit?",
      answer: "You can schedule a property visit by contacting us through our contact form, calling our helpline, or visiting our office. Our team will arrange a convenient time for you."
    },
    {
      question: "What is the booking process?",
      answer: "The booking process involves selecting your property, submitting required documents, paying the booking amount, and completing the necessary paperwork. Our team will guide you through each step."
    },
    {
      question: "Do you provide home loans assistance?",
      answer: "Yes, we have tie-ups with leading banks and financial institutions to help you get the best home loan deals. Our team will assist you with the loan application process."
    },
    {
      question: "What are the payment plans available?",
      answer: "We offer flexible payment plans including construction-linked plans, down payment options, and easy EMI schemes. Our team will explain all available options based on your requirements."
    }
  ]
  
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

  useEffect(() => {
    fetchData()
  }, [])

  // Card slider auto-rotate
  useEffect(() => {
    if (featuredProjects.length > 4) {
      const interval = setInterval(() => {
        setCardSliderIndex((prev) => {
          const maxIndex = Math.ceil(featuredProjects.length / 4) - 1
          return (prev + 1) % (maxIndex + 1)
        })
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [featuredProjects])
  
  // City slider auto-rotate
  useEffect(() => {
    if (cities.length > 4) {
      const interval = setInterval(() => {
        setCitySliderIndex((prev) => {
          const maxIndex = Math.ceil(cities.length / 4) - 1
          return (prev + 1) % (maxIndex + 1)
        })
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [cities])
  
  // Trending slider auto-rotate
  useEffect(() => {
    if (trendingProjects.length > 4) {
      const interval = setInterval(() => {
        setTrendingSliderIndex((prev) => {
          const maxIndex = Math.ceil(trendingProjects.length / 4) - 1
          return (prev + 1) % (maxIndex + 1)
        })
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [trendingProjects])

  const fetchData = async () => {
    try {
      const [projectsRes, featuredRes, hotRes, reviewsRes, blogRes, achievementsRes, citiesRes, clientsRes] = await Promise.all([
        projectsAPI.getAll({ limit: 8 }),
        projectsAPI.getAll({ featured: true }),
        projectsAPI.getAll({ is_hot: true }),
        reviewsAPI.getFeatured(),
        blogAPI.getAll({ limit: 3 }),
        achievementsAPI.getAll(),
        citiesAPI.getAll(),
        clientsAPI.getAll()
      ])
      
      const allProjects = projectsRes.data.results || projectsRes.data
      setProjects(allProjects.slice(0, 6))
      setFeaturedProjects(featuredRes.data.results || featuredRes.data)
      // Trending = most recently added (sorted by created_at)
      const sortedByDate = [...allProjects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setTrendingProjects(sortedByDate.slice(0, 8))
      // Hot This Week = projects with is_hot=true or most viewed
      const hotProjects = (hotRes.data.results || hotRes.data)
      const mostViewed = [...allProjects].sort((a, b) => (b.views || 0) - (a.views || 0))
      setHotThisWeekProjects(hotProjects.length > 0 ? hotProjects.slice(0, 8) : mostViewed.slice(0, 8))
      setReviews(reviewsRes.data)
      setBlogPosts(blogRes.data.results || blogRes.data.slice(0, 3))
      // setStatistics(statsRes.data.results || statsRes.data) // Statistics model removed
      setAchievements(achievementsRes.data.results || achievementsRes.data)
      setCities(citiesRes.data.results || citiesRes.data)
      setClients(clientsRes.data.results || clientsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchForm.city) params.append('city_id', searchForm.city)
    if (searchForm.search) params.append('search', searchForm.search)
    if (searchForm.flat_type) params.append('flat_type', searchForm.flat_type)
    if (searchForm.possession_year) params.append('possession_year', searchForm.possession_year)
    if (searchForm.project_status) params.append('project_status', searchForm.project_status)
    
    window.location.href = `/projects?${params.toString()}`
  }
  
  const handleTrendingSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (trendingSearch) params.append('search', trendingSearch)
    window.location.href = `/projects?${params.toString()}`
  }
  
  const handleHotSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (hotSearch) params.append('search', hotSearch)
    window.location.href = `/projects?${params.toString()}`
  }
  
  const toggleFaq = (index) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index)
  }
  
  const totalSlides = Math.ceil(featuredProjects.length / 4)
  const cityTotalSlides = Math.ceil(cities.length / 4)

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="home">
      {/* Hero Section with Headline */}
      <section className="hero-cards-section">
        <div className="container">
          <h1 className="hero-headline">Buy Your Dream Home With NationNineRealty</h1>
          
          {/* Search Section Above Slider */}
          <div className="search-section-above-slider">
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-row">
                <select
                  value={searchForm.city}
                  onChange={(e) => setSearchForm({ ...searchForm, city: e.target.value })}
                  className="search-input"
                >
                  <option value="">Location</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Project Name"
                  value={searchForm.search}
                  onChange={(e) => setSearchForm({ ...searchForm, search: e.target.value })}
                  className="search-input"
                />
                
                <select
                  value={searchForm.flat_type}
                  onChange={(e) => setSearchForm({ ...searchForm, flat_type: e.target.value })}
                  className="search-input"
                >
                  <option value="">Flat Type</option>
                  {flatTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                
                <select
                  value={searchForm.possession_year}
                  onChange={(e) => setSearchForm({ ...searchForm, possession_year: e.target.value })}
                  className="search-input"
                >
                  <option value="">Possession Year</option>
                  {possessionYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                
                <select
                  value={searchForm.project_status}
                  onChange={(e) => setSearchForm({ ...searchForm, project_status: e.target.value })}
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
          
          {/* Card Slider */}
          <div className="card-slider-container">
            <div className="card-slider-wrapper">
              <div 
                className="card-slider-track"
                style={{
                  transform: `translateX(-${cardSliderIndex * 100}%)`
                }}
              >
                {featuredProjects.map((project) => (
                  <div key={project.id} className="card-slide-item">
                    <Link
                      to={`/projects/${project.id}`}
                      className="hero-card"
                    >
                      <div className="hero-card-image">
                        <img 
                          src={getImageUrl(project.cover_image_url) || getPlaceholderImage()} 
                          alt={project.title}
                          onError={handleImageError}
                        />
                      </div>
                      <div className="hero-card-content">
                        <div className="hero-card-price">
                          {formatPrice(project.price)}
                        </div>
                        <h3 className="hero-card-title">{project.title}</h3>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows */}
            {featuredProjects.length > 4 && (
              <>
                <button
                  className="card-slider-nav card-slider-prev"
                  onClick={() => setCardSliderIndex((prev) => (prev - 1 + totalSlides) % totalSlides)}
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  className="card-slider-nav card-slider-next"
                  onClick={() => setCardSliderIndex((prev) => (prev + 1) % totalSlides)}
                  aria-label="Next"
                >
                  ›
                </button>
              </>
            )}
            
            {/* Dots Navigation */}
            {featuredProjects.length > 4 && (
              <div className="card-slider-dots">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    className={index === cardSliderIndex ? 'active' : ''}
                    onClick={() => setCardSliderIndex(index)}
                  />
                ))}
              </div>
            )}
            
            {/* Explore All Properties Button */}
            <div className="explore-all-container">
              <Link to="/projects" className="btn btn-primary explore-all-btn">
                Explore All Properties →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Properties Section */}
      <section className="trending-properties-section section">
        <div className="container">
          <div className="section-header-with-search">
            <h2 className="section-title">Trending Properties</h2>
            <form className="inline-search-form" onSubmit={handleTrendingSearch}>
              <input
                type="text"
                placeholder="Search projects..."
                value={trendingSearch}
                onChange={(e) => setTrendingSearch(e.target.value)}
                className="inline-search-input"
              />
              <button type="submit" className="btn btn-secondary">Search</button>
            </form>
            <Link to="/projects" className="btn btn-primary view-all-btn">View All</Link>
          </div>
          
          {/* Trending Properties Slider */}
          <div className="trending-slider-container">
            <div className="trending-slider-wrapper">
              <div 
                className="trending-slider-track"
                style={{
                  transform: `translateX(-${trendingSliderIndex * 100}%)`
                }}
              >
                {trendingProjects.map((project) => (
                  <div key={project.id} className="trending-slide-item">
                    <Link to={`/projects/${project.id}`} className="trending-project-card">
                      <div className="trending-project-image">
                        <img 
                          src={getImageUrl(project.cover_image_url) || getPlaceholderImage()} 
                          alt={project.title}
                          onError={handleImageError}
                        />
                      </div>
                      <div className="trending-project-content">
                        <div className="trending-project-price">{formatPrice(project.price)}</div>
                        <h3>{project.title}</h3>
                        <p>{project.location}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows */}
            {trendingProjects.length > 4 && (
              <>
                <button
                  className="trending-slider-nav trending-slider-prev"
                  onClick={() => {
                    const maxIndex = Math.ceil(trendingProjects.length / 4) - 1
                    setTrendingSliderIndex((prev) => (prev - 1 + maxIndex + 1) % (maxIndex + 1))
                  }}
                >
                  ‹
                </button>
                <button
                  className="trending-slider-nav trending-slider-next"
                  onClick={() => {
                    const maxIndex = Math.ceil(trendingProjects.length / 4) - 1
                    setTrendingSliderIndex((prev) => (prev + 1) % (maxIndex + 1))
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Hot This Week Section */}
      <section className="hot-this-week-section">
        <div className="hot-background-effect"></div>
        <div className="container">
          <div className="section-header-with-search">
            <h2 className="section-title">Hot This Week</h2>
            <form className="inline-search-form" onSubmit={handleHotSearch}>
              <input
                type="text"
                placeholder="Search projects..."
                value={hotSearch}
                onChange={(e) => setHotSearch(e.target.value)}
                className="inline-search-input"
              />
              <button type="submit" className="btn btn-secondary">Search</button>
            </form>
            <Link to="/projects" className="btn btn-primary view-all-btn">View All</Link>
          </div>
          
          <div className="hot-projects-grid">
            {hotThisWeekProjects.slice(0, 4).map((project, index) => (
              <div 
                key={project.id} 
                className="hot-project-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link to={`/projects/${project.id}`}>
                  <div className="hot-project-image">
                    <img 
                      src={getImageUrl(project.cover_image_url) || getPlaceholderImage()} 
                      alt={project.title}
                      onError={handleImageError}
                    />
                    <div className="hot-badge">🔥 Hot</div>
                  </div>
                  <div className="hot-project-content">
                    <div className="hot-project-price">{formatPrice(project.price)}</div>
                    <h3>{project.title}</h3>
                    <p>{project.location}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Find Properties in Cities Section */}
      <section className="cities-section section">
        <div className="container">
          <h2 className="section-title">Find Properties in Cities</h2>
          
          <div className="city-slider-container">
            <div className="city-slider-wrapper">
              <div 
                className="city-slider-track"
                style={{
                  transform: `translateX(-${citySliderIndex * 100}%)`
                }}
              >
                {cities.map((city) => (
                  <div key={city.id} className="city-slide-item">
                    <Link to={`/projects?city_id=${city.id}`} className="city-card">
                      <div className="city-card-content">
                        <h3>{city.name}</h3>
                        <p>{city.state}</p>
                        <span className="city-link">Explore →</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            {cities.length > 4 && (
              <>
                <button
                  className="city-slider-nav city-slider-prev"
                  onClick={() => setCitySliderIndex((prev) => (prev - 1 + cityTotalSlides) % cityTotalSlides)}
                >
                  ‹
                </button>
                <button
                  className="city-slider-nav city-slider-next"
                  onClick={() => setCitySliderIndex((prev) => (prev + 1) % cityTotalSlides)}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-section section">
        <div className="container">
          <h2 className="section-title">Why Choose Us</h2>
          <div className="why-content">
            <div className="why-text">
              <h3>Inspiration comes of working every day</h3>
              <p>
                We dream big & believe in transparency. A fantasy to assemble not simply homes, 
                but rather ways of life. A fantasy to make coordinated workspaces and to give 
                neighborliness plated lavishness. Our loom is centered on arranged improvement & 
                making esteem resources for the city.
              </p>
              <div className="why-features">
                <div className="why-feature">
                  <span className="feature-icon">✓</span>
                  <span>Transparent Pricing</span>
                </div>
                <div className="why-feature">
                  <span className="feature-icon">✓</span>
                  <span>Expert Guidance</span>
                </div>
                <div className="why-feature">
                  <span className="feature-icon">✓</span>
                  <span>Prime Locations</span>
                </div>
                <div className="why-feature">
                  <span className="feature-icon">✓</span>
                  <span>Quality Assurance</span>
                </div>
              </div>
              <Link to="/about" className="btn btn-primary">Read More</Link>
            </div>
            <div className="why-image">
              <div className="animated-image"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <section className="partners-section section">
        <div className="container">
          <h2 className="section-title">Our Partners</h2>
          <div className="partners-grid">
            {clients.map((client) => (
              <div key={client.id} className="partner-card">
                {client.logo_url && (
                  <img 
                    src={getImageUrl(client.logo_url) || getPlaceholderImage()} 
                    alt={client.name}
                    onError={handleImageError}
                  />
                )}
                <h4>{client.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section section">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-container">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className={`faq-question ${faqOpenIndex === index ? 'open' : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">{faqOpenIndex === index ? '−' : '+'}</span>
                </button>
                {faqOpenIndex === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="home-contact-section section">
        <div className="container">
          <div className="contact-box">
            <h2>Get in Touch</h2>
            <p>Have questions? We're here to help you find your dream property.</p>
            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
