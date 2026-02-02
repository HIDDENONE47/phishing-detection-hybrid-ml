import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="brand-icon">🛡️</span>
          <span className="brand-text">Phishing Detection</span>
        </div>
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/url-scan" className="nav-link">
            <span className="nav-icon">🔗</span>
            URL Analysis
          </Link>
          <Link to="/email-scan" className="nav-link">
            <span className="nav-icon">📧</span>
            Email Analysis
          </Link>
          <Link to="/dashboard" className="nav-link">
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          <Link to="/reports" className="nav-link">
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

      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">Advanced Security Solution</div>
          <h1>
            <span className="gradient-text">Protect Your Digital World</span>
            <br />
            with AI-Powered Security
          </h1>
          <p className="hero-subtitle">
            Our hybrid machine learning system provides real-time protection against sophisticated phishing attempts, keeping your digital assets secure.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="primary-button">
              Get Started
              <span className="button-icon">→</span>
            </Link>
            <a href="#features" onClick={scrollToFeatures} className="secondary-button">
              Learn More
              <span className="button-icon">↓</span>
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">99.9%</span>
              <span className="stat-label">Detection Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Protection</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Users Protected</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <img src="/security-illustration.svg" alt="Security Illustration" />
          <div className="floating-card card-1">
            <div className="card-icon">🔒</div>
            <div className="card-text">Real-time Protection</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">🤖</div>
            <div className="card-text">AI-Powered</div>
          </div>
        </div>
      </main>

      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Advanced Security Features</h2>
          <p>Comprehensive protection against modern cyber threats</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>URL Scanning</h3>
            <p>Real-time analysis of URLs to detect potential phishing attempts and malicious links</p>
            <ul className="feature-list">
              <li>Domain reputation check</li>
              <li>SSL certificate validation</li>
              <li>Pattern recognition</li>
            </ul>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📧</div>
            <h3>Email Analysis</h3>
            <p>Advanced email content analysis to identify suspicious patterns and phishing attempts</p>
            <ul className="feature-list">
              <li>Header analysis</li>
              <li>Content verification</li>
              <li>Sender authentication</li>
            </ul>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>ML-Powered</h3>
            <p>Hybrid machine learning algorithms for accurate and adaptive threat detection</p>
            <ul className="feature-list">
              <li>Behavioral analysis</li>
              <li>Pattern learning</li>
              <li>Real-time updates</li>
            </ul>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Detailed Reports</h3>
            <p>Comprehensive reports with actionable insights and security recommendations</p>
            <ul className="feature-list">
              <li>Threat analysis</li>
              <li>Risk assessment</li>
              <li>Security score</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple steps to secure your digital presence</p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Input</h3>
            <p>Enter the URL or paste email content you want to analyze</p>
            <div className="step-icon">📝</div>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Analysis</h3>
            <p>Our hybrid ML model processes the input in real-time</p>
            <div className="step-icon">⚡</div>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Results</h3>
            <p>Get detailed analysis and security recommendations</p>
            <div className="step-icon">✅</div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Secure Your Digital World?</h2>
          <p>Join thousands of users who trust our platform for their security needs</p>
          <Link to="/login" className="cta-button">
            Get Started Now
            <span className="button-icon">→</span>
          </Link>
        </div>
      </section>

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

export default LandingPage; 