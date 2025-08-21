import User from '../models/User.js';
import { createSendToken } from '../utils/auth.js';

// Error handling utility
const handleError = (error, res) => {
  console.error('Auth Error:', error);

  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Email already exists'
    });
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      details: messages
    });
  }
console.log('Auth Error:', error);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong'
  });
};

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, platform, parent_id, role, organization_name } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Default role if not provided
    const userRole = role || 'citizen';

    // Validate parent if provided
    if (parent_id) {
      const parent = await User.findById(parent_id);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Parent user not found'
        });
      }

      if (!parent.canCreateChildWithRole(userRole)) {
        return res.status(400).json({
          success: false,
          message: `${parent.role} cannot create users with role ${userRole}`
        });
      }
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      parent_id: parent_id || null,
      role: userRole,
      organization_name
    });

    // Update last login
    newUser.lastLogin = new Date();
    await newUser.save({ validateBeforeSave: false });

    // Don't set cookies for mobile platforms
    const options = platform === 'mobile' ? { noCookie: true } : {};
    createSendToken(newUser, 201, res, options);
  } catch (error) {
    handleError(error, res);
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe, platform } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // 2) Check if user exists and password is correct
    const user = await User.findByEmail(email);

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }

    // 3) Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // 4) Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // 5) If everything ok, send token to client
    // Don't set cookies for mobile platforms
    const options = platform === 'mobile' ? { noCookie: true } : {};
    createSendToken(user, 200, res, options);
  } catch (error) {
    handleError(error, res);
  }
};

// Logout user
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Update current user password
export const updatePassword = async (req, res) => {
  try {
    const { passwordCurrent, password, passwordConfirm } = req.body;

    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(passwordCurrent, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // 3) Check if password and passwordConfirm match
    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // 4) If so, update password
    user.password = password;
    await user.save();

    // 5) Log user in, send JWT
    createSendToken(user, 200, res);
  } catch (error) {
    handleError(error, res);
  }
};
