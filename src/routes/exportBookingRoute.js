import express from 'express';
import { handleExportBookings } from '../controllers/exportBookings.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, handleExportBookings)

export default router;