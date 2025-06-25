import express from 'express';
import {
  handleCreateRoute,
  handleDeleteRoute,
  handleGetAllRoutes,
  handleGetRouteById,
  handleUpdateRoute,
} from "../controllers/routeController.js";
import { handleGetAllBuses } from '../controllers/busController.js';

const router = express.Router();

/**
 * @swagger
 * /api/routes:
 *   post:
 *     summary: Create a new route
 *     description: Add a new travel route specifying origin, destination, and distance in kilometers.
 *     tags:
 *       - Routes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *               - distanceKm
 *             properties:
 *               origin:
 *                 type: string
 *                 example: Lagos
 *               destination:
 *                 type: string
 *                 example: Abuja
 *               distanceKm:
 *                 type: number
 *                 format: float
 *                 example: 754.5
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Route created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/', handleCreateRoute);

/**
 * @swagger
 * /api/routes/{routeId}:
 *   get:
 *     summary: Get route by ID
 *     description: Retrieve details of a specific route by its unique ID.
 *     tags:
 *       - Routes
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the route to retrieve
 *     responses:
 *       200:
 *         description: Route details retrieved successfully
 *       404:
 *         description: Route not found
 *       500:
 *         description: Server error
 */
router.get('/:routeId', handleGetRouteById);

/**
 * @swagger
 * /api/routes:
 *   get:
 *     summary: Retrieve all routes
 *     description: Fetch a list of all travel routes, including origin, destination, distance, and active status.
 *     tags:
 *       - Routes
 *     responses:
 *       200:
 *         description: A list of routes retrieved successfully
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
 *                   origin:
 *                     type: string
 *                     example: Lagos
 *                   destination:
 *                     type: string
 *                     example: Abuja
 *                   distanceKm:
 *                     type: number
 *                     format: float
 *                     example: 754.5
 *                   isActive:
 *                     type: boolean
 *                     example: true
 *       500:
 *         description: Server error
 */
router.get('/', handleGetAllRoutes);

/**
 * @swagger
 * /api/routes/{routeId}:
 *   patch:
 *     summary: Update a route
 *     description: Update the details of a specific route by its ID.
 *     tags:
 *       - Routes
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the route to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               origin:
 *                 type: string
 *                 example: Lagos
 *               destination:
 *                 type: string
 *                 example: Abuja
 *               distanceKm:
 *                 type: number
 *                 example: 750.5
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Route updated successfully
 *       404:
 *         description: Route not found
 *       500:
 *         description: Server error
 */
router.patch('/:routeId', handleUpdateRoute);

/**
 * @swagger
 * /api/routes/{routeId}:
 *   delete:
 *     summary: Delete a route
 *     description: Permanently delete a route by its unique ID.
 *     tags:
 *       - Routes
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the route to delete
 *     responses:
 *       200:
 *         description: Route deleted successfully
 *       404:
 *         description: Route not found
 *       500:
 *         description: Server error
 */
router.delete('/:routeId', handleDeleteRoute);


export default router;