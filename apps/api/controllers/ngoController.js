import NGO from '../models/NGO.js';
import User from '../models/User.js';
import Municipality from '../models/Municipality.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Get all NGOs
export const getAllNGOs = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const type = req.query.type || '';
  const focusArea = req.query.focusArea || '';
  const isActive = req.query.isActive;
  const isVerified = req.query.isVerified;

  // Build query
  let query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { registrationNumber: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { mission: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } },
      { 'address.state': { $regex: search, $options: 'i' } },
      { servicesOffered: { $regex: search, $options: 'i' } }
    ];
  }

  if (type && type !== 'All') {
    query.type = type;
  }

  if (focusArea && focusArea !== 'All') {
    query.focusAreas = focusArea;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (isVerified !== undefined) {
    query.isVerified = isVerified === 'true';
  }

  // Get total count for pagination
  const totalItems = await NGO.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  // Get NGOs with pagination
  const ngos = await NGO.find(query)
    .populate('adminUser', 'name email role')
    .populate('operationalAreas', 'name code address.city address.state')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    data: {
      ngos,
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

// Get NGO by ID
export const getNGO = catchAsync(async (req, res, next) => {
  const ngo = await NGO.findById(req.params.id)
    .populate('adminUser', 'name email role phone')
    .populate('operationalAreas', 'name code address.city address.state boundaries')
    .populate('verifiedBy', 'name email role')
    .populate('users');

  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  // Get user statistics for this NGO
  const userStats = await User.aggregate([
    { $match: { ngo: ngo._id, isActive: true } },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get expired and expiring certifications
  const expiredCerts = ngo.getExpiredCertifications();
  const expiringSoonCerts = ngo.getCertificationsExpiringSoon();

  res.status(200).json({
    status: 'success',
    data: {
      ngo,
      userStats,
      certificationAlerts: {
        expired: expiredCerts,
        expiringSoon: expiringSoonCerts
      },
      auditStatus: {
        isAuditDue: ngo.isAuditDue(),
        nextAuditDate: ngo.nextAuditDate,
        lastAuditDate: ngo.lastAuditDate
      }
    }
  });
});

// Create new NGO
export const createNGO = catchAsync(async (req, res, next) => {
  // Check if user has permission to create NGO
  if (req.user.role !== 'admin') {
    return next(new AppError('Only admins can create NGOs', 403));
  }

  const ngo = await NGO.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      ngo
    }
  });
});

// Update NGO
export const updateNGO = catchAsync(async (req, res, next) => {
  const ngo = await NGO.findById(req.params.id);

  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      (!ngo.adminUser || ngo.adminUser.toString() !== req.user._id.toString())) {
    return next(new AppError('You do not have permission to update this NGO', 403));
  }

  const updatedNGO = await NGO.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('adminUser', 'name email role')
   .populate('operationalAreas', 'name code address.city address.state');

  res.status(200).json({
    status: 'success',
    data: {
      ngo: updatedNGO
    }
  });
});

// Delete NGO
export const deleteNGO = catchAsync(async (req, res, next) => {
  const ngo = await NGO.findById(req.params.id);

  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin') {
    return next(new AppError('Only admins can delete NGOs', 403));
  }

  // Check if NGO has users
  const userCount = await User.countDocuments({ ngo: req.params.id });
  if (userCount > 0) {
    return next(new AppError('Cannot delete NGO with associated users', 400));
  }

  await NGO.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Assign admin to NGO
export const assignAdmin = catchAsync(async (req, res, next) => {
  const { ngoId, userId } = req.params;

  // Check permissions
  if (req.user.role !== 'admin') {
    return next(new AppError('Only admins can assign NGO admins', 403));
  }

  const ngo = await NGO.findById(ngoId);
  const user = await User.findById(userId);

  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role !== 'ngo_user') {
    return next(new AppError('User must have ngo_user role', 400));
  }

  // Update NGO admin
  ngo.adminUser = userId;
  await ngo.save();

  // Update user's NGO reference
  user.ngo = ngoId;
  user.organization_name = ngo.name;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      ngo: await ngo.populate('adminUser', 'name email role')
    }
  });
});

