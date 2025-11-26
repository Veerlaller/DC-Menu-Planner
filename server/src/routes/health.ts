import { Router, Request, Response } from 'express';
import { testDatabaseConnection } from '../lib/supabase.js';

const router = Router();

/**
 * Basic health check endpoint
 * Returns server status and uptime
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Database health check endpoint
 * Tests Supabase connection and returns status
 */
router.get('/db-health', async (req: Request, res: Response) => {
  try {
    await testDatabaseConnection();
    
    res.status(200).json({
      status: 'ok',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

