import serverless from 'serverless-http';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Route imports
import exploreRoutes from './routes/explore.routes';
import uploadRoutes from './routes/upload.routes';
import roomsRoutes from './routes/rooms.routes';
import ridesRoutes from './routes/rides.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import usersRoutes from './routes/users.routes';
import conversationsRoutes from './routes/conversations.routes';

const app = express();

// Security & CORS
app.use(helmet());
app.use(cors({
  origin: [
    'https://setly.in',
    'https://stage.setly.in',
    'https://dev.setly.in',
    'http://localhost:4200'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check - lightweight, no DB required
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    stage: process.env.STAGE || 'unknown',
    region: process.env.AWS_REGION || 'unknown',
    timestamp: new Date().toISOString() 
  });
});

// Root redirect
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Setly API',
    health: '/api/health',
    stage: process.env.STAGE || 'unknown'
  });
});

// API Routes
app.use('/api/explore', exploreRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/conversations', conversationsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Wrap serverless handler with try-catch
const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  try {
    return await serverlessHandler(event, context);
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

// Export app for local development
export default app;
