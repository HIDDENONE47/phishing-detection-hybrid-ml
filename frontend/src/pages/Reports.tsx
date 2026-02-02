import React, { useState, useEffect } from 'react';
import '../styles/Reports.css';
import { reportService } from '../services/api';

const Reports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [scanType, setScanType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // State for stats data
  const [stats, setStats] = useState({
    totalScans: 0,
    phishingDetected: 0,
    safeScans: 0,
    averageScore: 0,
    scansByType: [] as { type: string; count: number }[],
  });

  // State for scan history
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [topThreats, setTopThreats] = useState<{ type: string; count: number; percentage: number }[]>([]);

  useEffect(() => {
    fetchReports();
    fetchHistory();
  }, [timeRange, scanType]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      // Fetch 10 recent scans
      const history = await reportService.getScanHistory(10);
      setScanHistory(history);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getStats(timeRange, scanType);

      setStats({
        totalScans: data.totalScans,
        phishingDetected: data.phishingDetected,
        safeScans: data.safeScans,
        averageScore: data.averageScore,
        scansByType: data.scansByType,
      });

      // Calculate simplified threat percentages
      const typeStats = data.scansByType || [];
      const total = data.totalScans || 1; // avoid division by zero

      const newThreats = typeStats.map((item: any) => ({
        type: item.type === 'url' ? 'Suspicious URLs' : 'Phishing Emails',
        count: item.count,
        percentage: Math.round((item.count / total) * 100)
      }));
      setTopThreats(newThreats);

    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleExport = async (scanId: string) => {
    try {
      const response = await reportService.downloadSingleReport(scanId);
      // Use octet-stream to bypass IDM interception
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PhishLens_Scan_${scanId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading single report:', error);
      alert(`Failed to download report: ${error.message}`);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await reportService.downloadReport(timeRange, scanType);

      // Create a blob from the response with octet-stream type
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);

      // Create temporary link and click it
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PhishLens_Report_${timeRange}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Error downloading report:', error);
      alert(`Failed to download report: ${error.message || 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Scan Reports</h1>
        <p className="subtitle">View and analyze your security scan results</p>
      </div>

      <div className="reports-filters">
        <div className="filter-group">
          <label>Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Scan Type</label>
          <select
            value={scanType}
            onChange={(e) => setScanType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Scans</option>
            <option value="url">URL Scans</option>
            <option value="email">Email Scans</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading reports...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total">📊</div>
              <div className="stat-info">
                <h3>Total Scans</h3>
                <p className="stat-value">{stats.totalScans}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon phishing">⚠️</div>
              <div className="stat-info">
                <h3>Phishing Detected</h3>
                <p className="stat-value">{stats.phishingDetected}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon safe">✅</div>
              <div className="stat-info">
                <h3>Safe Scans</h3>
                <p className="stat-value">{stats.safeScans}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon score">🎯</div>
              <div className="stat-info">
                <h3>Average Score</h3>
                <p className="stat-value">{stats.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="threat-analysis" style={{ width: '100%' }}>
            <h2>Scan Distribution</h2>
            <div className="threats-list">
              {topThreats.map((threat, index) => (
                <div key={index} className="threat-item">
                  <div className="threat-info">
                    <h3>{threat.type}</h3>
                    <p>{threat.count} scans</p>
                  </div>
                  <div className="threat-bar">
                    <div
                      className="threat-progress"
                      style={{ width: `${threat.percentage}%` }}
                    />
                    <span className="threat-percentage">{threat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="recent-scans-section" style={{ marginTop: '30px' }}>
            <h2>Recent Scans</h2>
            {loadingHistory ? (
              <div>Loading history...</div>
            ) : scanHistory.length === 0 ? (
              <p>No recent scans found.</p>
            ) : (
              <div className="scans-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {scanHistory.map(scan => (
                  <div key={scan._id} className="scan-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <span style={{
                          textTransform: 'uppercase',
                          fontSize: '0.8em',
                          fontWeight: 'bold',
                          color: '#666',
                          backgroundColor: '#f3f4f6',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>{scan.type}</span>
                        <span style={{ color: '#999', fontSize: '0.9em' }}>
                          {new Date(scan.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontWeight: '500', wordBreak: 'break-all' }}>
                        {scan.content.length > 80 ? scan.content.substring(0, 80) + '...' : scan.content}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{
                        color: scan.result.isPhishing ? '#EF4444' : '#10B981',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        {scan.result.isPhishing ? '⚠️ PHISHING' : '✅ SAFE'}
                        <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
                          ({Math.round(scan.result.confidence)}%)
                        </span>
                      </span>
                      <button
                        onClick={() => handleSingleExport(scan._id)}
                        className="action-button"
                        style={{
                          padding: '8px 12px',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.9em',
                          transition: 'background 0.2s'
                        }}
                        title="Download PDF Report"
                      >
                        📄 PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="export-section">
            <button className="export-button" onClick={handleExport} disabled={exporting}>
              <span className="export-icon">{exporting ? '⏳' : '📥'}</span>
              {exporting ? 'Exporting...' : 'Export Report (PDF)'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;