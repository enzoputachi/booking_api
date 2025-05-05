import express from 'express';
import {
  handleCreateUser,
  handleDeleteUser,
  handleGetUser,
  handleUpdateUser,
} from "../controllers/userController.js";

const router = express.Router()

router.post('/', handleCreateUser);
router.get('/', handleGetUser);
router.patch('/', handleUpdateUser);
router.delete('/', handleDeleteUser);

export default router;