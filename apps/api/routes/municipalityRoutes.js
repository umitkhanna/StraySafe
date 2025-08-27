import express from 'express';
import {
  getAllMunicipalities,
  getMunicipality,
  createMunicipality,
  updateMunicipality,
  deleteMunicipality
} from '../controllers/municipalityController.js';

const router = express.Router();

// Basic CRUD routes
router.get('/', getAllMunicipalities);
router.get('/:id', getMunicipality);
router.post('/', createMunicipality);
router.put('/:id', updateMunicipality);
router.delete('/:id', deleteMunicipality);

export default router;
