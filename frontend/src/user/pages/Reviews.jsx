import React, { useState, useEffect } from 'react'
import { reviewsAPI } from '../../services/api'
import './Reviews.css'

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getAll()
      setReviews(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading reviews...</div>
  }

  return (
    <div className="reviews-page">
      <section className="reviews-hero">
        <div className="container">
          <h1>Customer Reviews</h1>
          <p>What's Our Customer Say</p>
        </div>
      </section>

      <section className="reviews-list section">
        <div className="container">
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-rating">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
                <p className="review-text">"{review.review_text}"</p>
                <div className="review-author">
                  <h4>{review.customer_name}</h4>
                  <p>{review.designation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Reviews

