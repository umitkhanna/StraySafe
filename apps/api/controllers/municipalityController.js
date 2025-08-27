import Municipality from '../models/Municipality.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Get all municipalities with pagination
export const getAllMunicipalities = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  // Build search query (moved from model static method)
  let query = { isActive: true };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { state: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } }
    ];
  }

  // Get total count and municipalities
  const totalItems = await Municipality.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  const municipalities = await Municipality.find(query)
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

// Get single municipality
export const getMunicipality = catchAsync(async (req, res, next) => {
  const municipality = await Municipality.findById(req.params.id);

  if (!municipality) {
    return next(new AppError('Municipality not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { municipality }
  });
});

// Create new municipality
export const createMunicipality = catchAsync(async (req, res, next) => {
  const municipality = await Municipality.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { municipality }
  });
});

// Update municipality
export const updateMunicipality = catchAsync(async (req, res, next) => {
  const municipality = await Municipality.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!municipality) {
    return next(new AppError('Municipality not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { municipality }
  });
});

// Delete municipality
export const deleteMunicipality = catchAsync(async (req, res, next) => {
  const municipality = await Municipality.findByIdAndDelete(req.params.id);

  if (!municipality) {
    return next(new AppError('Municipality not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
