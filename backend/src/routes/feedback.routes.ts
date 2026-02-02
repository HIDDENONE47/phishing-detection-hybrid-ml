import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { auth, isAdmin } from '../middleware/auth'; // Assuming auth and isAdmin middleware exist
import Feedback from '../models/Feedback';

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private (requires authentication)
router.post(
  '/',
  auth,
  [
    body('feedback').notEmpty().withMessage('Feedback cannot be empty'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { feedback } = req.body;
    const userId = req.user?.userId; // Assuming user ID is attached to req.user by auth middleware

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
      const newFeedback = new Feedback({
        user: userId,
        feedback,
      });

      await newFeedback.save();
      res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/feedback
// @desc    Get all feedback (Admin only)
// @access  Private (requires admin)
router.get('/', auth, isAdmin, async (req: Request, res: Response) => {
  try {
    const feedbackList = await Feedback.find().populate('user', 'name email');
    res.json({ feedback: feedbackList });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback/my
// @desc    Get feedback submitted by the current user
// @access  Private (requires authentication)
router.get('/my', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId; // Assuming user ID is attached to req.user by auth middleware

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userFeedback = await Feedback.find({ user: userId }).populate('user', 'name email');
    res.json({ feedback: userFeedback });
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/feedback/:feedbackId/reply
// @desc    Reply to feedback (Admin only)
// @access  Private (requires admin)
router.put(
  '/:feedbackId/reply',
  auth,
  isAdmin,
  [
    body('adminReply').notEmpty().withMessage('Reply cannot be empty'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { feedbackId } = req.params;
    const { adminReply } = req.body;

    try {
      const feedbackItem = await Feedback.findById(feedbackId);

      if (!feedbackItem) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      feedbackItem.adminReply = adminReply;
      feedbackItem.status = 'replied';
      feedbackItem.repliedAt = new Date();

      await feedbackItem.save();
      res.json({ message: 'Reply sent successfully', feedback: feedbackItem });
    } catch (error) {
      console.error('Error sending reply:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/feedback/:feedbackId/close
// @desc    Close feedback (Admin only)
// @access  Private (requires admin)
router.put('/:feedbackId/close', auth, isAdmin, async (req: Request, res: Response) => {
  const { feedbackId } = req.params;

  try {
    const feedbackItem = await Feedback.findById(feedbackId);

    if (!feedbackItem) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedbackItem.status = 'closed';

    await feedbackItem.save();
    res.json({ message: 'Feedback closed successfully', feedback: feedbackItem });
  } catch (error) {
    console.error('Error closing feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 