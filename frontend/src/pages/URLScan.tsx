import React, { useState } from 'react';
import '../styles/URLScan.css';
import api from '../services/api';

interface AdversarialThreat {
  isAdversarial: boolean;
  anomalyScore: number;
  riskLevel: string;
  message?: string | null;
}

interface ScanResult {
  isPhishing: boolean;
  label: string;
  confidence: number;
  adversarialThreat?: AdversarialThreat;
}

const URLScan: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  setScanResult(null);

  try {
    const response = await api.post('/scan/url/analyze', { url });
    const result = response.data;

    // Store full result including adversarial threat info
    setScanResult({
      isPhishing: result.isPhishing || false,
      label: result.label || (result.isPhishing ? 'Phishing' : 'Safe'),
      confidence: result.confidence || 0,
      adversarialThreat: result.adversarialThreat || {
        isAdversarial: false,
        anomalyScore: 0,
        riskLevel: 'Low'
      }
    });
  } catch (err) {
    console.error('Error scanning URL:', err);
    setError('Failed to scan URL. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="url-scan-page">
      <div className="scan-header">
        <h1>URL Scanner</h1>
        <p className="subtitle">Check if a URL is safe before visiting</p>
      </div>

      <div className="scan-container">
        <form onSubmit={handleSubmit} className="scan-form">
          <div className="input-group">
            <div className="url-input-wrapper">
              <span className="url-icon">🔗</span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL to scan (e.g., https://example.com)"
                required
                className="url-input"
              />
            </div>
            <button 
              type="submit" 
              className={`scan-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Scanning...
                </>
              ) : (
                'Scan URL'
              )}
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        {scanResult && (
          <div className="scan-result">
            {/* Main Classification Result */}
            <div className={`result-header ${scanResult.isPhishing ? 'phishing' : 'safe'}`}>
              <span className="result-icon">
                {scanResult.isPhishing ? '⚠️' : '✅'}
              </span>
              <h2>
                {scanResult.isPhishing ? 'Phishing URL Detected' : 'URL appears Safe'}
              </h2>
              {scanResult.confidence > 0 && (
                <span className="score-badge">
                  {Math.round(scanResult.confidence * 100)}% confidence
                </span>
              )}
            </div>

            {/* Adversarial Threat Alert (Integrated in same interface) */}
            {scanResult.adversarialThreat && (
              <div className={`adversarial-alert ${scanResult.adversarialThreat.isAdversarial ? 'adversarial-detected' : 'adversarial-safe'}`}>
                <div className="adversarial-header">
                  <span className="adversarial-icon">
                    {scanResult.adversarialThreat.isAdversarial ? '🛡️' : '✓'}
                  </span>
                  <h3>Adversarial Threat Detection</h3>
                </div>
                <div className="adversarial-content">
                  {scanResult.adversarialThreat.isAdversarial ? (
                    <>
                      <p className="adversarial-warning">
                        <strong>⚠️ Adversarial Threat Detected!</strong>
                      </p>
                      <p>
                        This URL exhibits suspicious feature patterns that deviate from both 
                        phishing and legitimate distributions. This may indicate feature-level 
                        manipulations or adversarial attempts to exploit model vulnerabilities.
                      </p>
                      <div className="adversarial-details">
                        <div className="adversarial-detail-item">
                          <span className="detail-label">Risk Level:</span>
                          <span className={`risk-badge risk-${scanResult.adversarialThreat.riskLevel.toLowerCase()}`}>
                            {scanResult.adversarialThreat.riskLevel}
                          </span>
                        </div>
                        <div className="adversarial-detail-item">
                          <span className="detail-label">Anomaly Score:</span>
                          <span className="detail-value">
                            {(scanResult.adversarialThreat.anomalyScore * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="adversarial-safe-message">
                      ✓ No adversarial patterns detected. URL features appear consistent with 
                      normal phishing or legitimate distributions.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Result Details */}
            <div className="result-details">
              <h3>Scan Details</h3>
              <div className="details-grid">
                <div className="detail-card">
                  <span className="detail-icon">🔍</span>
                  <div className="detail-info">
                    <h4>Classification</h4>
                    <p>{scanResult.label}</p>
                  </div>
                </div>
                {scanResult.confidence > 0 && (
                  <div className="detail-card">
                    <span className="detail-icon">📊</span>
                    <div className="detail-info">
                      <h4>Confidence</h4>
                      <p>{Math.round(scanResult.confidence * 100)}%</p>
                    </div>
                  </div>
                )}
                {scanResult.adversarialThreat && (
                  <div className="detail-card">
                    <span className="detail-icon">🛡️</span>
                    <div className="detail-info">
                      <h4>Adversarial Risk</h4>
                      <p>{scanResult.adversarialThreat.riskLevel}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        <div className="scan-tips">
          <h3>Tips for Safe Browsing</h3>
          <ul>
            <li>Always check URLs before clicking, especially in emails</li>
            <li>Look for HTTPS and a valid SSL certificate</li>
            <li>Be cautious of URLs with unusual characters or misspellings</li>
            <li>Use our scanner for any suspicious links</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default URLScan; 
