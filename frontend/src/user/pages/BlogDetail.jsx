import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { blogAPI } from '../../services/api'
import { getImageUrl, getPlaceholderImage, handleImageError } from '../../utils/imageUtils'
import './BlogDetail.css'

const BlogDetail = () => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      const response = await blogAPI.getBySlug(slug)
      setPost(response.data)
    } catch (error) {
      console.error('Error fetching blog post:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading blog post...</div>
  }

  if (!post) {
    return <div className="error">Blog post not found</div>
  }

  return (
    <div className="blog-detail">
      <article className="blog-article">
        {post.featured_image_url && (
          <div className="blog-header-image">
            <img 
              src={getImageUrl(post.featured_image_url) || getPlaceholderImage()} 
              alt={post.title}
              onError={handleImageError}
            />
          </div>
        )}
        
        <div className="container">
          <div className="blog-article-content">
            <div className="blog-meta">
              <span>{post.author}</span>
              <span>{post.category}</span>
              <span>{new Date(post.created_at).toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
              })}</span>
            </div>
            
            <h1>{post.title}</h1>
            
            <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.content }} />
            
            <div className="blog-footer">
              <Link to="/blog" className="btn btn-secondary">
                ← Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

export default BlogDetail

