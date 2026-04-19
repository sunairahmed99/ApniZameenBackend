import Blog from '../models/Blog.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getAllBlogs = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 9;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Blog.countDocuments();
    const blogs = await Blog.find()
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        blogs,
        page,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

// @desc    Get single blog by ID
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (blog) {
        res.json(blog);
    } else {
        res.status(404);
        throw new Error('Blog not found');
    }
});

// @desc    Get single blog by slug
// @route   GET /api/blogs/slug/:slug
// @access  Public
export const getBlogBySlug = asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (blog) {
        res.json(blog);
    } else {
        res.status(404);
        throw new Error('Blog not found');
    }
});

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private (Admin)
export const createBlog = asyncHandler(async (req, res) => {
    const blogData = { ...req.body };

    if (req.file) {
        blogData.thumbnail = req.file.path; // Cloudinary path
    }

    const blog = new Blog(blogData);
    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
});

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin)
export const updateBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (blog) {
        const updateData = { ...req.body };

        if (req.file) {
            updateData.thumbnail = req.file.path;
        }

        Object.assign(blog, updateData);
        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    } else {
        res.status(404);
        throw new Error('Blog not found');
    }
});

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin)
export const deleteBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (blog) {
        await blog.deleteOne();
        res.json({ message: 'Blog removed' });
    } else {
        res.status(404);
        throw new Error('Blog not found');
    }
});
