import express from 'express';
import { handleAdminCreateBooking, handleConfirmBookingByToken, handleCreateBookingDraft, handleGetBookingByToken, handleListBookings, handleUpdateBooking } from '../controllers/bookingController.js';


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
router.post('/adminCreate', handleAdminCreateBooking)

router.get('/', handleListBookings)

router.get('/confirm', handleConfirmBookingByToken)

router.patch('/', handleUpdateBooking)

/**
 * @swagger
 * /bookings/{bookingToken}:
 *   get:
 *     summary: Get booking by token
 *     description: Retrieve detailed booking information using a unique booking token. This token provides secure, pseudonymous access without requiring authentication.
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: bookingToken
 *         required: true
 *         schema:
 *           type: string
 *         description: A unique booking token used to securely fetch booking details.
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 tripId:
 *                   type: integer
 *                 passengerTitle:
 *                   type: string
 *                   nullable: true
 *                 passengerName:
 *                   type: string
 *                 passengerAddress:
 *                   type: string
 *                 passengerAge:
 *                   type: integer
 *                   nullable: true
 *                 nextOfKinName:
 *                   type: string
 *                 nextOfKinPhone:
 *                   type: string
 *                 email:
 *                   type: string
 *                 mobile:
 *                   type: string
 *                 contactHash:
 *                   type: string
 *                 userAgent:
 *                   type: string
 *                   nullable: true
 *                 ipAddress:
 *                   type: string
 *                   nullable: true
 *                 sessionId:
 *                   type: string
 *                   nullable: true
 *                 referrer:
 *                   type: string
 *                   nullable: true
 *                 deviceFingerprint:
 *                   type: string
 *                   nullable: true
 *                 bookingToken:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [PENDING, CONFIRMED, CANCELLED]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 isSplitPayment:
 *                   type: boolean
 *                 trip:
 *                   $ref: '#/components/schemas/Trip'
 *                 seat:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Seat'
 *                 payment:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BookingLog'
 *                 Notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.get('/:bookingToken', handleGetBookingByToken);


export default router;