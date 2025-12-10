import { Router, Request, Response } from 'express';
import { exploreService } from '../services/explore.service';
import { exploreRateLimit } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Apply rate limiting to all explore endpoints
router.use(exploreRateLimit);

/**
 * GET /api/explore/:category
 * Get explore data for a specific category
 */
router.get('/:category', async (req: Request, res: Response, next) => {
  try {
    const { category } = req.params;
    const { lat, lng, city } = req.query;

    if (!lat || !lng) {
      throw new AppError(400, 'Latitude and longitude are required');
    }

    if (!city) {
      throw new AppError(400, 'City name is required');
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new AppError(400, 'Invalid coordinates');
    }

    const validCategories = [
      'trending',
      'restaurants',
      'places',
      'activities',
      'nightlife',
      'outdoor',
      'events'
    ];

    if (!validCategories.includes(category)) {
      throw new AppError(400, `Invalid category: ${category}`);
    }

    const results = await exploreService.getExploreData(
      city as string,
      category,
      latitude,
      longitude
    );

    res.json({
      category,
      city,
      count: results.length,
      results
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/explore/places/autocomplete
 * Search for cities (autocomplete)
 */
router.get('/places/autocomplete', async (req: Request, res: Response, next) => {
  try {
    const { input, types } = req.query;

    if (!input) {
      throw new AppError(400, 'Input query is required');
    }

    const results = await exploreService.searchCities(input as string);

    res.json(results);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/explore/places/details
 * Get place details by place ID
 */
router.get('/places/details', async (req: Request, res: Response, next) => {
  try {
    const { placeId } = req.query;

    if (!placeId) {
      throw new AppError(400, 'placeId is required');
    }

    const result = await exploreService.getPlaceDetails(placeId as string);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
