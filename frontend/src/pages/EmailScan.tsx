import React, { useState } from 'react';
import '../styles/EmailScan.css';
import api from '../services/api';

const EmailScan: React.FC = () => {
  const [emailContent, setEmailContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/scan/email/analyze', { emailContent });
      const result = response.data;
      
      setScanResult({
        status: result.isPhishing ? 'phishing' : 'safe',
        score: result.confidence,
        details: {
          senderVerification: result.features.containsPhishingPhrases ? 'Suspicious' : 'Likely legitimate',
          contentAnalysis: result.explanation.join('. '),
          attachments: 'No attachments analyzed',
          links: result.features.containsUrls ? 'Contains potentially suspicious links' : 'No links detected'
        }
      });
    } catch (err) {
      console.error('Error scanning email:', err);
      setError('Failed to analyze email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="email-scan-page">
      <div className="scan-header">
        <h1>Email Scanner</h1>
        <p className="subtitle">Analyze emails for potential phishing attempts</p>
      </div>

      <div className="scan-container">
        <form onSubmit={handleSubmit} className="scan-form">
          <div className="email-input-wrapper">
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Paste the email content here to analyze..."
              required
              className="email-input"
              rows={8}
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
                Analyzing...
              </>
            ) : (
              'Analyze Email'
            )}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {scanResult && (
          <div className="scan-result">
            <div className={`result-header ${scanResult.status}`}>
              <span className="result-icon">
                {scanResult.status === 'safe' ? '✅' : '⚠️'}
              </span>
              <h2>
                {scanResult.status === 'safe' 
                  ? 'Email appears to be safe' 
                  : 'Potential phishing detected'}
              </h2>
              <div className="score-badge">
                Risk Score: {scanResult.score}%
              </div>
            </div>

            <div className="result-details">
              <h3>Analysis Details</h3>
              <div className="details-grid">
                <div className="detail-card">
                  <span className="detail-icon">📧</span>
                  <div className="detail-info">
                    <h4>Sender Verification</h4>
                    <p>{scanResult.details.senderVerification}</p>
                  </div>
                </div>
                <div className="detail-card">
                  <span className="detail-icon">📝</span>
                  <div className="detail-info">
                    <h4>Content Analysis</h4>
                    <p>{scanResult.details.contentAnalysis}</p>
                  </div>
                </div>
                <div className="detail-card">
                  <span className="detail-icon">📎</span>
                  <div className="detail-info">
                    <h4>Attachments</h4>
                    <p>{scanResult.details.attachments}</p>
                  </div>
                </div>
                <div className="detail-card">
                  <span className="detail-icon">🔗</span>
                  <div className="detail-info">
                    <h4>Links</h4>
                    <p>{scanResult.details.links}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="scan-tips">
          <h3>Email Safety Tips</h3>
          <ul>
            <li>Be cautious of emails requesting personal information</li>
            <li>Check the sender's email address carefully</li>
            <li>Don't click on links or download attachments from unknown senders</li>
            <li>Look for poor grammar and spelling, common in phishing emails</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailScan; 
