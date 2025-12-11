import { Router, Request, Response } from 'express';
import { dbService } from '../services/database.service';
import { authRateLimit } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authRateLimit);

/**
 * GET /api/rides
 * Search rides with filters
 * 
 * Query params:
 * - pickupCity: Filter by pickup location city
 * - dropoffCity: Filter by dropoff location city
 * - rideDate: Filter by ride date (ISO format)
 * - tag: Filter by tag (nearby, today, shared, airport, top-rated)
 * - includeFallback: Whether to include fallback sample data (default: true)
 */
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { pickupCity, dropoffCity, rideDate, tag, includeFallback } = req.query;

    const filters = {
      pickupCity: pickupCity as string,
      dropoffCity: dropoffCity as string,
      rideDate: rideDate ? new Date(rideDate as string) : undefined,
      tag: tag as string,
      includeFallback: includeFallback === 'false' ? false : true, // Default to true
    };

    const rides = await dbService.searchRides(filters);

    res.json({ 
      count: rides.length, 
      rides,
      hasFallback: rides.some((r: any) => r.isFallback),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rides/:rideId
 * Get ride by ID
 */
router.get('/:rideId', async (req: Request, res: Response, next) => {
  try {
    const { rideId } = req.params;
    const ride = await dbService.getRideById(rideId);

    if (!ride) {
      throw new AppError(404, 'Ride not found');
    }

    res.json(ride);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/rides
 * Create a new ride listing
 */
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const rideData = req.body;
    const ride = await dbService.createRide(rideData);

    res.status(201).json(ride);
  } catch (error) {
    next(error);
  }
});

export default router;
