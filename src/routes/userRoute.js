import express from 'express';
import {
  handleCreateUser,
  handleDeleteUser,
  handleGetUser,
  handleUpdateUser,
} from "../controllers/userController.js";
import validateSchema from '../middilewares/validate.js';
import { UserCreateSchema } from '../schemas/index.js';

const router = express.Router()

router.post('/', validateSchema(UserCreateSchema), handleCreateUser);
router.get('/', handleGetUser);
router.patch('/', handleUpdateUser);
router.delete('/', handleDeleteUser);

export default router;