import { Router, Request, Response } from 'express';
import { dbService } from '../services/database.service';
import { authRateLimit } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authRateLimit);

/**
 * GET /api/marketplace
 * Search marketplace items with filters
 */
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { category, minPrice, maxPrice, searchTerm } = req.query;

    const filters = {
      category: category as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      searchTerm: searchTerm as string
    };

    const items = await dbService.searchMarketplaceItems(filters);

    res.json({ count: items.length, items });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/marketplace/:itemId
 * Get marketplace item by ID
 */
router.get('/:itemId', async (req: Request, res: Response, next) => {
  try {
    const { itemId } = req.params;
    const item = await dbService.getMarketplaceItemById(itemId);

    if (!item) {
      throw new AppError(404, 'Item not found');
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/marketplace
 * Create a new marketplace listing
 */
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const itemData = req.body;
    const item = await dbService.createMarketplaceItem(itemData);

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

export default router;
