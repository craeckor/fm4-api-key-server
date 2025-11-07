import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import config from './config/config.js';
import swaggerSpec from './config/swagger.js';
import db from './database/database.js';
import scraper from './services/scraper.js';
import apiRoutes from './routes/api.js';

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(compression());
app.use(express.json());

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FM4 Program Key Discovery API',
}));

/**
 * @openapi
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Redirects to /api/program-keys
 *     tags:
 *       - System
 *     responses:
 *       302:
 *         description: Redirect to program keys endpoint
 */
app.get('/', (req, res) => {
  res.redirect('/api/program-keys');
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the server is running
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: {
      root: '/',
      programKeys: '/api/program-keys',
      stats: '/api/stats',
      health: '/health',
      apiDocs: '/api-docs'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[Server] Error:`, err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Initialize and start server
async function start() {
  try {
    console.log('='.repeat(60));
    console.log('FM4 Program Key Discovery Server');
    console.log('='.repeat(60));
    
    // Initialize database
    console.log('\n[Init] Initializing database...');
    db.initialize();
    
    // Start scraper
    console.log('[Init] Starting scraper...');
    scraper.start();
    
    // Start Express server
    app.listen(config.port, () => {
      console.log('\n' + '='.repeat(60));
      console.log(`✓ Server running on port ${config.port}`);
      console.log('='.repeat(60));
      console.log(`\nAvailable endpoints:`);
      console.log(`  - Root (redirects):      http://localhost:${config.port}/`);
      console.log(`  - Program Keys:          http://localhost:${config.port}/api/program-keys`);
      console.log(`  - Statistics:            http://localhost:${config.port}/api/stats`);
      console.log(`  - Health Check:          http://localhost:${config.port}/health`);
      console.log(`  - API Documentation:     http://localhost:${config.port}/api-docs`);
      console.log('\n' + '='.repeat(60));
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n[Shutdown] Received SIGINT, shutting down gracefully...');
      scraper.stop();
      db.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n\n[Shutdown] Received SIGTERM, shutting down gracefully...');
      scraper.stop();
      db.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

start();
