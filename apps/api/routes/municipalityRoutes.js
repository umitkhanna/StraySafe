import express from 'express';
import {
  getAllMunicipalities,
  getMunicipality,
  createMunicipality,
  updateMunicipality,
  deleteMunicipality,
  assignAdmin,
  getMunicipalityUsers,
  findNearbyMunicipalities,
  getMunicipalityBoundaries,
  updateMunicipalityBoundaries
} from '../controllers/municipalityController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Public routes (for authenticated users)
router.get('/', getAllMunicipalities);
router.get('/nearby', findNearbyMunicipalities);
router.get('/:id', getMunicipality);
router.get('/:id/boundaries', getMunicipalityBoundaries);
router.get('/:id/users', getMunicipalityUsers);

// Admin-only routes
router.use(restrictTo('admin'));
router.post('/', createMunicipality);
router.patch('/:id', updateMunicipality);
router.delete('/:id', deleteMunicipality);
router.patch('/:municipalityId/admin/:userId', assignAdmin);
router.patch('/:id/boundaries', updateMunicipalityBoundaries);

export default router;
