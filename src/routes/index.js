import routeRouter from './routeRoute.js'
import userRouter from './userRoute.js';
import busRouter from './busRoute.js';
import tripRouter from './tripRoute.js';
import seatRouter from './seatRouter.js';
import bookingRouter from './bookingRoute.js';
import paymentRoute from './paymentRoute.js'
import settingsRouter from './settingsRoute.js';
import express from 'express';
import dashboardStatsRouter from './dashboardStatsRoute.js';


const router = express.Router();

router.use('/users',  userRouter);
router.use('/buses', busRouter);
router.use('/routes', routeRouter);
router.use('/trips', tripRouter);
router.use('/seats', seatRouter);
router.use('/bookings', bookingRouter)
router.use('/payments', paymentRoute)
router.use('/companySettings', settingsRouter)
router.use('dashboardStats', dashboardStatsRouter)

export default router;