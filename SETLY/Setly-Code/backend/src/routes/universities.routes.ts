import { Router } from 'express';
import { UniversitiesController } from '../controllers/universities.controller';

const router = Router();

// Public endpoints
router.get('/', UniversitiesController.list);
router.get('/search', UniversitiesController.search);

export default router;
