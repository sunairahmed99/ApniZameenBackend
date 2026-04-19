import HomePageBox from '../models/HomePageBox.js';

// @desc    Create a new homepage box
// @route   POST /api/homepage-boxes
// @access  Private/Admin
export const createBox = async (req, res) => {
    try {
        const { boxKey, title, order, isActive, sections } = req.body;

        const box = new HomePageBox({
            boxKey,
            title,
            order,
            isActive,
            sections
        });

        const createdBox = await box.save();
        res.status(201).json(createdBox);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all homepage boxes
// @route   GET /api/homepage-boxes
// @access  Public
export const getAllBoxes = async (req, res) => {
    try {
        const boxes = await HomePageBox.find({}).sort({ order: 1 }).lean();
        res.json(boxes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get box by ID
// @route   GET /api/homepage-boxes/:id
// @access  Public
export const getBoxById = async (req, res) => {
    try {
        const box = await HomePageBox.findById(req.params.id).lean();
        if (box) {
            res.json(box);
        } else {
            res.status(404).json({ message: 'Box not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update box
// @route   PUT /api/homepage-boxes/:id
// @access  Private/Admin
export const updateBox = async (req, res) => {
    try {
        const { boxKey, title, order, isActive, sections } = req.body;
        const box = await HomePageBox.findById(req.params.id);

        if (box) {
            box.boxKey = boxKey || box.boxKey;
            box.title = title || box.title;
            box.order = order !== undefined ? order : box.order;
            box.isActive = isActive !== undefined ? isActive : box.isActive;
            box.sections = sections || box.sections;

            const updatedBox = await box.save();
            res.json(updatedBox);
        } else {
            res.status(404).json({ message: 'Box not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete box
// @route   DELETE /api/homepage-boxes/:id
// @access  Private/Admin
export const deleteBox = async (req, res) => {
    try {
        const box = await HomePageBox.findById(req.params.id);

        if (box) {
            await box.deleteOne();
            res.json({ message: 'Box removed' });
        } else {
            res.status(404).json({ message: 'Box not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
