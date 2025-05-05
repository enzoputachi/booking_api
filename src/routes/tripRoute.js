import express from 'express';
import {
  handleCreateTrip,
  handleDeleteTrip,
  handleGetTrip,
  handleUpdateTrip,
} from "../controllers/tripController.js";
import validateSchema from '../middilewares/validate.js';
import { TripCreateSchema } from '../schemas/index.js';

const router = express.Router()

router.post('/', validateSchema(TripCreateSchema), handleCreateTrip);
router.get('/', handleGetTrip);
router.patch('/', handleUpdateTrip);
router.delete('/', handleDeleteTrip)

export default router;