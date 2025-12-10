import { Router, Request, Response } from 'express';
import { dbService } from '../services/database.service';
import { authRateLimit } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authRateLimit);

/**
 * GET /api/rides
 * Search rides with filters
 */
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { pickupCity, dropoffCity, rideDate } = req.query;

    const filters = {
      pickupCity: pickupCity as string,
      dropoffCity: dropoffCity as string,
      rideDate: rideDate ? new Date(rideDate as string) : undefined
    };

    const rides = await dbService.searchRides(filters);

    res.json({ count: rides.length, rides });
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
