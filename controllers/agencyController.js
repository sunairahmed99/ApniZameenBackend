import Agency from '../models/Agency.js';
import FeaturedPlan from '../models/FeaturedPlan.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new agency
// @route   POST /api/agencies
// @access  Private (Seller)
// @access  Private (Seller)
const createAgency = asyncHandler(async (req, res) => {
  const { name, city, phone, email, description } = req.body;

  // Use logged-in Seller ID as owner
  const ownerId = req.seller._id;

  let logo = '';
  let image = '';

  if (req.files && req.files.logo && req.files.logo[0]) {
    logo = req.files.logo[0].path;
  }

  if (req.files && req.files.image && req.files.image[0]) {
    image = req.files.image[0].path;
  }

  // Check if Seller already has an agency? (Optional validation)

  const agency = await Agency.create({
    ownerId, // Assumes provided by frontend or auth middleware
    name,
    city,
    phone,
    email,
    description,
    logo,
    image
  });

  res.status(201).json(agency);
});

// @desc    Get all agencies (with filters)
// @route   GET /api/agencies
// @access  Public
const getAllAgencies = asyncHandler(async (req, res) => {
  const { featured, titanium, city, status } = req.query;
  const matchQuery = {};

  if (status && status !== 'all') {
    matchQuery.status = status;
  }
  // Remove the default 'active' filter for general list requests if not specified, 
  // or handle it specifically for public vs admin if needed.
  // For now, let's allow all if status is not provided to help Admin see pending.

  if (city) {
    matchQuery.city = { $regex: new RegExp(city, 'i') };
  }

  if (featured === 'true') {
    matchQuery.isFeatured = true;
    matchQuery.featuredEndDate = { $gte: new Date() };
  }

  if (titanium === 'true') {
    matchQuery.isTitanium = true;
    matchQuery.titaniumEndDate = { $gte: new Date() };
  }

  const agencies = await Agency.aggregate([
    { $match: matchQuery },
    {
      $lookup: {
        from: 'properties',
        localField: '_id',
        foreignField: 'agencyId',
        as: 'properties'
      }
    },
    {
      $addFields: {
        forSale: {
          $size: {
            $filter: {
              input: '$properties',
              as: 'prop',
              cond: { $eq: ['$$prop.purpose', 'For Sale'] }
            }
          }
        },
        forRent: {
          $size: {
            $filter: {
              input: '$properties',
              as: 'prop',
              cond: { $eq: ['$$prop.purpose', 'For Rent'] }
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'sellers',
        localField: 'ownerId',
        foreignField: '_id',
        as: 'owner'
      }
    },
    { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        properties: 0,
        'owner.password': 0,
        'owner.otp': 0
      }
    },
    {
      $addFields: {
        randomSort: { $rand: {} }
      }
    },
    { $sort: { isTitanium: -1, isFeatured: -1, randomSort: 1 } }
  ]);

  res.json(agencies);
});

// @desc    Get agency counts by city
// @route   GET /api/agencies/stats/by-city
// @access  Public
const getAgencyStatsByCity = asyncHandler(async (req, res) => {
  const stats = await Agency.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$city',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        name: '$_id',
        count: 1,
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);
  res.json(stats);
});

// @desc    Get single agency
// @route   GET /api/agencies/:id
// @access  Public
const getAgencyById = asyncHandler(async (req, res) => {
  const agency = await Agency.findById(req.params.id).populate('ownerId', 'name email').lean();
  if (agency) {
    res.json(agency);
  } else {
    res.status(404);
    throw new Error('Agency not found');
  }
});

// @desc    Approve agency
// @route   PUT /api/agencies/:id/approve
// @access  Private (Admin)
const approveAgency = asyncHandler(async (req, res) => {
  const agency = await Agency.findById(req.params.id);

  if (agency) {
    agency.status = 'active';
    const updatedAgency = await agency.save();
    res.json(updatedAgency);
  } else {
    res.status(404);
    throw new Error('Agency not found');
  }
});

// @desc    Reject agency
// @route   PUT /api/agencies/:id/reject
// @access  Private (Admin)
const rejectAgency = asyncHandler(async (req, res) => {
  const agency = await Agency.findById(req.params.id);

  if (agency) {
    agency.status = 'rejected';
    const updatedAgency = await agency.save();
    res.json(updatedAgency);
  } else {
    res.status(404);
    throw new Error('Agency not found');
  }
});

// @desc    Deactivate agency
// @route   PUT /api/agencies/:id/deactivate
// @access  Private (Admin)
const deactivateAgency = asyncHandler(async (req, res) => {
  const agency = await Agency.findById(req.params.id);

  if (agency) {
    agency.status = 'inactive';
    const updatedAgency = await agency.save();
    res.json(updatedAgency);
  } else {
    res.status(404);
    throw new Error('Agency not found');
  }
});

// @desc    Upgrade Agency to Featured
// @route   POST /api/agencies/:id/upgrade
// @access  Private (Seller/Admin)
const upgradeAgency = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const agency = await Agency.findById(req.params.id);

  if (!agency) {
    res.status(404);
    throw new Error('Agency not found');
  }

  const plan = await FeaturedPlan.findById(planId);
  if (!plan) {
    res.status(404);
    throw new Error('Plan not found');
  }

  // Calculate new end date
  // If already featured and not expired, extend? Or reset?
  // Let's assume start from now or extend if logic needed.
  // For simplicity: Start from NOW (or extend if valid)

  let startDate = new Date();
  if (agency.isFeatured && agency.featuredEndDate > new Date()) {
    startDate = agency.featuredEndDate;
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + plan.durationInDays);

  agency.isFeatured = true;
  agency.featuredEndDate = endDate;
  agency.featuredPlanId = plan._id;

  const updatedAgency = await agency.save();

  res.json({
    message: `Agency upgraded to featured until ${endDate}`,
    agency: updatedAgency
  });
});

