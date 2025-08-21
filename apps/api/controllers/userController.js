import User from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Get all users with pagination and search
export const getAllUsers = catchAsync(async (req, res, next) => {
  // Extract query parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const role = req.query.role || '';

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery = {};
  
  // Add search filter for name and email
  if (search) {
    searchQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // Add role filter
  if (role && role !== 'All') {
    searchQuery.role = role;
  }

  // Get total count for pagination
  const totalUsers = await User.countDocuments(searchQuery);
  
  // Get users with pagination
  const users = await User.find(searchQuery)
    .select('-password')
    .populate('parent_id', 'name email role')
    .populate('municipality', 'name code address.city')
    .populate('ngo', 'name type address.city')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Calculate pagination info
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

// Create a new user
export const createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role, parent_id, municipality, ngo, address, phone, emergencyContact, medicalInfo, riskLevel } = req.body;

  // Check if the current user can create users
  if (req.user.role !== 'admin' && !req.user.isOrganizationAdmin() && !req.user.isManager()) {
    return next(new AppError('You do not have permission to create users', 403));
  }

  // Validate parent-child relationship if parent_id is provided
  if (parent_id) {
    const isValidRelationship = await User.validateParentChild(parent_id, null, role);
    if (!isValidRelationship) {
      return next(new AppError('Invalid parent-child relationship for the specified roles', 400));
    }

    // Check if current user can create child with this parent
    if (req.user.role !== 'admin' && parent_id !== req.user._id.toString()) {
      const parent = await User.findById(parent_id);
      if (!parent || !req.user.canManage(parent_id)) {
        return next(new AppError('You cannot create users under the specified parent', 403));
      }
    }
  }

  // For non-admin users, set appropriate parent
  if (req.user.role !== 'admin' && !parent_id) {
    if (req.user.canCreateChildWithRole(role)) {
      req.body.parent_id = req.user._id;
    } else {
      return next(new AppError('You cannot create users with this role', 403));
    }
  }

  // Set organization details based on parent or current user
  if (municipality && req.user.organization_type === 'municipality') {
    req.body.organization_name = req.user.organization_name;
  }
  
  if (ngo && req.user.organization_type === 'ngo') {
    req.body.organization_name = req.user.organization_name;
  }

  // Validate high-risk user requirements
  if (role === 'highrisk_area_user') {
    if (!address || !address.city || !address.state) {
      return next(new AppError('Address is required for high-risk area users', 400));
    }
    if (!emergencyContact || !emergencyContact.name || !emergencyContact.phone) {
      return next(new AppError('Emergency contact is required for high-risk area users', 400));
    }
  }

  const newUser = await User.create(req.body);

  // Remove password from response
  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

// Get user by ID
export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('parent_id', 'name email role')
    .populate('municipality', 'name code address boundaries')
    .populate('ngo', 'name type address operationalAreas');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check permissions
  const canView = req.user.role === 'admin' || 
                 req.user._id.toString() === user._id.toString() ||
                 (await req.user.canManage(user._id)) ||
                 (await user.isDescendantOf(req.user._id));

  if (!canView) {
    return next(new AppError('You do not have permission to view this user', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update user
export const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check permissions
  const canUpdate = req.user.role === 'admin' || 
                   req.user._id.toString() === user._id.toString() ||
                   (await req.user.canManage(user._id));

  if (!canUpdate) {
    return next(new AppError('You do not have permission to update this user', 403));
  }

  // Prevent role changes by non-admins
  if (req.body.role && req.user.role !== 'admin') {
    return next(new AppError('Only admins can change user roles', 403));
  }

  // Validate parent-child relationship if being changed
  if (req.body.parent_id && req.body.parent_id !== user.parent_id?.toString()) {
    const isValidRelationship = await User.validateParentChild(
      req.body.parent_id, 
      user._id, 
      req.body.role || user.role
    );
    if (!isValidRelationship) {
      return next(new AppError('Invalid parent-child relationship', 400));
    }
  }

  // Handle password updates separately
  if (req.body.password) {
    delete req.body.password; // Password should be updated through change password endpoint
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).select('-password')
   .populate('parent_id', 'name email role')
   .populate('municipality', 'name code address.city')
   .populate('ngo', 'name type address.city');

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Delete user
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check permissions
  const canDelete = req.user.role === 'admin' || 
                   (await req.user.canManage(user._id));

  if (!canDelete) {
    return next(new AppError('You do not have permission to delete this user', 403));
  }

  // Prevent self-deletion
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError('You cannot delete your own account', 400));
  }

  // Handle children - the pre-remove middleware will handle this
  await user.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Update user geofence (for high-risk users)
export const updateUserGeofence = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role !== 'highrisk_area_user') {
    return next(new AppError('Geofence can only be updated for high-risk area users', 400));
  }

  // Check permissions
  const canUpdate = req.user.role === 'admin' || 
                   req.user._id.toString() === user._id.toString() ||
                   (await req.user.canManage(user._id));

  if (!canUpdate) {
    return next(new AppError('You do not have permission to update this user\'s geofence', 403));
  }

  await user.updateGeofence(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user: user.select('-password')
    }
  });
});

