import { Router, Request, Response } from 'express';
import { dbService } from '../services/database.service';
import { authRateLimit } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authRateLimit);

/**
 * GET /api/rooms
 * Search rooms with filters
 */
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { city, minPrice, maxPrice, roomType } = req.query;

    const filters = {
      city: city as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      roomType: roomType as string
    };

    const rooms = await dbService.searchRooms(filters);

    res.json({ count: rooms.length, rooms });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rooms/:roomId
 * Get room by ID
 */
router.get('/:roomId', async (req: Request, res: Response, next) => {
  try {
    const { roomId } = req.params;
    const room = await dbService.getRoomById(roomId);

    if (!room) {
      throw new AppError(404, 'Room not found');
    }

    res.json(room);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/rooms
 * Create a new room listing
 */
router.post('/', async (req: Request, res: Response, next) => {
  try {
    // TODO: Add authentication middleware to get userId
    const roomData = req.body;

    const room = await dbService.createRoom(roomData);

    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/rooms/:roomId
 * Update room listing
 */
router.put('/:roomId', async (req: Request, res: Response, next) => {
  try {
    const { roomId } = req.params;
    const updates = req.body;

    const room = await dbService.updateRoom(roomId, updates);

    res.json(room);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/rooms/:roomId
 * Delete room listing
 */
router.delete('/:roomId', async (req: Request, res: Response, next) => {
  try {
    const { roomId } = req.params;

    await dbService.deleteRoom(roomId);

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
