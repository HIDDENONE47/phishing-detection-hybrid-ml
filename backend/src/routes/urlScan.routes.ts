import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import ScanHistory from '../models/ScanHistory';
import fetch from 'node-fetch';

const router = express.Router();

// URL Analysis endpoint
router.post(
  '/analyze',
  authenticateToken,
  [
    body('url').isURL().withMessage('Please provide a valid URL'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { url } = req.body;
      const userId = req.user?.userId; // Use optional chaining and correct property name

      // Basic phishing detection logic
      const isPhishing = await analyzeUrl(url);
      
      // Save scan to history (including adversarial threat info)
      const scanRecord = new ScanHistory({
        userId,
        type: 'url',
        content: url,
        result: {
          isPhishing: isPhishing.isPhishing,
          confidence: isPhishing.confidence,
          features: isPhishing.features,
          adversarialThreat: isPhishing.adversarialThreat
        }
      });
      
      await scanRecord.save();

      res.json({
        url,
        ...isPhishing,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('URL Analysis error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get scan history for a user
router.get(
  '/history',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId; // Use optional chaining and correct property name
      const scans = await ScanHistory.find({ 
        userId, 
        type: 'url' 
      }).sort({ createdAt: -1 }).limit(20);
      
      res.json({ scans });
    } catch (error) {
      console.error('History fetch error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Admin endpoint to get all URL scans
router.get(
  '/all-scans',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const scans = await ScanHistory.find({ 
        type: 'url' 
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'email name');
      
      res.json({ scans });
    } catch (error) {
      console.error('Admin scans fetch error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Helper function to analyze URLs
// Helper function to analyze URLs using Flask AI model API
async function analyzeUrl(url: string) {
  try {
    // Send the URL to your Flask model API
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Flask API error: ${response.status}`);
    }

    const data = await response.json();

    // Interpret Flask model response
    const isPhishing =
      data.prediction === 1 ||
      data.label?.toLowerCase() === "phishing" ||
      data.result === "phishing";

    // Extract adversarial threat information (integrated in same response)
    const adversarialThreat = data.adversarial_threat || {
      is_adversarial: false,
      anomaly_score: 0.0,
      risk_level: "Low",
      message: null
    };

    return {
      isPhishing,
      confidence: data.confidence || 95, // Use Flask's confidence if available
      features: {
        label: data.label,
        prediction: data.prediction,
        source: "Flask AI Model",
      },
      adversarialThreat: {
        isAdversarial: adversarialThreat.is_adversarial || false,
        anomalyScore: adversarialThreat.anomaly_score || 0.0,
        riskLevel: adversarialThreat.risk_level || "Low",
        message: adversarialThreat.message || null
      }
    };
  } catch (error) {
    console.error("Flask analysis error:", error);

    // Fallback if Flask model is unavailable
    return {
      isPhishing: false,
      confidence: 0,
      features: { error: "Flask model not reachable" },
      adversarialThreat: {
        isAdversarial: false,
        anomalyScore: 0.0,
        riskLevel: "Low",
        message: "Flask model not reachable"
      }
    };
  }
}

export default router; 

