import React from 'react'
import './About.css'

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <h1>About NationNineRealty</h1>
          <p>Your trusted real estate partner</p>
        </div>
      </section>

      <section className="about-content section">
        <div className="container">
          <div className="about-main">
            <h2>Inspiration comes of working every day</h2>
            <p>
              We dream big & believe in transparency. A fantasy to assemble not simply homes, 
              but rather ways of life. A fantasy to make coordinated workspaces and to give 
              neighborliness plated lavishness. Our loom is centered on arranged improvement & 
              making esteem resources for the city.
            </p>
            <p>
              Our homes are surrounded by the most contemporary facilities, enclosed in utter 
              harmony and located in the part of comfort unidentified in this sector before. 
              We know the street ahead is long and energizing. We have numerous more developments 
              to set up.
            </p>
            <p>
              Be that as it may, each turning point takes us back to where our story started: 
              a dream, a fantasy. Prepare to inhabit the latest landmark.
            </p>
          </div>

          <div className="about-values">
            <div className="value-card">
              <div className="value-icon">🏠</div>
              <h3>Quality Homes</h3>
              <p>We deliver premium quality residential and commercial properties</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Transparency</h3>
              <p>Complete transparency in all our dealings and transactions</p>
            </div>
            <div className="value-card">
              <div className="value-icon">⭐</div>
              <h3>Customer Satisfaction</h3>
              <p>Our customers' satisfaction is our top priority</p>
            </div>
            <div className="value-card">
              <div className="value-icon">📍</div>
              <h3>Prime Locations</h3>
              <p>Properties in the most sought-after locations</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About

