import React from 'react';

interface ReportProps {
  scanType: 'url' | 'email';
  result: {
    isPhishing: boolean;
    confidence: number;
    details: string[];
    timestamp: string;
  };
}

const Report: React.FC<ReportProps> = ({ scanType, result }) => {
  return (
    <div className="report">
      <h2>Scan Report</h2>
      <div className="report-content">
        <div className="result-summary">
          <h3>Result: {result.isPhishing ? 'Phishing Detected' : 'Safe'}</h3>
          <p>Confidence: {result.confidence}%</p>
          <p>Scan Type: {scanType.toUpperCase()}</p>
          <p>Timestamp: {result.timestamp}</p>
        </div>
        <div className="details">
          <h3>Details</h3>
          <ul>
            {result.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Report; 