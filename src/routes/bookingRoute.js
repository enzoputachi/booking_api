import express from 'express';
import { handleCreateBookingDraft, handleListBookings } from '../controllers/bookingController.js';


const router = express.Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new draft booking
 *     tags:
 *       - Bookings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tripId
 *               - seatId
 *               - passengerName
 *               - nextOfKinName
 *               - nextOfKinPhone
 *               - email
 *               - mobile
 *             properties:
 *               tripId:
 *                 type: integer
 *                 example: 101
 *               seatId:
 *                 type: integer
 *                 example: 23
 *               passengerTitle:
 *                 type: string
 *                 example: "Mr"
 *               passengerName:
 *                 type: string
 *                 example: "John Doe"
 *               passengerAge:
 *                 type: integer
 *                 example: 30
 *               nextOfKinName:
 *                 type: string
 *                 example: "Jane Doe"
 *               nextOfKinPhone:
 *                 type: string
 *                 example: "+2348012345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               mobile:
 *                 type: string
 *                 example: "+2348012345678"
 *               referrer:
 *                 type: string
 *                 example: "https://ads.partner.com"
 *               sessionId:
 *                 type: string
 *                 example: "session-abc-123"
 *               deviceFingerprint:
 *                 type: string
 *                 example: "device-xyz-456"
 *     responses:
 *       201:
 *         description: Draft booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookingToken:
 *                   type: string
 *                   description: Unique token to access booking
 *                   example: "9a2b0fe3eae34417a9c712abc1234567"
 *                 status:
 *                   type: string
 *                   example: "DRAFT"
 *       400:
 *         description: Bad request (missing or invalid parameters)
 *       500:
 *         description: Internal server error
 */
router.post('/', handleCreateBookingDraft);

router.get('/', handleListBookings)


export default router;