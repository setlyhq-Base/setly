import { Router, Request, Response } from 'express';
import { dbService } from '../services/database.service';
import { authRateLimit } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authRateLimit);

/**
 * GET /api/users/:userId
 * Get user profile
 */
router.get('/:userId', async (req: Request, res: Response, next) => {
  try {
    const { userId } = req.params;
    const user = await dbService.getUserById(userId);

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users
 * Create user profile
 */
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const userData = req.body;
    const user = await dbService.createUser(userData);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/:userId
 * Update user profile
 */
router.put('/:userId', async (req: Request, res: Response, next) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = await dbService.updateUser(userId, updates);

    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:userId/saved
 * Get user's saved items (rooms, rides, marketplace)
 */
router.get('/:userId/saved', async (req: Request, res: Response, next) => {
  try {
    const { userId } = req.params;
    const savedItems = await dbService.getSavedItems(userId);

    res.json(savedItems);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/:userId/saved/rooms/:roomId
 * Save a room
 */
router.post('/:userId/saved/rooms/:roomId', async (req: Request, res: Response, next) => {
  try {
    const { userId, roomId } = req.params;
    await dbService.saveRoom(userId, roomId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/:userId/saved/rooms/:roomId
 * Unsave a room
 */
router.delete('/:userId/saved/rooms/:roomId', async (req: Request, res: Response, next) => {
  try {
    const { userId, roomId } = req.params;
    await dbService.unsaveRoom(userId, roomId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/:userId/saved/rides/:rideId
 * Save a ride
 */
router.post('/:userId/saved/rides/:rideId', async (req: Request, res: Response, next) => {
  try {
    const { userId, rideId } = req.params;
    await dbService.saveRide(userId, rideId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/:userId/saved/rides/:rideId
 * Unsave a ride
 */
router.delete('/:userId/saved/rides/:rideId', async (req: Request, res: Response, next) => {
  try {
    const { userId, rideId } = req.params;
    await dbService.unsaveRide(userId, rideId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/:userId/saved/marketplace/:itemId
 * Save a marketplace item
 */
router.post('/:userId/saved/marketplace/:itemId', async (req: Request, res: Response, next) => {
  try {
    const { userId, itemId } = req.params;
    await dbService.saveMarketplaceItem(userId, itemId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/:userId/saved/marketplace/:itemId
 * Unsave a marketplace item
 */
router.delete('/:userId/saved/marketplace/:itemId', async (req: Request, res: Response, next) => {
  try {
    const { userId, itemId } = req.params;
    await dbService.unsaveMarketplaceItem(userId, itemId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
