import express from 'express';
import {
  handleCreateSeat,
  handleDeleteSeat,
  handleGetSeat,
  handleUpdateSeat,
} from "../controllers/seatController.js";
import validateSchema from '../middlewares/validate.js';
import { SeatCreateSchema } from '../schemas/index.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', validateSchema(SeatCreateSchema), handleCreateSeat);
router.get('/', handleGetSeat);
router.patch('/update', handleUpdateSeat);
router.delete('/delete',authenticate, handleDeleteSeat);

export default router;