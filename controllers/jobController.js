import asyncHandler from 'express-async-handler';
import Job from '../models/jobModel.js';

// @desc    Get all jobs (Public - only active / Admin - all)
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
    // If admin, return all. If public, return only active.
    // For simplicity, we can validte 'isAdmin' from req.seller if strict,
    // but typically public endpoint just returns active.
    // Let's support a query param ?all=true for admin usage if needed, or checking token.

    // Check if Seller is admin to decide (middleware adds req.seller)
    // Actually simpler: Public endpoint /api/jobs returns active. 
    // Admin endpoint /api/jobs/admin returns all. 
    // Or just filter by query param if Seller is admin.

    // Let's return all for now and filter on frontend for Admin, 
    // OR better: default return active: true. Admin can request ?status=all

    const filter = { isActive: true };
    if (req.query.status === 'all' || req.query.isAdmin === 'true') {
        delete filter.isActive;
    }

    const jobs = await Job.find(filter).sort('-createdAt');
    res.status(200).json(jobs);
});

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Admin
const createJob = asyncHandler(async (req, res) => {
    const { title, department, location, type, salary, description } = req.body;

    if (!title || !department || !location) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    const job = await Job.create({
        title,
        department,
        location,
        type,
        salary,
        description
    });

    res.status(201).json(job);
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Admin
const updateJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json(updatedJob);
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    await job.deleteOne();

    res.status(200).json({ id: req.params.id });
});

export {
    getJobs,
    createJob,
    updateJob,
    deleteJob
};



