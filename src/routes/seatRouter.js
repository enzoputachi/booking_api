import express from 'express';
import {
  handleCreateSeat,
  handleDeleteSeat,
  handleGetSeat,
  handleUpdateSeat,
} from "../controllers/seatController.js";

const router = express.Router();

router.post('/', handleCreateSeat);
router.get('/', handleGetSeat);
router.patch('/', handleUpdateSeat);
router.delete('/', handleDeleteSeat);

export default router;