import express from 'express';
import {
  handleCreateTrip,
  handleDeleteTrip,
  handleGetAllTrips,
  handleGetTripById,
  handleValidateTripDetails,
  handleSearchTripsByRoute,
  handleUpdateTrip,
} from "../controllers/tripController.js";


const router = express.Router()

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create a new trip
 *     description: Schedule a new trip by specifying departure time, arrival time, route, bus, and price.
 *     tags:
 *       - Trips
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departTime
 *               - arriveTime
 *               - busId
 *               - routeId
 *               - price
 *             properties:
 *               departTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-06-10T08:00:00.000Z"
 *               arriveTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-06-10T14:00:00.000Z"
 *               busId:
 *                 type: integer
 *                 example: 1
 *               routeId:
 *                 type: integer
 *                 example: 2
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 5000.00
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, CANCELLED, COMPLETED]
 *                 example: SCHEDULED
 *     responses:
 *       201:
 *         description: Trip created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/', handleCreateTrip);

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Retrieve all trips
 *     description: Fetch a list of all scheduled, completed, or cancelled trips.
 *     tags:
 *       - Trips
 *     responses:
 *       200:
 *         description: List of trips retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   departTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-06-10T08:00:00.000Z"
 *                   arriveTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-06-10T14:00:00.000Z"
 *                   busId:
 *                     type: integer
 *                     example: 1
 *                   routeId:
 *                     type: integer
 *                     example: 2
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 5000.00
 *                   status:
 *                     type: string
 *                     enum: [SCHEDULED, CANCELLED, COMPLETED]
 *                     example: SCHEDULED
 *       500:
 *         description: Server error
 */
router.get('/', handleGetAllTrips);

/**
 * @swagger
 * /api/trips/search:
 *   get:
 *     summary: Search trips by route
 *     description: Retrieves a list of trips that match the given route criteria (e.g., origin, destination, and date).
 *     tags:
 *       - Trips
 *     parameters:
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *         required: true
 *         description: The origin city or station of the route.
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         required: true
 *         description: The destination city or station of the route.
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter trips by departure date (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: A list of matching trips.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   departTime:
 *                     type: string
 *                     format: date-time
 *                   arriveTime:
 *                     type: string
 *                     format: date-time
 *                   busId:
 *                     type: integer
 *                   routeId:
 *                     type: integer
 *                   price:
 *                     type: number
 *                     format: float
 *                   status:
 *                     type: string
 *                     enum: [SCHEDULED, CANCELLED, COMPLETED]
 *       400:
 *         description: Invalid parameters or missing required fields.
 *       500:
 *         description: Server error.
 */
router.get('/search', handleSearchTripsByRoute)

/**
 * @swagger
 * /api/trips/{tripId}:
 *   get:
 *     summary: Get trip by ID
 *     description: Retrieve detailed information about a specific trip using its unique ID.
 *     tags:
 *       - Trips
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the trip to retrieve
 *     responses:
 *       200:
 *         description: Trip details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 departTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-10T08:00:00.000Z"
 *                 arriveTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-10T14:00:00.000Z"
 *                 busId:
 *                   type: integer
 *                   example: 1
 *                 routeId:
 *                   type: integer
 *                   example: 2
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 5000.00
 *                 status:
 *                   type: string
 *                   enum: [SCHEDULED, CANCELLED, COMPLETED]
 *                   example: SCHEDULED
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
router.get('/:tripId', handleGetTripById);

/**
 * @swagger
 * /api/trips/{tripId}:
 *   patch:
 *     summary: Update trip by ID
 *     description: Modify the details of a specific trip using its unique ID.
 *     tags:
 *       - Trips
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the trip to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-06-15T09:00:00.000Z"
 *               arriveTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-06-15T15:00:00.000Z"
 *               busId:
 *                 type: integer
 *                 example: 2
 *               routeId:
 *                 type: integer
 *                 example: 1
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 6000.00
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, CANCELLED, COMPLETED]
 *                 example: CANCELLED
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
router.patch('/:tripId', handleUpdateTrip);

/**
 * @swagger
 * /api/trips/{tripId}:
 *   delete:
 *     summary: Delete a trip by ID
 *     description: Permanently removes a trip from the system using its unique ID.
 *     tags:
 *       - Trips
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the trip to delete
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
router.delete('/:tripId', handleDeleteTrip)

/**
 * @swagger
 * /api/trips/{tripId}/validate:
 *   get:
 *     summary: Validate trip details
 *     description: Validates the trip details for a given trip ID.
 *     tags:
 *       - Trips
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the trip to validate
 *     responses:
 *       200:
 *         description: Trip details are valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid trip ID or trip details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Trip not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/:tripId/validate', handleValidateTripDetails)

// ================================================ //
//                      USER-FACING ROUTES      //
//================================================ //



export default router;