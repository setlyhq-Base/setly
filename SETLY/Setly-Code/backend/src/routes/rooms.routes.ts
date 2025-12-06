import express from 'express';
import { RoomsController } from '../controllers/rooms.controller';

const router = express.Router();

router.get('/', RoomsController.list);
router.get('/:id', RoomsController.get);
router.post('/', RoomsController.create);
// Two-step room posting: init -> upload -> publish
router.post('/init', RoomsController.init);
router.post('/:id/publish', RoomsController.publish);

export default router;
