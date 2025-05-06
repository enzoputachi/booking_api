import express from 'express';
import {
  handleCreateRoute,
  handleDeleteRoute,
  handleGetRoute,
  handleUpdateRoute,
} from "../controllers/routeController.js";
import validateSchema from '../middilewares/validate.js';
import { RouteCreateSchema } from '../schemas/index.js';

const router = express.Router();

router.post('/', validateSchema(RouteCreateSchema), handleCreateRoute)
router.get('/', handleGetRoute);
router.get('/', handleUpdateRoute);
router.delete('/', handleDeleteRoute);


export default router;