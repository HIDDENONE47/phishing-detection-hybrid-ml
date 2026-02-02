import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="brand-icon">🛡️</span>
          <span className="brand-text">Phishing Detection</span>
        </div>
        <div className="nav-links">
          <Link to="/app/url-scan" className="nav-link">
            <span className="nav-icon">🔗</span>
            URL Analysis
          </Link>
          <Link to="/app/email-scan" className="nav-link">
            <span className="nav-icon">📧</span>
            Email Analysis
          </Link>
          <Link to="/app/dashboard" className="nav-link">
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          <Link to="/app/reports" className="nav-link">
            <span className="nav-icon">📋</span>
            Reports
          </Link>
          <div className="nav-buttons">
            <Link to="/login" className="nav-link">
              <span className="nav-icon">👤</span>
              Login
            </Link>
            <Link to="/login" className="nav-button">
              Get Started
              <span className="button-icon">→</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="about-content">
        <section className="about-hero">
          <div className="about-hero-content">
            <h1>About Us</h1>
            <p className="about-subtitle">
              We're on a mission to make the digital world safer through advanced AI-powered security solutions.
            </p>
          </div>
        </section>

        <section className="mission-section">
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p>
              At Phishing Detection, we're committed to protecting individuals and organizations from sophisticated cyber threats. 
              Our hybrid machine learning system provides real-time protection against phishing attempts, ensuring your digital assets remain secure.
            </p>
            <div className="mission-stats">
              <div className="mission-stat">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Protected Users</span>
              </div>
              <div className="mission-stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Detection Rate</span>
              </div>
              <div className="mission-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Protection</span>
              </div>
            </div>
          </div>
        </section>

        <section className="team-section">
          <h2>Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-image">
                <img src="/team/ceo.jpg" alt="CEO" />
              </div>
              <h3>John Smith</h3>
              <p className="member-role">CEO & Co-founder</p>
              <p className="member-bio">
                Former security researcher with 15+ years of experience in cybersecurity and machine learning.
              </p>
            </div>
            <div className="team-member">
              <div className="member-image">
                <img src="/team/cto.jpg" alt="CTO" />
              </div>
              <h3>Sarah Johnson</h3>
              <p className="member-role">CTO & Co-founder</p>
              <p className="member-bio">
                Expert in AI and ML with a focus on security applications and threat detection.
              </p>
            </div>
            <div className="team-member">
              <div className="member-image">
                <img src="/team/lead-dev.jpg" alt="Lead Developer" />
              </div>
              <h3>Michael Chen</h3>
              <p className="member-role">Lead Developer</p>
              <p className="member-bio">
                Full-stack developer specializing in secure application development and system architecture.
              </p>
            </div>
          </div>
        </section>

        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🔒</div>
              <h3>Security First</h3>
              <p>We prioritize the security and privacy of our users above all else.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤖</div>
              <h3>Innovation</h3>
              <p>Constantly evolving our technology to stay ahead of emerging threats.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Trust</h3>
              <p>Building long-term relationships based on transparency and reliability.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Impact</h3>
              <p>Making the digital world safer for everyone through accessible security solutions.</p>
            </div>
          </div>
        </section>

        <section className="certifications-section">
          <h2>Our Certifications</h2>
          <div className="certifications-grid">
            <div className="certification">
              <img src="/certifications/iso27001.png" alt="ISO 27001" />
              <h3>ISO 27001</h3>
              <p>Information Security Management</p>
            </div>
            <div className="certification">
              <img src="/certifications/soc2.png" alt="SOC 2" />
              <h3>SOC 2</h3>
              <p>Security, Availability, and Confidentiality</p>
            </div>
            <div className="certification">
              <img src="/certifications/gdpr.png" alt="GDPR" />
              <h3>GDPR Compliant</h3>
              <p>Data Protection & Privacy</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>Join Our Mission</h2>
            <p>Be part of the solution in making the digital world safer for everyone.</p>
            <Link to="/login" className="cta-button">
              Get Started Now
              <span className="button-icon">→</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand-icon">🛡️</span>
            <span className="brand-text">Phishing Detection</span>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/security">Security</Link>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <Link to="/about">About</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/careers">Careers</Link>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <Link to="/documentation">Documentation</Link>
              <Link to="/support">Support</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Phishing Detection. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage; 