import Banner from '../models/Banner.js';
import { clearCache } from '../middleware/cacheMiddleware.js';

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (req.app.get('mongoConnected') !== true) {
      // Return empty array instead of error for better UX

      return res.status(200).json([]);
    }

    const banners = await Banner.find().sort({ order: 1, createdAt: -1 }).lean();
    res.status(200).json(banners);
  } catch (error) {

    // Return empty array on error for better UX
    res.status(200).json([]);
  }
};

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Public
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id).lean();
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.status(200).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private (Admin)
export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, link, active, order } = req.body;
    let imagePath = '';

    if (req.file) {
      imagePath = req.file.path; // Cloudinary URL
    } else {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const banner = await Banner.create({
      image: imagePath,
      title,
      subtitle,
      link,
      active: active === 'true' || active === true, // Handle string from form-data
      order
    });

    clearCache();

    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private (Admin)
export const updateBanner = async (req, res) => {


  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {

      return res.status(404).json({ message: 'Banner not found' });
    }

    let updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.path; // Cloudinary URL
    }

    // Handle boolean conversion for active field if it comes as string
    if (updateData.active !== undefined) {
      updateData.active = updateData.active === 'true' || updateData.active === true;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    clearCache();

    res.status(200).json(updatedBanner);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private (Admin)
export const deleteBanner = async (req, res) => {

  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {

      return res.status(404).json({ message: 'Banner not found' });
    }

    await banner.deleteOne();

    clearCache();

    res.status(200).json({ message: 'Banner removed' });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};
