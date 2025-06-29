import express from "express";
import { handleGetCompanySettings, handleSeedCompanySettings, handleUpdateCompanySettings } from "../controllers/settingsController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CompanySetting:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         companyName:
 *           type: string
 *         supportEmail:
 *           type: string
 *         supportPhone:
 *           type: string
 *           nullable: true
 *         websiteUrl:
 *           type: string
 *           nullable: true
 *         facebookUrl:
 *           type: string
 *           nullable: true
 *         twitterUrl:
 *           type: string
 *           nullable: true
 *         instagramUrl:
 *           type: string
 *           nullable: true
 *         linkedinUrl:
 *           type: string
 *           nullable: true
 *         address:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - companyName
 *         - supportEmail
 */

/**
 * @swagger
 * /api/companySettings/:
 *   post:
 *     summary: Seed default company settings
 *     description: Creates a new `CompanySetting` record with default values and required fields only.
 *     tags:
 *       - Company Settings
 *     requestBody:
 *       required: false
 *       description: No request body is required. The seed function inserts a default setting.
 *     responses:
 *       200:
 *         description: Successfully seeded company settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanySetting'
 *       500:
 *         description: Server error during seeding
 */
router.post('/', handleSeedCompanySettings);

/**
 * @swagger
 * /api/companySettings/:
 *   get:
 *     summary: Retrieve the current company settings
 *     tags:
 *       - Company Settings
 *     responses:
 *       200:
 *         description: A JSON object of the company’s settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanySetting'
 */
router.get('/', handleGetCompanySettings);

/**
 * @swagger
 * /api/companySettings/{settingsId}:
 *   patch:
 *     summary: Update one company setting record
 *     tags:
 *       - Company Settings
 *     parameters:
 *       - in: path
 *         name: settingsId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the setting to update
 *     requestBody:
 *       description: Fields to update (one or more)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanySetting'
 *     responses:
 *       200:
 *         description: The updated company setting
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanySetting'
 */
router.patch('/:settingsId', handleUpdateCompanySettings);


export default router;