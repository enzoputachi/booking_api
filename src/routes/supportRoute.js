import express from 'express';
import handleSupport from '../controllers/handleSupport.js';
const router = express.Router();

router.post('/', handleSupport)

export default router;