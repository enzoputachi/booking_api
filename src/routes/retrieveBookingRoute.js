import express from 'express';
import { handleRetrieveBooking } from '../controllers/retrieveBookingController.js';
const router = express.Router();

router.get('/', handleRetrieveBooking)

export default router;