import UpgradeRequest from '../models/UpgradeRequest.js';

// ... existing code ...

// @desc    Create Upgrade Request
// @route   POST /api/agencies/upgrade-request
// @access  Private (Seller)
const createUpgradeRequest = asyncHandler(async (req, res) => {
  const { agencyId, planId } = req.body;
  let paymentImage = '';

  if (req.files && req.files.paymentImage && req.files.paymentImage[0]) {
    paymentImage = req.files.paymentImage[0].path;
  }

  if (!paymentImage) {
    res.status(400);
    throw new Error('Payment screenshot is required');
  }

  const request = await UpgradeRequest.create({
    agencyId,
    planId,
    paymentImage
  });

  res.status(201).json(request);
});

// @desc    Get All Upgrade Requests
// @route   GET /api/agencies/upgrade-requests
// @access  Private (Admin)
const getAllUpgradeRequests = asyncHandler(async (req, res) => {
  const requests = await UpgradeRequest.find()
    .populate('agencyId', 'name logo')
    .populate('planId', 'name price durationInDays')
    .sort({ createdAt: -1 })
    .lean();
  res.json(requests);
});

// @desc    Approve Upgrade Request
// @route   PUT /api/agencies/upgrade-requests/:id/approve
// @access  Private (Admin)
const approveUpgradeRequest = asyncHandler(async (req, res) => {
  const request = await UpgradeRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  if (request.status === 'approved') {
    res.status(400);
    throw new Error('Request already approved');
  }

  request.status = 'approved';
  await request.save();

  // Perform the actual upgrade logic
  const agency = await Agency.findById(request.agencyId);
  const plan = await FeaturedPlan.findById(request.planId);

  if (agency && plan) {
    let startDate = new Date();
    const isTitaniumPlan = plan.name.toLowerCase().includes('titanium');

    if (isTitaniumPlan) {
      if (agency.isTitanium && agency.titaniumEndDate > new Date()) {
        startDate = agency.titaniumEndDate;
      }
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationInDays);
      agency.isTitanium = true;
      agency.titaniumEndDate = endDate;
    } else {
      if (agency.isFeatured && agency.featuredEndDate > new Date()) {
        startDate = agency.featuredEndDate;
      }
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationInDays);
      agency.isFeatured = true;
      agency.featuredEndDate = endDate;
      agency.featuredPlanId = plan._id;
    }
    await agency.save();
  }

  res.json({ message: 'Request Approved and Agency Upgraded', request });
});

// @desc    Reject Upgrade Request
// @route   PUT /api/agencies/upgrade-requests/:id/reject
// @access  Private (Admin)
const rejectUpgradeRequest = asyncHandler(async (req, res) => {
  const request = await UpgradeRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  request.status = 'rejected';
  await request.save();

  res.json({ message: 'Request Rejected', request });
});

