import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>NationNineRealty</h3>
            <p>
              We dream big & believe in transparency. A fantasy to assemble not simply homes, 
              but rather ways of life. A fantasy to make coordinated workspaces and to give 
              neighborliness plated lavishness.
            </p>
            <p className="rera">RERA No. A52100039643</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/clients">Clients</Link></li>
              <li><Link to="/reviews">Reviews</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Elms Court Flat No 2, Parmar Park Phase 2, Wanwadi, Pune</p>
            <p>sales@nationninerealty.in</p>
            <p>+91 9890005411 | +91 8668356445</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>Copyright © 2024 NationNineRealty All right reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

