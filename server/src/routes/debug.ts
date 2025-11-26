import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

/**
 * Debug endpoint: Get first 5 dining halls
 * Tests database connectivity and returns sample data
 */
router.get('/debug/halls', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('dining_halls')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error fetching dining halls:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch dining halls',
        error: error.message,
      });
    }

    res.status(200).json({
      status: 'ok',
      count: data?.length || 0,
      data: data,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

