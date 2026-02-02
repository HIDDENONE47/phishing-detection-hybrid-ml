import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import ScanHistory from '../models/ScanHistory';
import fetch from 'node-fetch';

const router = express.Router();

interface EmailPhishingCheckResult {
  isPhishing: boolean;
  confidence: number;
  features: {
    [key: string]: boolean | number | string;
  };
  explanation: string[];
}

// Helper function to analyze email content
// Helper function to analyze email content using heuristics (for explanation purposes)
const analyzeEmailHeuristics = (content: string): EmailPhishingCheckResult => {
  const features: { [key: string]: boolean | number | string } = {};
  const explanation: string[] = [];

  // Check for common phishing phrases
  const phishingPhrases = [
    'urgent action required',
    'verify your account',
    'account suspended',
    'unusual activity',
    'security alert',
    'click here',
    'confirm your identity',
    'update your information',
    'payment pending',
    'won prize'
  ];

  features.containsPhishingPhrases = phishingPhrases.some(phrase =>
    content.toLowerCase().includes(phrase.toLowerCase())
  );

  if (features.containsPhishingPhrases) {
    explanation.push('The email contains common phishing phrases');
  }

  // Check for URLs in content
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = content.match(urlRegex) || [];
  features.containsUrls = urls.length > 0;

  if (features.containsUrls) {
    explanation.push('The email contains URLs that could be suspicious');
  }

  // Check for urgency indicators
  const urgencyWords = ['urgent', 'immediate', 'now', 'critical', 'important'];
  features.containsUrgency = urgencyWords.some(word =>
    content.toLowerCase().includes(word.toLowerCase())
  );

  if (features.containsUrgency) {
    explanation.push('The email creates a sense of urgency');
  }

  // Check for requests for sensitive information
  const sensitiveWords = ['password', 'credit card', 'ssn', 'social security', 'bank account'];
  features.requestsSensitiveInfo = sensitiveWords.some(word =>
    content.toLowerCase().includes(word.toLowerCase())
  );

  if (features.requestsSensitiveInfo) {
    explanation.push('The email requests sensitive information');
  }

  // Check for poor grammar and spelling
  // This is a simple check - in production you'd want to use a proper spell checker
  const commonMisspellings = ['acount', 'verifcation', 'informations', 'secuirty'];
  features.hasPoorGrammar = commonMisspellings.some(word =>
    content.toLowerCase().includes(word.toLowerCase())
  );

  if (features.hasPoorGrammar) {
    explanation.push('The email contains spelling errors or poor grammar');
  }

  // Calculate confidence score (heuristic based)
  let riskScore = 0;
  if (features.containsPhishingPhrases) riskScore += 0.3;
  if (features.containsUrls) riskScore += 0.1;
  if (features.containsUrgency) riskScore += 0.2;
  if (features.requestsSensitiveInfo) riskScore += 0.3;
  if (features.hasPoorGrammar) riskScore += 0.1;

  return {
    isPhishing: riskScore > 0.5,
    confidence: Math.min(riskScore, 1) * 100,
    features,
    explanation
  };
};

type ModelAnalysisResult =
  | { modelUsed: true; isPhishing: boolean; confidence: number }
  | { modelUsed: false; error?: any };

// Helper function to analyze email using Flask AI model API
async function analyzeEmailWithModel(emailText: string): Promise<ModelAnalysisResult> {
  try {
    const response = await fetch("http://127.0.0.1:8000/predict_email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_text: emailText }),
    });

    if (!response.ok) {
      throw new Error(`Flask API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      isPhishing: data.prediction === 1 || data.label === "Phishing Email",
      confidence: data.confidence ? data.confidence * 100 : 95, // Convert 0-1 to 0-100%
      modelUsed: true
    };
  } catch (error) {
    console.error("Flask email analysis error:", error);
    return {
      modelUsed: false,
      error
    };
  }
}

// Email Analysis endpoint
router.post(
  '/analyze',
  authenticateToken,
  [
    body('emailContent').isString().notEmpty().withMessage('Email content is required'),
    body('subject').optional().isString(),
    body('sender').optional().isEmail(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { emailContent, subject, sender } = req.body;
      const userId = req.user?.userId; // Use optional chaining and correct property name

      // 1. Run local heuristics (always needed for explanations)
      const heuristicAnalysis = analyzeEmailHeuristics(emailContent);

      // 2. Run AI Model analysis
      const modelAnalysis = await analyzeEmailWithModel(emailContent);

      // 3. Determine final result
      let finalIsPhishing = heuristicAnalysis.isPhishing;
      let finalConfidence = heuristicAnalysis.confidence;
      let source = "Heuristics";

      // If model succeeded, override the verdict with the model's result
      if (modelAnalysis.modelUsed) {
        finalIsPhishing = modelAnalysis.isPhishing;
        finalConfidence = modelAnalysis.confidence as number;
        source = "Flask AI Model";
      } else {
        // If model failed, we stick with heuristics but maybe warn?
        console.warn("Falling back to email heuristics due to model failure");
      }

      // Save scan to history
      const scanRecord = new ScanHistory({
        userId,
        type: 'email',
        content: emailContent.substring(0, 200) + (emailContent.length > 200 ? '...' : ''),
        result: {
          isPhishing: finalIsPhishing,
          confidence: finalConfidence,
          features: {
            ...heuristicAnalysis.features,
            source,
            modelAvailable: modelAnalysis.modelUsed
          }
        }
      });

      await scanRecord.save();

      res.json({
        isPhishing: finalIsPhishing,
        confidence: finalConfidence,
        features: heuristicAnalysis.features,
        explanation: heuristicAnalysis.explanation,
        source: source,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Email Analysis error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get email scan history for a user
router.get(
  '/history',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId; // Use optional chaining and correct property name
      const scans = await ScanHistory.find({
        userId,
        type: 'email'
      }).sort({ createdAt: -1 }).limit(20);

      res.json({ scans });
    } catch (error) {
      console.error('History fetch error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Admin endpoint to get all email scans
router.get(
  '/all-scans',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const scans = await ScanHistory.find({
        type: 'email'
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

export default router;

