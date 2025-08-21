import express from 'express';
import {
  getAllNGOs,
  getNGO,
  createNGO,
  updateNGO,
  deleteNGO,
  assignAdmin,
  getNGOUsers,
  addOperationalArea,
  removeOperationalArea,
  verifyNGO,
  findNearbyNGOs,
  getNGOStatistics,
  addCertification,
  removeCertification
} from '../controllers/ngoController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Public routes (for authenticated users)
router.get('/', getAllNGOs);
router.get('/nearby', findNearbyNGOs);
router.get('/statistics', restrictTo('admin'), getNGOStatistics);
router.get('/:id', getNGO);
router.get('/:id/users', getNGOUsers);

// Admin-only routes
router.use(restrictTo('admin'));
router.post('/', createNGO);
router.patch('/:id', updateNGO);
router.delete('/:id', deleteNGO);
router.patch('/:ngoId/admin/:userId', assignAdmin);
router.patch('/:ngoId/operational-areas/:municipalityId', addOperationalArea);
router.delete('/:ngoId/operational-areas/:municipalityId', removeOperationalArea);
router.patch('/:id/verify', verifyNGO);
router.post('/:id/certifications', addCertification);
router.delete('/:id/certifications/:certificationId', removeCertification);

export default router;
