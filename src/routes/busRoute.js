import express from 'express';
import {
  handleCreateBus,
  handleDeleteBus,
  handleGetBus,
  handleUpdateBus,
} from "../controllers/busController.js";
import validateSchema from '../middilewares/validate.js';
import { BusCreateSchema } from '../schemas/index.js';


const router = express.Router();


router.post('/', validateSchema(BusCreateSchema), handleCreateBus);
router.get('/', handleGetBus);
router.patch('/', handleUpdateBus);
router.delete('/', handleDeleteBus);

export default router;