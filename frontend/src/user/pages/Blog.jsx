import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogAPI } from '../../services/api'
import { getImageUrl, getPlaceholderImage, handleImageError } from '../../utils/imageUtils'
import './Blog.css'

const Blog = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await blogAPI.getAll()
      setPosts(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading blog posts...</div>
  }

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="container">
          <h1>Blog</h1>
          <p>Latest Blog & Posts</p>
        </div>
      </section>

      <section className="blog-list section">
        <div className="container">
          <div className="blog-grid">
            {posts.map((post) => (
              <div key={post.id} className="blog-card">
                <div className="blog-image">
                  <img 
                    src={getImageUrl(post.featured_image_url) || getPlaceholderImage()} 
                    alt={post.title}
                    onError={handleImageError}
                  />
                  <div className="blog-date">
                    {new Date(post.created_at).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <span>{post.author}</span>
                    <span>{post.category}</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`} className="read-more">
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Blog

