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

    return res.status(200).json({
      status: 'ok',
      count: data?.length || 0,
      data: data,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Debug endpoint: Check for menu data
 * Returns counts of menu_days and menu_items
 */
router.get('/debug/menu-stats', async (req: Request, res: Response) => {
  try {
    // Count menu days
    const { count: menuDaysCount, error: menuDaysError } = await supabase
      .from('menu_days')
      .select('*', { count: 'exact', head: true });

    // Count menu items
    const { count: menuItemsCount, error: menuItemsError } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true });

    // Get sample menu days
    const { data: sampleMenuDays } = await supabase
      .from('menu_days')
      .select('id, date, meal_type, dining_halls(short_name)')
      .order('date', { ascending: false })
      .limit(5);

    // Get sample menu items
    const { data: sampleMenuItems } = await supabase
      .from('menu_items')
      .select('id, name, menu_days(date, meal_type, dining_halls(short_name))')
      .limit(5);

    return res.status(200).json({
      status: 'ok',
      counts: {
        menu_days: menuDaysCount || 0,
        menu_items: menuItemsCount || 0,
      },
      samples: {
        menu_days: sampleMenuDays || [],
        menu_items: sampleMenuItems || [],
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

