import { Router } from 'express';
import { chatHandler, healthHandler, chatStreamHandler } from '../controllers/assistant.controller';

const router = Router();

router.get('/health', healthHandler);
router.post('/chat', chatHandler);
router.post('/chat-stream', chatStreamHandler);

export default router;
