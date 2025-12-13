import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { contactAPI, projectsAPI, authAPI } from '../../services/api'
import './Contact.css'

const Contact = () => {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project')
  
  const [step, setStep] = useState(1) // 1: form, 2: OTP
  const [projects, setProjects] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    project: projectId || ''
  })
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll()
      setProjects(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (!formData.name || !formData.phone || !formData.subject || !formData.message) {
      setError('Please fill all required fields')
      setSubmitting(false)
      return
    }

    try {
      await authAPI.sendOTP({
        mobile: formData.phone,
        purpose: 'contact'
      })
      setStep(2)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send OTP. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyAndSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Verify OTP first
      await authAPI.verifyOTP({
        mobile: formData.phone,
        otp_code: otp,
        purpose: 'contact'
      })

      // Submit contact form
      await contactAPI.create({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        project: formData.project || null
      })
      
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        project: ''
      })
      setOtp('')
      setStep(1)
    } catch (error) {
      setError(error.response?.data?.error || 'Error submitting form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Get in touch with us</p>
        </div>
      </section>

      <section className="contact-content section">
        <div className="container">
          <div className="contact-wrapper">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p>
                We're here to help you find your dream property. Contact us for more information 
                about our projects and services.
              </p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon">📍</div>
                  <div>
                    <h3>Address</h3>
                    <p>Elms Court Flat No 2, Parmar Park Phase 2, Wanwadi, Pune</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">📧</div>
                  <div>
                    <h3>Email</h3>
                    <p>sales@nationninerealty.in</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div>
                    <h3>Phone</h3>
                    <p>+91 9890005411 | +91 8668356445</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              {submitted && (
                <div className="success-message">
                  Thank you for contacting us! We'll get back to you soon.
                </div>
              )}
              
              {error && <div className="error-message">{error}</div>}
              
              {step === 1 ? (
                <form className="contact-form" onSubmit={handleSendOTP}>
                  <div className="form-group">
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name *"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email (Optional)"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Your Mobile Number *"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{10}"
                      maxLength="10"
                    />
                  </div>
                  
                  <div className="form-group">
                    <select
                      name="project"
                      value={formData.project}
                      onChange={handleChange}
                    >
                      <option value="">Select Project (Optional)</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject *"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <textarea
                      name="message"
                      placeholder="Description *"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form className="contact-form" onSubmit={handleVerifyAndSubmit}>
                  <p className="otp-info">OTP has been sent to {formData.phone}</p>
                  
                  <div className="form-group">
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value)
                        setError('')
                      }}
                      required
                      maxLength="6"
                      pattern="[0-9]{6}"
                    />
                  </div>
                  
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Verify & Submit'}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setStep(1)}
                    disabled={submitting}
                  >
                    Back
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact

