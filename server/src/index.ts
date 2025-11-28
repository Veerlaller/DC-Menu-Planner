import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.js';
import debugRoutes from './routes/debug.js';
import onboardingRoutes from './routes/onboarding.js';
import todayRoutes from './routes/today.js';
import menusRoutes from './routes/menus.js';
import recommendationsRoutes from './routes/recommendations.js';
import mealsRoutes from './routes/meals.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/', healthRoutes);
app.use('/', debugRoutes);
app.use('/api', onboardingRoutes);
app.use('/api', todayRoutes);
app.use('/api/menus', menusRoutes);
app.use('/api', recommendationsRoutes);
app.use('/api/meals', mealsRoutes);

/**
 * 404 handler for undefined routes
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path,
  });
});

/**
 * Global error handler
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

/**
 * Start the Express server
 */
app.listen(PORT, () => {
  console.log('🚀 DC Menu Planner API Server');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`💾 DB health check: http://localhost:${PORT}/db-health`);
  console.log('---');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

