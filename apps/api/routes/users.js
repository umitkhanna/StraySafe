import express from 'express';
import { 
  getUserHierarchy, 
  addSubUser, 
  moveUser, 
  getManagedUsers, 
  removeUser,
  getOrganizationMembers,
  getUsersByRole,
  getRoleHierarchy,
  getAllUsers
} from '../controllers/userController.js';
import { protect } from '../utils/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all users (admin only)
router.get('/', getAllUsers);

// Get users that current user can manage
router.get('/managed', getManagedUsers);

// Get organization members
router.get('/organization-members', getOrganizationMembers);

// Get users by role
router.get('/by-role/:role', getUsersByRole);

// Get role hierarchy information
router.get('/role-hierarchy', getRoleHierarchy);

// Add a sub-user under current user or specified parent
router.post('/add-sub-user', addSubUser);

// Move user to different parent
 router.patch('/move/:userId', moveUser);

// Remove user (admin or parent can remove)
 router.delete('/:userId', removeUser);

export default router;
