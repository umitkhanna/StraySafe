import express from 'express';
import {
  getAllNGOs,
  getNGO,
  createNGO,
  updateNGO,
  deleteNGO
} from '../controllers/ngoController.js';

const router = express.Router();

// Basic CRUD routes
router.get('/', getAllNGOs);
router.get('/:id', getNGO);
router.post('/', createNGO);
router.put('/:id', updateNGO);
router.delete('/:id', deleteNGO);

export default router;
