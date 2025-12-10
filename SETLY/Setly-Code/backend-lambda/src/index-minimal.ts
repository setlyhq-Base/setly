import serverless from 'serverless-http';
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

// Simple health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    stage: process.env.STAGE || 'unknown',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Setly API - Minimal', health: '/api/health' });
});

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  try {
    console.log('Incoming event:', JSON.stringify(event));
    return await serverlessHandler(event, context);
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export default app;
