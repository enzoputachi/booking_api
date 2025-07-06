import express from 'express';
import { streamTicketPDF } from '../controllers/ticketController.js';

const router = express.Router();

router.get('/:bookingToken', streamTicketPDF);

export default router;