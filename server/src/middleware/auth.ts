import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  sub: string; // user_id
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Supabase JWT authentication middleware
 * Verifies JWT tokens from Supabase Auth
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const userId = req.headers['x-user-id'] as string;

  // Support both JWT tokens and simple user ID for backwards compatibility
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      // Verify JWT token
      // In production, use your Supabase JWT secret from dashboard
      const jwtSecret = process.env.SUPABASE_JWT_SECRET || 'your-jwt-secret-here';
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      
      // Attach user info to request
      (req as any).userId = decoded.sub;
      (req as any).user = decoded;
      return next();
    } catch (error) {
      console.error('JWT verification failed:', error);
      return res.status(401).json({
        error: 'Invalid token',
        details: 'Authentication token is invalid or expired',
      });
    }
  } else if (userId && userId.trim() !== '') {
    // Fallback to simple user ID (for testing without auth)
    console.warn('Using x-user-id header (not secure for production)');
    (req as any).userId = userId;
    return next();
  }

  return res.status(401).json({
    error: 'Not authenticated',
    details: 'Please provide a valid Authorization header or x-user-id',
  });
}

// Alias for backwards compatibility
export const requireUserId = requireAuth;

/**
 * Type guard to safely access userId from request
 */
export function getUserId(req: Request): string {
  return (req as any).userId;
}

