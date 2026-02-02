import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';
import { auth } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get user profile
router.get(
  '/profile',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user?.userId).select('-password');
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update user profile
router.put(
  '/profile',
  authenticateToken,
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, email } = req.body;
      const updateData: { name?: string; email?: string } = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;

      const user = await User.findByIdAndUpdate(
        req.user?.userId,
        { $set: updateData },
        { new: true }
      ).select('-password');

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update user settings (name, email, password)
router.put(
  '/settings',
  auth,
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('currentPassword').optional().notEmpty(),
    body('newPassword').optional().isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { name, email, currentPassword, newPassword } = req.body;
      const userId = (req as any).user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // If changing password, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Set the new password
        user.password = newPassword;
      }

      // Update other fields if provided
      if (name) user.name = name;
      if (email) {
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
          return res.status(400).json({ message: 'Email is already taken' });
        }
        user.email = email;
      }

      await user.save();

      // Return updated user without sensitive data
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error('Settings update error:', error);
      res.status(500).json({ message: 'Server error occurred while updating settings' });
    }
  }
);

// Update notification preferences
router.put(
  '/notifications',
  auth,
  [
    body('emailNotifications').isBoolean(),
    body('scanNotifications').isBoolean(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { emailNotifications, scanNotifications } = req.body;
      const userId = (req as any).user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update notification preferences
      user.notifications = {
        email: emailNotifications,
        scanResults: scanNotifications,
      };

      await user.save();

      res.json({ message: 'Notification preferences updated' });
    } catch (error) {
      console.error('Notification settings update error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update security settings
router.put(
  '/security',
  auth,
  [
    body('twoFactorAuth').isBoolean(),
    body('sessionTimeout').isInt({ min: 5, max: 120 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { twoFactorAuth, sessionTimeout } = req.body;
      const userId = (req as any).user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update security settings
      user.security = {
        twoFactorEnabled: twoFactorAuth,
        sessionTimeout: sessionTimeout,
      };

      await user.save();

      res.json({ message: 'Security settings updated' });
    } catch (error) {
      console.error('Security settings update error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router; 