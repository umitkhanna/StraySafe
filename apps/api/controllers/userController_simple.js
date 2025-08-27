import User from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { 
  canUserManage, 
  isOrganizationAdmin, 
  isManager, 
  validateParentChild,
  canCreateChildWithRole 
} from '../utils/userPermissions.js';

// Get all users with pagination and search
export const getAllUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const role = req.query.role || '';

  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery = {};
  
  if (search) {
    searchQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  if (role && role !== 'All') {
    searchQuery.role = role;
  }

  const totalUsers = await User.countDocuments(searchQuery);
  
  const users = await User.find(searchQuery)
    .select('-password')
    .populate('parent_id', 'name email role')
    .populate('municipality', 'name')
    .populate('ngo', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalUsers / limit);
  
  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      total: totalUsers,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});

// Get single user
export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('parent_id', 'name email role')
    .populate('municipality', 'name')
    .populate('ngo', 'name');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      req.user._id.toString() !== user._id.toString() && 
      !(await canUserManage(req.user, user._id))) {
    return next(new AppError('You do not have permission to view this user', 403));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Create a new user
export const createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role, parent_id, municipality, ngo } = req.body;

  // Check permissions
  if (req.user.role !== 'admin' && !isOrganizationAdmin(req.user) && !isManager(req.user)) {
    return next(new AppError('You do not have permission to create users', 403));
  }

  // Validate parent-child relationship
  if (parent_id) {
    const isValidRelationship = await validateParentChild(parent_id, null, role);
    if (!isValidRelationship) {
      return next(new AppError('Invalid parent-child relationship for the specified roles', 400));
    }
  }

  // For non-admin users, set appropriate parent
  if (req.user.role !== 'admin' && !parent_id) {
    if (canCreateChildWithRole(req.user.role, role)) {
      req.body.parent_id = req.user._id;
    } else {
      return next(new AppError('You cannot create users with this role', 403));
    }
  }

  const newUser = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: newUser
  });
});

// Update user
export const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      req.user._id.toString() !== user._id.toString() && 
      !(await canUserManage(req.user, user._id))) {
    return next(new AppError('You do not have permission to update this user', 403));
  }

  // Don't allow password updates through this endpoint
  delete req.body.password;
  delete req.body.passwordChangedAt;

  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});

// Delete user
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin' && !(await canUserManage(req.user, user._id))) {
    return next(new AppError('You do not have permission to delete this user', 403));
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    success: true,
    data: null
  });
});
