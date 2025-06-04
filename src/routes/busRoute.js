import express from 'express';
import {
  handleCreateBus,
  handleDeleteBus,
  handleGetAllBuses,
  handleGetBusById,
  handleUpdateBus,
} from "../controllers/busController.js";


const router = express.Router();


/**
 * @swagger
 * /api/buses:
 *   post:
 *     summary: Create a new bus
 *     description: Registers a new bus in the system with plate number, type, capacity, and seating configuration.
 *     tags:
 *       - Buses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plateNo
 *               - busType
 *               - capacity
 *               - seatsPerRow
 *             properties:
 *               plateNo:
 *                 type: string
 *                 example: ABC-123-KD
 *               busType:
 *                 type: string
 *                 example: Toyota Hiace
 *               capacity:
 *                 type: integer
 *                 example: 15
 *               seatsPerRow:
 *                 type: integer
 *                 example: 4
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Bus created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 plateNo:
 *                   type: string
 *                   example: ABC-123-KD
 *                 busType:
 *                   type: string
 *                   example: Toyota Hiace
 *                 capacity:
 *                   type: integer
 *                   example: 15
 *                 seatsPerRow:
 *                   type: integer
 *                   example: 4
 *                 isActive:
 *                   type: boolean
 *                   example: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request or validation error
 *       409:
 *         description: Duplicate plate number
 *       500:
 *         description: Server error
 */
router.post('/', handleCreateBus);

/**
 * @swagger
 * /api/buses:
 *   get:
 *     summary: Get all buses
 *     description: Retrieve a list of all registered buses, including their plate numbers, types, capacities, and status.
 *     tags:
 *       - Buses
 *     responses:
 *       200:
 *         description: A list of buses
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
 *                   plateNo:
 *                     type: string
 *                     example: ABC-123-KD
 *                   busType:
 *                     type: string
 *                     example: Toyota Hiace
 *                   capacity:
 *                     type: integer
 *                     example: 15
 *                   seatsPerRow:
 *                     type: integer
 *                     example: 4
 *                   isActive:
 *                     type: boolean
 *                     example: true
 *       500:
 *         description: Server error
 */
router.get('/', handleGetAllBuses);

/**
 * @swagger
 * /api/buses/{busId}:
 *   get:
 *     summary: Get a bus by ID
 *     description: Retrieve the details of a specific bus using its unique ID.
 *     tags:
 *       - Buses
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the bus
 *     responses:
 *       200:
 *         description: Bus retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 plateNo:
 *                   type: string
 *                   example: ABC-123-KD
 *                 busType:
 *                   type: string
 *                   example: Toyota Hiace
 *                 capacity:
 *                   type: integer
 *                   example: 15
 *                 seatsPerRow:
 *                   type: integer
 *                   example: 4
 *                 isActive:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Bus not found
 *       500:
 *         description: Server error
 */
router.get('/:busId', handleGetBusById);

/**
 * @swagger
 * /api/buses/{busId}:
 *   patch:
 *     summary: Update a bus
 *     description: Update details of an existing bus using its unique ID. Only the provided fields will be updated.
 *     tags:
 *       - Buses
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the bus to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plateNo:
 *                 type: string
 *                 example: XYZ-456-LA
 *               busType:
 *                 type: string
 *                 example: Mercedes Sprinter
 *               capacity:
 *                 type: integer
 *                 example: 18
 *               seatsPerRow:
 *                 type: integer
 *                 example: 4
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Bus updated successfully
 *       400:
 *         description: Invalid request or bus not found
 *       500:
 *         description: Server error
 */
router.patch('/:busId', handleUpdateBus);

/**
 * @swagger
 * /api/buses/{busId}:
 *   delete:
 *     summary: Delete a bus
 *     description: Permanently remove a bus from the system using its unique ID.
 *     tags:
 *       - Buses
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the bus to delete
 *     responses:
 *       200:
 *         description: Bus deleted successfully
 *       404:
 *         description: Bus not found
 *       500:
 *         description: Server error
 */
router.delete('/:busId', handleDeleteBus);


export default router;