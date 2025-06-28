import express from 'express';
import { handleGetDashboardStats } from '../controllers/dashboardStatsController.js';
const router = express.Router();

/**
 * @swagger
 * /api/dashboardStats:
 *   get:
 *     summary: Retrieve admin dashboard statistics
 *     description: |
 *       Returns key metrics for the admin dashboard:
 *       - totalBookings: total number of bookings  
 *       - newThisMonth / newLastMonth: booking counts for current and previous month  
 *       - bookingGrowth: percentage change in bookings month‑over‑month  
 *       - activeTrips: count of scheduled trips departing in the future  
 *       - pendingBookings: count of bookings with status PENDING  
 *       - monthlyRevenue: sum of paid payments this month  
 *       - revenueGrowth: percentage change in revenue month‑over‑month  
 *       - tripGrowth: percentage change in scheduled trips month‑over‑month
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBookings:
 *                   type: integer
 *                   example: 2345
 *                 newThisMonth:
 *                   type: integer
 *                   example: 120
 *                 newLastMonth:
 *                   type: integer
 *                   example: 100
 *                 bookingGrowth:
 *                   type: integer
 *                   description: Percent change current vs last month
 *                   example: 20
 *                 activeTrips:
 *                   type: integer
 *                   example: 48
 *                 pendingBookings:
 *                   type: integer
 *                   example: 124
 *                 monthlyRevenue:
 *                   type: number
 *                   example: 1345200
 *                 revenueGrowth:
 *                   type: integer
 *                   example: 18
 *                 tripGrowth:
 *                   type: integer
 *                   example: 5
 *       500:
 *         description: Internal server error
 */
router.get('/', handleGetDashboardStats);

export default router;