// @desc    Delete Upgrade Request
// @route   DELETE /api/agencies/upgrade-requests/:id
// @access  Private (Admin)
const deleteUpgradeRequest = asyncHandler(async (req, res) => {
  const request = await UpgradeRequest.findById(req.params.id);

  if (request) {
    await request.deleteOne();
    res.json({ message: 'Request removed' });
  } else {
    res.status(404);
    throw new Error('Request not found');
  }
});

// @desc    Update an agency
// @route   PUT /api/agencies/:id
// @access  Private (Seller/Admin)
const updateAgency = asyncHandler(async (req, res) => {
  const agency = await Agency.findById(req.params.id);

  if (!agency) {
    res.status(404);
    throw new Error('Agency not found');
  }

  const { name, city, phone, email, description } = req.body;

  agency.name = name || agency.name;
  agency.city = city || agency.city;
  agency.phone = phone || agency.phone;
  agency.email = email || agency.email;
  agency.description = description || agency.description;

  if (req.body.planId) {
    const plan = await FeaturedPlan.findById(req.body.planId);
    if (plan) {
      let startDate = new Date();
      if (agency.isFeatured && agency.featuredEndDate > new Date()) {
        startDate = agency.featuredEndDate;
      }
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationInDays);

      agency.isFeatured = true;
      agency.featuredEndDate = endDate;
      agency.featuredPlanId = plan._id;
    }
  }

  if (req.files && req.files.logo && req.files.logo[0]) {
    agency.logo = req.files.logo[0].path;
  }

  if (req.files && req.files.image && req.files.image[0]) {
    agency.image = req.files.image[0].path;
  }

  const updatedAgency = await agency.save();
  res.json(updatedAgency);
});

// @desc    Delete an agency
// @route   DELETE /api/agencies/:id
// @access  Private (Seller/Admin)
const deleteAgency = asyncHandler(async (req, res) => {
  const agency = await Agency.findById(req.params.id);

  if (agency) {
    await agency.deleteOne();
    res.json({ message: 'Agency removed' });
  } else {
    res.status(404);
    throw new Error('Agency not found');
  }
});

// @desc    Get logged-in Seller's agencies
// @route   GET /api/agencies/my-agencies
// @access  Private (Seller/Admin)
const getMyAgencies = asyncHandler(async (req, res) => {
  const pageInput = req.query.page;
  const limitInput = req.query.limit;

  const page = Number(pageInput) || 1;
  const limit = Number(limitInput) || 1000; // Large default for "My" views to support client-side filtering
  const skip = (page - 1) * limit;

  const { search, status, city, sortBy } = req.query;

  // Build Filter Query
  const matchQuery = { ownerId: req.seller._id };

  // Helper for valid filters
  const isValid = (val) => val && val !== '' && val !== 'null' && val !== 'undefined';

  if (isValid(search)) {
    // Escape regex special characters to prevent crashes/errors
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    matchQuery.name = { $regex: escapedSearch, $options: 'i' };
  }

  if (isValid(status)) {
    matchQuery.status = status;
  }

  if (isValid(city)) {
    if (city !== 'All Cities' && city !== '') {
      const escapedCity = city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      matchQuery.city = { $regex: escapedCity, $options: 'i' };
    }
  }

  // Build Sort Query
  let sortQuery = { createdAt: -1 };
  if (sortBy === 'oldest') {
    sortQuery = { createdAt: 1 };
  } else if (sortBy === 'name') {
    sortQuery = { name: 1 };
  }

  try {
    const count = await Agency.countDocuments(matchQuery);
    const agencies = await Agency.find(matchQuery)
      .populate('ownerId', 'name email')
      .sort(sortQuery)
      .limit(limit)
      .skip(skip)
      .lean();

    res.json({
      agencies,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching agencies', error: error.message });
  }
});

export {
  createAgency,
  getAllAgencies,
  getAgencyStatsByCity,
  getMyAgencies,
  getAgencyById,
  approveAgency,
  rejectAgency,
  upgradeAgency,
  createUpgradeRequest,
  getAllUpgradeRequests,
  approveUpgradeRequest,
  rejectUpgradeRequest,
  deleteUpgradeRequest,
  updateAgency,
  deleteAgency,
  deactivateAgency
};



