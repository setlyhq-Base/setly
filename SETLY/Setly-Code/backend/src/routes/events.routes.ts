import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';

const router = Router();

// Search for events from Ticketmaster and Eventbrite
router.get('/search', EventsController.search);

export default router;
