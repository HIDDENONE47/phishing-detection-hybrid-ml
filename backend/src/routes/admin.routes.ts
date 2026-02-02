import express, { Request, Response } from 'express';
import { auth, isAdmin } from '../middleware/auth';
import User from '../models/User';
import URLScan from '../models/URLScan';
import EmailScan from '../models/EmailScan';
import ScanHistory from '../models/ScanHistory';

const router = express.Router();

// Get all users
router.get('/users', auth, isAdmin, async (req: Request, res: Response) => {
  try {
    console.log('Admin users route accessed');
    const users = await User.find().select('-password');
    console.log(`Found ${users.length} users`);
    
    // Map users to the format expected by frontend
    const usersData = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      scans: 0, // Will be updated below if needed
      lastActive: user.createdAt.toISOString().split('T')[0] // Default to creation date
    }));
    
    console.log('Sending users data:', { users: usersData });
    res.json({ users: usersData });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent scans
router.get('/recent-scans', auth, isAdmin, async (req: Request, res: Response) => {
  try {
    // Get recent URL scans
    const urlScans = await URLScan.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name');
      
    // Get recent email scans
    const emailScans = await EmailScan.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name');
      
    // Combine and sort by date
    const combinedScans = [
      ...urlScans.map((scan: any) => ({
        id: scan._id,
        userId: scan.userId._id,
        userName: scan.userId.name,
        type: 'URL',
        target: scan.url,
        result: scan.isPhishing ? 'Phishing' : 'Safe',
        date: scan.createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
        createdAt: scan.createdAt
      })),
      ...emailScans.map((scan: any) => ({
        id: scan._id,
        userId: scan.userId._id,
        userName: scan.userId.name,
        type: 'Email',
        target: scan.subject || scan.from,
        result: scan.isPhishing ? 'Phishing' : 'Safe',
        date: scan.createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
        createdAt: scan.createdAt
      }))
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
     .slice(0, 10);
    
    res.json({ scans: combinedScans });
  } catch (error) {
    console.error('Error fetching recent scans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific user
router.get('/users/:userId', auth, isAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password').select('+role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a user
router.put('/users/:userId', auth, isAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, email, role } = req.body;
    
    // Validate input
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const user = await User.findById(userId).select('+role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    user.name = name;
    user.email = email;
    user.role = role;
    
    await user.save();
    
    res.json({ 
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user
router.delete('/users/:userId', auth, isAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting yourself
    if (user._id.toString() === req.user?.userId?.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Don't allow deleting another admin
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'You cannot delete another administrator' });
    }
    
    // Delete user's scans
    await URLScan.deleteMany({ userId });
    await EmailScan.deleteMany({ userId });
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;








