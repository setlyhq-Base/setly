import { Router, Request, Response } from 'express';
import { dbService } from '../services/database.service';
import { authRateLimit } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authRateLimit);

/**
 * GET /api/conversations/user/:userId
 * Get all conversations for a user
 */
router.get('/user/:userId', async (req: Request, res: Response, next) => {
  try {
    const { userId } = req.params;
    const conversations = await dbService.getConversationsByUser(userId);

    res.json({ count: conversations.length, conversations });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/conversations/:conversationId
 * Get a specific conversation with all messages
 */
router.get('/:conversationId', async (req: Request, res: Response, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await dbService.getConversationById(conversationId);

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/conversations
 * Create a new conversation
 */
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const { participants, listingId, listingType, listingTitle, listingImage } = req.body;

    if (!participants || participants.length < 2) {
      throw new AppError(400, 'At least 2 participants required');
    }

    const conversation = await dbService.createConversation({
      participants,
      listingId,
      listingType,
      listingTitle,
      listingImage,
    });

    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/conversations/:conversationId/messages
 * Send a message in a conversation
 */
router.post('/:conversationId/messages', async (req: Request, res: Response, next) => {
  try {
    const { conversationId } = req.params;
    const { senderId, text } = req.body;

    if (!senderId || !text) {
      throw new AppError(400, 'senderId and text are required');
    }

    const message = await dbService.sendMessage(conversationId, senderId, text);

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/conversations/:conversationId/read
 * Mark all messages in a conversation as read for a user
 */
router.put('/:conversationId/read', async (req: Request, res: Response, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      throw new AppError(400, 'userId is required');
    }

    await dbService.markConversationAsRead(conversationId, userId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/conversations/:conversationId
 * Delete a conversation
 */
router.delete('/:conversationId', async (req: Request, res: Response, next) => {
  try {
    const { conversationId } = req.params;
    await dbService.deleteConversation(conversationId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
