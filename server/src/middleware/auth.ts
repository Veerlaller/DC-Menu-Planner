import { Request, Response, NextFunction } from 'express';

/**
 * Simple authentication middleware
 * Reads x-user-id header and validates it exists
 * In production, this would verify JWT tokens
 */
export function requireUserId(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'] as string;

  if (!userId || userId.trim() === '') {
    return res.status(401).json({
      error: 'Missing user id',
      details: 'Please provide x-user-id header',
    });
  }

  // Attach userId to request object for downstream handlers
  (req as any).userId = userId;
  next();
}

/**
 * Type guard to safely access userId from request
 */
export function getUserId(req: Request): string {
  return (req as any).userId;
}

