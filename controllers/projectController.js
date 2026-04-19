import Project from '../models/Project.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all projects (with city filter)
// @route   GET /api/projects
// @access  Public
export const getAllProjects = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const matchQuery = {};

  if (city) {
    matchQuery.city = { $regex: new RegExp(city, 'i') };
  }

  const projects = await Project.aggregate([
    { $match: matchQuery },
    {
      $addFields: {
        randomSort: { $rand: {} }
      }
    },
    {
      $sort: {
        isHot: -1,
        isTrending: -1,
        randomSort: 1
      }
    }
  ]);
  res.json(projects);
});

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).lean();
  if (project) {
    res.json(project);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Get single project by slug
// @route   GET /api/projects/slug/:slug
// @access  Public
export const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug }).lean();
  if (project) {
    res.json(project);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (Admin/Seller)
export const createProject = asyncHandler(async (req, res) => {
  const projectData = { ...req.body };

  // Handle file uploads if they exist (Vite/Multer setup)
  if (req.files) {
    if (req.files.thumbnail) projectData.thumbnail = req.files.thumbnail[0].path;
    if (req.files.gallery) projectData.gallery = req.files.gallery.map(file => file.path);
    if (req.files.developerLogo) projectData['developer.logo'] = req.files.developerLogo[0].path;
    if (req.files.marketedByLogo) projectData['marketedBy.logo'] = req.files.marketedByLogo[0].path;
    if (req.files.projectFloorPlans) projectData.floorPlans = req.files.projectFloorPlans.map(file => ({ image: file.path }));
    if (req.files.projectPaymentPlans) projectData.projectPaymentPlans = req.files.projectPaymentPlans.map(file => file.path);
  }

  const project = new Project(projectData);
  const createdProject = await project.save();
  res.status(201).json(createdProject);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin/Seller)
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    const updateData = { ...req.body };

    // Handle nested fields explicitly if needed, or rely on Object.assign
    // Note: Mongoose might need more careful handling for nested objects

    if (req.files) {
      if (req.files.thumbnail) updateData.thumbnail = req.files.thumbnail[0].path;
      if (req.files.gallery) updateData.gallery = req.files.gallery.map(file => file.path);
      // ... (more complex handling for floorplans etc would go here)
    }

    Object.assign(project, updateData);
    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin/Seller)
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});
