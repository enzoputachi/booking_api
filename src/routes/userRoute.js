import express from 'express';
import {
  handleCreateUser,
  handleDeleteUser,
  handleGetAllUsers,
  handleGetUserById,
  handleLoginUser,
  handleUpdateUser,
} from "../controllers/userController.js";
import { authenticate } from '../middlewares/auth.js';



const router = express.Router()

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: create new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Enzo Amori
 *               email:
 *                 type: string
 *                 format: email
 *                 example: copersdrive@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: CopersStrong123
 *               status:
 *                 type: string
 *                 example: active
 *               role:
 *                 type: string
 *                 enum: [ADMIN]
 *                 example: ADMIN
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/', handleCreateUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK – returns JWT and basic user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Missing or invalid parameters
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authenticate, handleLoginUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all users in the system. This endpoint may be restricted to authorized admin users.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     example: 7c9e6679-7425-40de-944b-e07fc1f90ae7
 *                   name:
 *                     type: string
 *                     example: Enzo Amori
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: enzo@example.com
 *                   status:
 *                     type: string
 *                     example: active
 *                   role:
 *                     type: string
 *                     example: ADMIN
 *                   lastLogin:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-05-01T10:30:00.000Z
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-01-01T09:00:00.000Z
 *       401:
 *         description: Unauthorized — authentication required
 *       500:
 *         description: Server error
 */
router.get('/', handleGetAllUsers);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves the details of a specific user by their unique ID. Typically restricted to admin users or the user themselves.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The unique identifier of the user
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 7c9e6679-7425-40de-944b-e07fc1f90ae7
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: 7c9e6679-7425-40de-944b-e07fc1f90ae7
 *                 name:
 *                   type: string
 *                   example: Enzo Amori
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: enzo@example.com
 *                 status:
 *                   type: string
 *                   example: active
 *                 role:
 *                   type: string
 *                   example: ADMIN
 *                 lastLogin:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-05-01T10:30:00.000Z
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-01-01T09:00:00.000Z
 *       400:
 *         description: Invalid user ID format
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized — authentication required
 *       500:
 *         description: Server error
 */
router.get('/:userId', handleGetUserById);

/**
 * @swagger
 * /api/users/{userId}:
 *   patch:
 *     summary: Update a user's details
 *     description: Partially updates an existing user's information. Typically restricted to admin users or the user themselves.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The unique identifier of the user
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 7c9e6679-7425-40de-944b-e07fc1f90ae7
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Enzo Updated
 *               email:
 *                 type: string
 *                 format: email
 *                 example: updated@example.com
 *               status:
 *                 type: string
 *                 example: inactive
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 example: USER
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input or malformed request
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch('/:userId', handleUpdateUser);


/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Permanently deletes a user account from the system. This action is typically restricted to administrators.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The unique identifier of the user to delete
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 7c9e6679-7425-40de-944b-e07fc1f90ae7
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized or invalid token
 *       500:
 *         description: Server error
 */
router.delete('/:userId', handleDeleteUser);

export default router;