import express from 'express';
import { authenticateToken } from '../middleware/auth';
import reportController from '../controllers/report.controller';

const router = express.Router();

// Get report statistics
router.get('/stats', authenticateToken, reportController.getStats);

// Download PDF report
router.get('/download', authenticateToken, reportController.downloadReport);

// Download Single Scan PDF
router.get('/download/:scanId', authenticateToken, reportController.downloadSingleReport);

// Get recent scan history
router.get('/history', authenticateToken, reportController.getHistory);

export default router;
