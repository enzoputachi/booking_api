import express from 'express';
import {  handleGetAllPayments, handlePaymentIntent, handleVerifyPayment } from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();


/**
 * @swagger
 * /api/payments/initialize:
 *   post:
 *     summary: Initialize a payment
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - amount
 *               - email
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 example: 500000
 *               email:
 *                 type: string
 *                 format: email
 *                 example: samuel@gmail.com
 *     responses:
 *       201:
 *         description: Created payment intent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 */
router.post('/initialize', handlePaymentIntent);

/**
 * @swagger
 * /api/verify/{reference}:
 *   get:
 *     summary: Verify a payment by reference
 *     tags:
 *       - Payments
 *     parameters:
 *       - name: reference
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique payment reference returned from initialization
 *     responses:
 *       200:
 *         description: Payment verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Current payment status (e.g., SUCCESS, FAILED)
 *                 paidAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when payment was completed
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
router.get('/verify/:reference', handleVerifyPayment);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments (with search, filter, sort, and pagination)
 *     tags:
 *       - Payments
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by payment status (e.g., PAID, PENDING, FAILED) or payment/booking ID
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: '{"createdAt":"desc"}'
 *         description: Sort order (JSON string, e.g., {"createdAt":"desc"})
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       bookingId:
 *                         type: integer
 *                       paystackRef:
 *                         type: string
 *                         nullable: true
 *                       amount:
 *                         type: number
 *                       channel:
 *                         type: string
 *                         nullable: true
 *                       currency:
 *                         type: string
 *                       provider:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       customerId:
 *                         type: string
 *                         nullable: true
 *                       paidAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       authorization:
 *                         type: object
 *                         nullable: true
 *                       booking:
 *                         type: object
 *                         description: Related booking object
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: Internal server error
 * */
router.get('/', authenticate,  handleGetAllPayments);

export default router; 