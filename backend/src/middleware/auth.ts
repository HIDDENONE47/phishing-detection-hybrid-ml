import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

// Extend the Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role?: string;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header or query parameter
    let authHeader = req.header('Authorization');
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else if (req.query.token) {
      token = req.query.token as string;
    }

    // console.log('Auth header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'None');

    if (!token) {
      console.log('No token found in header or query');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   console.log('Invalid or missing Authorization header');
    //   return res.status(401).json({ message: 'No authentication token, access denied' });
    // }

    // const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.log('No token extracted from Authorization header');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    try {
      console.log('Verifying token with secret:', JWT_SECRET ? `Secret exists (${JWT_SECRET.length} chars)` : 'No secret');
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      console.log('Token verified, userId:', decoded.userId);

      // Find user to get role
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('User not found for ID:', decoded.userId);
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('User found:', user.email, 'Role:', user.role);

      // Add user info to request
      req.user = {
        userId: decoded.userId,
        role: user.role
      };

      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    console.log('No user in request');
    return res.status(401).json({ message: 'Authentication required' });
  }

  console.log('Checking admin access, user role:', req.user.role);

  if (req.user.role !== 'admin') {
    console.log('Access denied: not an admin');
    return res.status(403).json({ message: 'Admin access required' });
  }

  console.log('Admin access granted');
  next();
};

export const authenticateToken = auth; // For backward compatibility
export const requireAdmin = isAdmin; // Alias for isAdmin middleware




