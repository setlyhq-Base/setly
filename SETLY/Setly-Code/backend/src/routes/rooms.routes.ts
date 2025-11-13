import express from 'express';
import { RoomsController } from '../controllers/rooms.controller';

const router = express.Router();

router.get('/', RoomsController.list);
router.get('/:id', RoomsController.get);
router.post('/', RoomsController.create);

export default router;
