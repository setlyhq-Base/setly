// Local development server (before AWS deployment)
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { connectToDatabase } from './db/connection';

// Route imports
import exploreRoutes from './routes/explore.routes';
import uploadRoutes from './routes/upload.routes';
import roomsRoutes from './routes/rooms.routes';
import ridesRoutes from './routes/rides.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import usersRoutes from './routes/users.routes';
import conversationsRoutes from './routes/conversations.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Security & CORS
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://localhost:3000',
    'https://setly.in',
    'https://stage.setly.in',
    'https://dev.setly.in'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    stage: process.env.STAGE || 'local',
    timestamp: new Date().toISOString(),
    mongodb: process.env.MONGODB_URI ? 'configured' : 'not configured'
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
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      console.log('✓ MongoDB connected successfully');
    } else {
      console.warn('⚠️  MongoDB URI not configured - database features will not work');
      console.warn('   Create a .env file with MONGODB_URI to enable database');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Setly Backend Server`);
      console.log(`================================`);
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
      console.log(`✓ S3 Bucket: ${process.env.S3_BUCKET_NAME || 'Not configured'}`);
      console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
      console.log(`================================\n`);
      console.log(`Ready to accept requests!`);
      console.log(`Frontend should proxy to: http://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
