import express from 'express';
import { handleRetrieveBooking } from '../controllers/retrieveBookingController.js';
import { handleConfirmBookingByToken } from '../controllers/bookingController.js';
const router = express.Router();

router.get('/', handleRetrieveBooking);
router.get('/confirm', handleConfirmBookingByToken); // Assuming you want to use the same handler for confirmation

export default router;