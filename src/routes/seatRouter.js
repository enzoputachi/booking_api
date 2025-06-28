import express from 'express';
import {
  handleCreateSeat,
  handleDeleteSeat,
  handleGetSeat,
  handleUpdateSeat,
} from "../controllers/seatController.js";
import validateSchema from '../middlewares/validate.js';
import { SeatCreateSchema } from '../schemas/index.js';

const router = express.Router();

router.post('/', validateSchema(SeatCreateSchema), handleCreateSeat);
router.get('/', handleGetSeat);
router.patch('/', handleUpdateSeat);
router.delete('/', handleDeleteSeat);

export default router;