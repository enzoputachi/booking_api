import express from 'express';
import {
  handleCreateRoute,
  handleDeleteRoute,
  handleGetRoute,
  handleUpdateRoute,
} from "../controllers/routeController.js";

const router = express.Router();

router.post('/', handleCreateRoute)
router.get('/', handleGetRoute);
router.get('/', handleUpdateRoute);
router.delete('/', handleDeleteRoute);


export default router;