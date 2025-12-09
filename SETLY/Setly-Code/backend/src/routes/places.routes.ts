import { Router } from 'express';
import { PlacesController } from '../controllers/places.controller';

const router = Router();

// Autocomplete (type-ahead suggestions)
router.get('/autocomplete', PlacesController.autocomplete);
// Place details for selected prediction
router.get('/details', PlacesController.details);
// Fallback text search when autocomplete empty
router.get('/textsearch', PlacesController.textSearch);
// Institution geocode/synthetic endpoint
router.get('/institution', PlacesController.institution);
// Nearby places for Explore page
router.get('/nearby', PlacesController.nearby);

export default router;