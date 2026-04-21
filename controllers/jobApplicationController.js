import asyncHandler from 'express-async-handler';
import JobApplication from '../models/JobApplication.js';

// @desc    Apply for a job
// @route   POST /api/job-applications
// @access  Public
const applyForJob = asyncHandler(async (req, res) => {
    const { job, name, email, phone, coverLetter } = req.body;

    if (!job || !name || !email || !phone) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    if (!req.file) {
        res.status(400);
        throw new Error('Please upload your CV');
    }

    const application = await JobApplication.create({
        job,
        name,
        email,
        phone,
        coverLetter,
        cvUrl: req.file.path // Cloudinary path
    });

    res.status(201).json(application);
});

// @desc    Get all job applications
// @route   GET /api/job-applications
// @access  Private/Admin
const getApplications = asyncHandler(async (req, res) => {
    const applications = await JobApplication.find({})
        .populate('job', 'title location company')
        .sort('-createdAt');
    
    res.status(200).json(applications);
});

// @desc    Update application status
// @route   PUT /api/job-applications/:id
// @access  Private/Admin
const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const application = await JobApplication.findById(req.params.id);

    if (!application) {
        res.status(404);
        throw new Error('Application not found');
    }

    application.status = status || application.status;
    const updatedApplication = await application.save();

    res.status(200).json(updatedApplication);
});

export {
    applyForJob,
    getApplications,
    updateApplicationStatus
};