// Get NGO users
export const getNGOUsers = catchAsync(async (req, res, next) => {
  const ngo = await NGO.findById(req.params.id);

  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      (!ngo.adminUser || ngo.adminUser.toString() !== req.user._id.toString()) &&
      req.user.ngo?.toString() !== req.params.id) {
    return next(new AppError('You do not have permission to view these users', 403));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const role = req.query.role || '';

  // Build query
  let query = {
    ngo: req.params.id,
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
      ngo,
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

// Add operational area to NGO
export const addOperationalArea = catchAsync(async (req, res, next) => {
  const { ngoId, municipalityId } = req.params;

  const ngo = await NGO.findById(ngoId);
  const municipality = await Municipality.findById(municipalityId);

  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  if (!municipality) {
    return next(new AppError('Municipality not found', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      (!ngo.adminUser || ngo.adminUser.toString() !== req.user._id.toString())) {
    return next(new AppError('You do not have permission to modify operational areas', 403));
  }

  await ngo.addOperationalArea(municipalityId);

  res.status(200).json({
    status: 'success',
    data: {
      ngo: await ngo.populate('operationalAreas', 'name code address.city address.state')
    }
  });
});

// Remove operational area from NGO
export const removeOperationalArea = catchAsync(async (req, res, next) => {
  const { ngoId, municipalityId } = req.params;

  const ngo = await NGO.findById(ngoId);

  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      (!ngo.adminUser || ngo.adminUser.toString() !== req.user._id.toString())) {
    return next(new AppError('You do not have permission to modify operational areas', 403));
  }

  await ngo.removeOperationalArea(municipalityId);

  res.status(200).json({
    status: 'success',
    data: {
      ngo: await ngo.populate('operationalAreas', 'name code address.city address.state')
    }
  });
});

// Verify NGO
export const verifyNGO = catchAsync(async (req, res, next) => {
  // Only admins can verify NGOs
  if (req.user.role !== 'admin') {
    return next(new AppError('Only admins can verify NGOs', 403));
  }

  const ngo = await NGO.findById(req.params.id);

  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  ngo.isVerified = true;
  ngo.verifiedBy = req.user._id;
  await ngo.save();

  res.status(200).json({
    status: 'success',
    data: {
      ngo: await ngo.populate('verifiedBy', 'name email role')
    }
  });
});

// Search NGOs near coordinates
export const findNearbyNGOs = catchAsync(async (req, res, next) => {
  const { longitude, latitude } = req.query;
  const maxDistance = parseInt(req.query.maxDistance) || 50000; // 50km default
  const focusArea = req.query.focusArea;

  if (!longitude || !latitude) {
    return next(new AppError('Longitude and latitude are required', 400));
  }

  let ngos = await NGO.findNear(
    parseFloat(longitude),
    parseFloat(latitude),
    maxDistance
  ).populate('adminUser', 'name email role')
   .populate('operationalAreas', 'name code');

  // Filter by focus area if specified
  if (focusArea && focusArea !== 'All') {
    ngos = ngos.filter(ngo => ngo.focusAreas.includes(focusArea));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ngos,
      searchLocation: {
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
        maxDistance,
        focusArea
      }
    }
  });
});

// Get NGO statistics
export const getNGOStatistics = catchAsync(async (req, res, next) => {
  // Only admins can view comprehensive statistics
  if (req.user.role !== 'admin') {
    return next(new AppError('Only admins can view NGO statistics', 403));
  }

  const statistics = await NGO.getStatistics();
  
  // Get additional statistics
  const ngosByType = await NGO.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  const ngosByFocusArea = await NGO.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$focusAreas' },
    { $group: { _id: '$focusAreas', count: { $sum: 1 } } }
  ]);

  const ngosByState = await NGO.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$address.state', count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: statistics[0] || {},
      breakdown: {
        byType: ngosByType,
        byFocusArea: ngosByFocusArea,
        byState: ngosByState
      }
    }
  });
});

// Add certification to NGO
export const addCertification = catchAsync(async (req, res, next) => {
  const ngo = await NGO.findById(req.params.id);

  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      (!ngo.adminUser || ngo.adminUser.toString() !== req.user._id.toString())) {
    return next(new AppError('You do not have permission to add certifications', 403));
  }

  ngo.certifications.push(req.body);
  await ngo.save();

  res.status(200).json({
    status: 'success',
    data: {
      ngo
    }
  });
});

// Remove certification from NGO
export const removeCertification = catchAsync(async (req, res, next) => {
  const { id, certificationId } = req.params;
  
  const ngo = await NGO.findById(id);

  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      (!ngo.adminUser || ngo.adminUser.toString() !== req.user._id.toString())) {
    return next(new AppError('You do not have permission to remove certifications', 403));
  }

  ngo.certifications = ngo.certifications.filter(
    cert => cert._id.toString() !== certificationId
  );
  await ngo.save();

  res.status(200).json({
    status: 'success',
    data: {
      ngo
    }
  });
});
