import express from 'express';
import { register, login, logout, getMe, updatePassword } from '../controllers/authController.js';
import { protect } from '../utils/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Token validation endpoint (useful for mobile apps)
router.get('/validate-token', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

// Protected routes (require authentication)
router.use(protect); // All routes after this middleware are protected

router.get('/me', getMe);
router.patch('/updatePassword', updatePassword);

export default router;