// Add alert contact for high-risk user
export const addAlertContact = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role !== 'highrisk_area_user') {
    return next(new AppError('Alert contacts can only be added for high-risk area users', 400));
  }

  // Check permissions
  const canUpdate = req.user.role === 'admin' || 
                   req.user._id.toString() === user._id.toString() ||
                   (await req.user.canManage(user._id));

  if (!canUpdate) {
    return next(new AppError('You do not have permission to add alert contacts', 403));
  }

  await user.addAlertContact(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user: user.select('-password')
    }
  });
});

// Remove alert contact
export const removeAlertContact = catchAsync(async (req, res, next) => {
  const { id, contactId } = req.params;
  
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check permissions
  const canUpdate = req.user.role === 'admin' || 
                   req.user._id.toString() === user._id.toString() ||
                   (await req.user.canManage(user._id));

  if (!canUpdate) {
    return next(new AppError('You do not have permission to remove alert contacts', 403));
  }

  await user.removeAlertContact(contactId);

  res.status(200).json({
    status: 'success',
    data: {
      user: user.select('-password')
    }
  });
});

// Get high-risk users without geofence
export const getHighRiskUsersWithoutGeofence = catchAsync(async (req, res, next) => {
  // Only admins and organization users can view this
  if (req.user.role !== 'admin' && !req.user.isOrganizationAdmin()) {
    return next(new AppError('You do not have permission to view this data', 403));
  }

  const users = await User.findHighRiskUsersWithoutGeofence()
    .populate('municipality', 'name code')
    .populate('ngo', 'name type');

  res.status(200).json({
    status: 'success',
    data: {
      users,
      total: users.length
    }
  });
});

// Search users near location
export const searchUsersNearLocation = catchAsync(async (req, res, next) => {
  const { longitude, latitude } = req.query;
  const maxDistance = parseInt(req.query.maxDistance) || 10000; // 10km default

  if (!longitude || !latitude) {
    return next(new AppError('Longitude and latitude are required', 400));
  }

  // Only admins and emergency responders can search by location
  if (req.user.role !== 'admin' && !req.user.role.includes('emergency')) {
    return next(new AppError('You do not have permission to search users by location', 403));
  }

  const users = await User.findNear(
    parseFloat(longitude),
    parseFloat(latitude),
    maxDistance
  ).populate('municipality', 'name code')
   .populate('ngo', 'name type');

  res.status(200).json({
    status: 'success',
    data: {
      users,
      searchLocation: {
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
        maxDistance
      }
    }
  });
});

// Get user hierarchy
export const getUserHierarchy = catchAsync(async (req, res, next) => {
  const userId = req.params.userId || req.user._id;
  
  const user = await User.findById(userId)
    .select('-password')
    .populate('parent_id', 'name email role')
    .populate('municipality', 'name code')
    .populate('ngo', 'name type');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check permissions
  const canView = req.user.role === 'admin' || 
                 req.user._id.toString() === userId ||
                 (await req.user.canManage(userId)) ||
                 (await user.isDescendantOf(req.user._id));

  if (!canView) {
    return next(new AppError('You do not have permission to view this user hierarchy', 403));
  }

  const children = await user.getChildren('-password');
  const descendants = await user.getDescendants();

  res.status(200).json({
    status: 'success',
    data: {
      user,
      children: children.map(child => ({ ...child.toObject(), password: undefined })),
      totalDescendants: descendants.length
    }
  });
});

// Get users by role
export const getUsersByRole = catchAsync(async (req, res, next) => {
  const { role } = req.params;
  
  // Check permissions
  if (req.user.role !== 'admin') {
    const allowedRoles = User.getRoleHierarchy()[req.user.role]?.children || [];
    if (!allowedRoles.includes(role) && role !== req.user.role) {
      return next(new AppError('You do not have permission to view users with this role', 403));
    }
  }

  const users = await User.findByRole(role)
    .populate('municipality', 'name code')
    .populate('ngo', 'name type');

  res.status(200).json({
    status: 'success',
    data: {
      users,
      role,
      total: users.length
    }
  });
});

// Get role hierarchy
export const getRoleHierarchy = catchAsync(async (req, res, next) => {
  const hierarchy = User.getRoleHierarchy();
  
  // Filter based on user permissions
  let filteredHierarchy = hierarchy;
  
  if (req.user.role !== 'admin') {
    // Non-admin users only see their branch of the hierarchy
    const userOrgType = req.user.organization_type;
    filteredHierarchy = Object.fromEntries(
      Object.entries(hierarchy).filter(([role, info]) => 
        role === req.user.role || 
        info.organization === userOrgType ||
        (req.user.role === 'admin')
      )
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      hierarchy: filteredHierarchy,
      current_user_role: req.user.role,
      current_user_level: req.user.getRoleLevel()
    }
  });
});
