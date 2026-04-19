import BrowseSection from '../models/BrowseSection.js';

// @desc    Get all browse sections
// @route   GET /api/browse-sections
// @access  Public
export const getBrowseSections = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (req.app.get('mongoConnected') !== true) {
      // Return empty array instead of error for better UX

      return res.status(200).json([]);
    }

    const sections = await BrowseSection.find().sort({ order: 1, createdAt: -1 }).lean();
    res.status(200).json(sections);
  } catch (error) {

    // Return empty array on error for better UX
    res.status(200).json([]);
  }
};

// @desc    Get single browse section
// @route   GET /api/browse-sections/:id
// @access  Public
export const getBrowseSectionById = async (req, res) => {
  try {
    const section = await BrowseSection.findById(req.params.id).lean();
    if (!section) {
      return res.status(404).json({ message: 'Browse Section not found' });
    }
    res.status(200).json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a browse section
// @route   POST /api/browse-sections
// @access  Private (Admin)
export const createBrowseSection = async (req, res) => {
  try {
    const { category, section, title, groups, order, isActive } = req.body;

    const newSection = await BrowseSection.create({
      category,
      section,
      title,
      groups,
      order,
      isActive
    });

    res.status(201).json(newSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a browse section
// @route   PUT /api/browse-sections/:id
// @access  Private (Admin)
export const updateBrowseSection = async (req, res) => {
  try {
    const section = await BrowseSection.findById(req.params.id);

    if (!section) {
      return res.status(404).json({ message: 'Browse Section not found' });
    }

    const updatedSection = await BrowseSection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a browse section
// @route   DELETE /api/browse-sections/:id
// @access  Private (Admin)
export const deleteBrowseSection = async (req, res) => {
  try {
    const section = await BrowseSection.findById(req.params.id);

    if (!section) {
      return res.status(404).json({ message: 'Browse Section not found' });
    }

    await section.deleteOne();

    res.status(200).json({ message: 'Browse Section removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
