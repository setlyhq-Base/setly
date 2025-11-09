import express from 'express';
import cors from 'cors';
import uploadsRouter from './routes/uploads.routes';
import { authMiddleware } from './middleware/auth.middleware';
import './config/firebase';  // Initialize Firebase

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
  credentials: true
}));
app.use(express.json());

// Protected Routes
app.use('/api/uploads', authMiddleware, uploadsRouter);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});