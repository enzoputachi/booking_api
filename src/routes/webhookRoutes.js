import express from 'express';
import { handlePaystackWebhook } from '../controllers/paystackWebhookController.js';

const router = express.Router();

router.post('/webhook', handlePaystackWebhook);

export default router;