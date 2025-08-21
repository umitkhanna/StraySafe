import Municipality from '../models/Municipality.js';
import User from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Get all municipalities
export const getAllMunicipalities = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const isActive = req.query.isActive;

  // Build query
  let query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } },
      { 'address.state': { $regex: search, $options: 'i' } }
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Get total count for pagination
  const totalItems = await Municipality.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  // Get municipalities with pagination
  const municipalities = await Municipality.find(query)
    .populate('adminUser', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    data: {
      municipalities,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

// Get municipality by ID
export const getMunicipality = catchAsync(async (req, res, next) => {
  const municipality = await Municipality.findById(req.params.id)
    .populate('adminUser', 'name email role phone')
    .populate('users');

  if (!municipality) {
    return next(new AppError('Municipality not found', 404));
  }

  // Get user statistics for this municipality
  const userStats = await User.aggregate([
    { $match: { municipality: municipality._id, isActive: true } },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      municipality,
      userStats
    }
  });
});

// Create new municipality
export const createMunicipality = catchAsync(async (req, res, next) => {
  // Check if user has permission to create municipality
  if (req.user.role !== 'admin') {
    return next(new AppError('Only admins can create municipalities', 403));
  }

  const municipality = await Municipality.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      municipality
    }
  });
});

// Update municipality
export const updateMunicipality = catchAsync(async (req, res, next) => {
  const municipality = await Municipality.findById(req.params.id);

  if (!municipality) {
    return next(new AppError('Municipality not found', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      (!municipality.adminUser || municipality.adminUser.toString() !== req.user._id.toString())) {
    return next(new AppError('You do not have permission to update this municipality', 403));
  }

  const updatedMunicipality = await Municipality.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('adminUser', 'name email role');

  res.status(200).json({
    status: 'success',
    data: {
      municipality: updatedMunicipality
    }
  });
});

// Delete municipality
export const deleteMunicipality = catchAsync(async (req, res, next) => {
  const municipality = await Municipality.findById(req.params.id);

  if (!municipality) {
    return next(new AppError('Municipality not found', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin') {
    return next(new AppError('Only admins can delete municipalities', 403));
  }

  // Check if municipality has users
  const userCount = await User.countDocuments({ municipality: req.params.id });
  if (userCount > 0) {
    return next(new AppError('Cannot delete municipality with associated users', 400));
  }

  await Municipality.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Assign admin to municipality
export const assignAdmin = catchAsync(async (req, res, next) => {
  const { municipalityId, userId } = req.params;

  // Check permissions
  if (req.user.role !== 'admin') {
    return next(new AppError('Only admins can assign municipality admins', 403));
  }

  const municipality = await Municipality.findById(municipalityId);
  const user = await User.findById(userId);

  if (!municipality) {
    return next(new AppError('Municipality not found', 404));
  }

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role !== 'municipality_user') {
    return next(new AppError('User must have municipality_user role', 400));
  }

  // Update municipality admin
  municipality.adminUser = userId;
  await municipality.save();

  // Update user's municipality reference
  user.municipality = municipalityId;
  user.organization_name = municipality.name;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      municipality: await municipality.populate('adminUser', 'name email role')
    }
  });
});

// Get municipality users
export const getMunicipalityUsers = catchAsync(async (req, res, next) => {
  const municipality = await Municipality.findById(req.params.id);

  if (!municipality) {
    return next(new AppError('Municipality not found', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      (!municipality.adminUser || municipality.adminUser.toString() !== req.user._id.toString()) &&
      req.user.municipality?.toString() !== req.params.id) {
    return next(new AppError('You do not have permission to view these users', 403));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const role = req.query.role || '';

  // Build query
  let query = {
    municipality: req.params.id,
    isActive: true
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  if (role && role !== 'All') {
    query.role = role;
  }

  const totalItems = await User.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  const users = await User.find(query)
    .select('-password')
    .populate('parent_id', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    data: {
      users,
      municipality,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

// Search municipalities near coordinates
export const findNearbyMunicipalities = catchAsync(async (req, res, next) => {
  const { longitude, latitude } = req.query;
  const maxDistance = parseInt(req.query.maxDistance) || 50000; // 50km default

  if (!longitude || !latitude) {
    return next(new AppError('Longitude and latitude are required', 400));
  }

  const municipalities = await Municipality.findNear(
    parseFloat(longitude),
    parseFloat(latitude),
    maxDistance
  ).populate('adminUser', 'name email role');

  res.status(200).json({
    status: 'success',
    data: {
      municipalities,
      searchLocation: {
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
        maxDistance
      }
    }
  });
});

// Get municipality boundaries
export const getMunicipalityBoundaries = catchAsync(async (req, res, next) => {
  const municipality = await Municipality.findById(req.params.id);

  if (!municipality) {
    return next(new AppError('Municipality not found', 404));
  }

  if (!municipality.boundaries || !municipality.boundaries.coordinates) {
    return next(new AppError('Municipality boundaries not defined', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      boundaries: municipality.boundaries,
      name: municipality.name,
      code: municipality.code
    }
  });
});

// Update municipality boundaries
export const updateMunicipalityBoundaries = catchAsync(async (req, res, next) => {
  const municipality = await Municipality.findById(req.params.id);

  if (!municipality) {
    return next(new AppError('Municipality not found', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      (!municipality.adminUser || municipality.adminUser.toString() !== req.user._id.toString())) {
    return next(new AppError('You do not have permission to update boundaries', 403));
  }

  const { boundaries } = req.body;

  if (!boundaries || !boundaries.coordinates) {
    return next(new AppError('Valid boundaries data is required', 400));
  }

  municipality.boundaries = boundaries;
  await municipality.save();

  res.status(200).json({
    status: 'success',
    data: {
      municipality
    }
  });
});
