import express from 'express';
import { handleFreeExpired } from '../controllers/freeExpiredSeatsController.js';


const router = express.Router();

router.post('/', handleFreeExpired)

export default router;