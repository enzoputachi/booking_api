import routeRouter from './routeRoute.js'
import userRouter from './userRoute.js';
import busRouter from './busRoute.js';
import tripRouter from './tripRoute.js';
import seatRouter from './seatRouter.js';
import express from 'express';

const router = express.Router();

router.use('/users',  userRouter);
router.use('/buses', busRouter);
router.use('/routes', routeRouter);
router.use('/trips', tripRouter);
router.use('/seats', seatRouter);

export default router;