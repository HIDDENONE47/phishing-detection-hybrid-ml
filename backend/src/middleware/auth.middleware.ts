import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// This should be in your auth middleware file
export interface TokenPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Make sure the middleware attaches the decoded token to req.user
export const auth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers['x-auth-token'] as string || req.header?.('x-auth-token');
    
    if (!token) {
      res.status(401).json({ message: 'No token, authorization denied' });
      return;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
