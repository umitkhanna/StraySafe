import NGO from '../models/NGO.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Get all NGOs with pagination
export const getAllNGOs = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  // Build search query (moved from model static method)
  let query = { isActive: true };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { registrationNumber: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  // Get total count and NGOs
  const totalItems = await NGO.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  const ngos = await NGO.find(query)
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

// Get single NGO
export const getNGO = catchAsync(async (req, res, next) => {
  const ngo = await NGO.findById(req.params.id);

  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { ngo }
  });
});

// Create new NGO
export const createNGO = catchAsync(async (req, res, next) => {
  const ngo = await NGO.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { ngo }
  });
});

// Update NGO
export const updateNGO = catchAsync(async (req, res, next) => {
  const ngo = await NGO.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { ngo }
  });
});

// Delete NGO
export const deleteNGO = catchAsync(async (req, res, next) => {
  const ngo = await NGO.findByIdAndDelete(req.params.id);

  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
