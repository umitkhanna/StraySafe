import express from 'express';
import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateUserGeofence,
  addAlertContact,
  removeAlertContact,
  getHighRiskUsersWithoutGeofence,
  searchUsersNearLocation,
  getUserHierarchy,
  getUsersByRole,
  getRoleHierarchy
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// General user routes
router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/hierarchy', getUserHierarchy);
router.get('/hierarchy/:userId', getUserHierarchy);
router.get('/role-hierarchy', getRoleHierarchy);
router.get('/role/:role', getUsersByRole);
router.get('/high-risk-without-geofence', getHighRiskUsersWithoutGeofence);
router.get('/search/location', searchUsersNearLocation);

// Individual user routes
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

// Geofence management for high-risk users
router.patch('/:id/geofence', updateUserGeofence);
router.post('/:id/alert-contacts', addAlertContact);
router.delete('/:id/alert-contacts/:contactId', removeAlertContact);

export default router;
