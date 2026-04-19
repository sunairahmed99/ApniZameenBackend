import BannerAd from '../models/BannerAd.js';
import Seller from '../models/Seller.js';
import BannerPlan from '../models/BannerPlan.js';

// Create a new banner request
export const createBannerRequest = async (req, res) => {
  try {


    const body = req.body || {};
    const { title, description, redirectUrl, startDate, duration, planId } = body;
    const sellerId = req.seller._id;

    let finalDuration = duration || 30;
    let finalAmount = 2000;

    if (planId) {
      const plan = await BannerPlan.findById(planId).lean();
      if (plan) {
        finalDuration = plan.durationInDays;
        finalAmount = plan.price;
      }
    }

    let bannerImage = '';
    let paymentScreenshot = '';

    if (req.files) {
      if (req.files.bannerImage) {
        bannerImage = req.files.bannerImage[0].path;
      }
      if (req.files.paymentScreenshot) {
        paymentScreenshot = req.files.paymentScreenshot[0].path;
      }
    }

    // Calculate end date based on start date and duration
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (parseInt(finalDuration) || 30));

    const newBannerAd = new BannerAd({
      seller: sellerId || undefined,
      title,
      description,
      bannerImage,
      redirectUrl,
      paymentScreenshot,
      startDate: start,
      endDate: end,
      duration: finalDuration,
      amount: finalAmount,
      planId: planId || undefined,
      status: 'pending',
      isActive: false
    });

    await newBannerAd.save();
    res.status(201).json(newBannerAd);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

// Get all banner requests (for admin)
export const getAllRequests = async (req, res) => {
  try {
    const requests = await BannerAd.find()
      .populate('seller', 'name email')
      .populate('planId', 'name price durationInDays')
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get requests by seller (for seller dashboard)
export const getSellerRequests = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const requests = await BannerAd.find({ seller: sellerId })
      .populate('planId', 'name price durationInDays')
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update request status (Approve/Reject)
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    const bannerAd = await BannerAd.findById(id);
    if (!bannerAd) {
      return res.status(404).json({ message: 'Banner request not found' });
    }

    bannerAd.status = status;

    // If approved, set isActive to true
    // Date-based filtering will happen when fetching public banners
    if (status === 'approved') {
      bannerAd.isActive = true;
    } else {
      bannerAd.isActive = false;
    }

    await bannerAd.save();
    res.status(200).json(bannerAd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active public banners (for homepage)
export const getPublicBanners = async (req, res) => {
  try {
    const now = new Date();


    // First, sync all approved banners' isActive status based on dates
    const allApprovedBanners = await BannerAd.find({ status: 'approved' });

    for (const banner of allApprovedBanners) {
      const shouldBeActive = now >= banner.startDate && now <= banner.endDate;

      // Only update if status needs to change
      if (banner.isActive !== shouldBeActive) {
        banner.isActive = shouldBeActive;
        await banner.save();

      }
    }

    // Now fetch only the banners that should be displayed
    const query = {
      status: 'approved',
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };


    const banners = await BannerAd.find(query).sort({ createdAt: -1 }).lean();


    res.status(200).json(banners);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

// Update banner request details (for seller)
export const updateBannerRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const { title, description, redirectUrl, startDate, duration } = body;

    const bannerAd = await BannerAd.findById(id);
    if (!bannerAd) {
      return res.status(404).json({ message: 'Banner request not found' });
    }

    if (bannerAd.status === 'approved') {
      return res.status(403).json({ message: 'Cannot edit approved requests' });
    }

    // Update fields
    if (title) bannerAd.title = title;
    if (description) bannerAd.description = description;
    if (redirectUrl) bannerAd.redirectUrl = redirectUrl;

    if (req.files) {
      if (req.files.bannerImage) {
        bannerAd.bannerImage = req.files.bannerImage[0].path;
      }
      if (req.files.paymentScreenshot) {
        bannerAd.paymentScreenshot = req.files.paymentScreenshot[0].path;
      }
    }

    if (startDate || duration) {
      const newStart = startDate ? new Date(startDate) : bannerAd.startDate;
      const newDuration = duration ? parseInt(duration) : bannerAd.duration;

      const newEnd = new Date(newStart);
      newEnd.setDate(newStart.getDate() + (newDuration || 30));

      bannerAd.startDate = newStart;
      bannerAd.duration = newDuration;
      bannerAd.endDate = newEnd;
    }

    // Reset status to pending if it was rejected? 
    // Usually if you edit a rejected request, it should go back to pending for review.
    if (bannerAd.status === 'rejected') {
      bannerAd.status = 'pending';
    }

    await bannerAd.save();
    res.status(200).json(bannerAd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Update Banner Request (Full Control)
export const updateBannerAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const { title, description, redirectUrl, isActive, status } = body;

    const bannerAd = await BannerAd.findById(id);
    if (!bannerAd) {
      return res.status(404).json({ message: 'Banner request not found' });
    }

    if (title) bannerAd.title = title;
    if (description) bannerAd.description = description;
    if (redirectUrl) bannerAd.redirectUrl = redirectUrl;

    // Explicit boolean check for isActive
    if (isActive !== undefined) {
      bannerAd.isActive = isActive === 'true' || isActive === true;
    }

    if (status) {
      bannerAd.status = status;
    }

    if (req.files) {
      if (req.files.bannerImage) {
        bannerAd.bannerImage = req.files.bannerImage[0].path;
      }
    }

    await bannerAd.save();
    res.status(200).json(bannerAd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBannerRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const bannerAd = await BannerAd.findById(id);

    if (!bannerAd) {
      return res.status(404).json({ message: 'Banner request not found' });
    }

    // Admin override: Removed status check
    await BannerAd.findByIdAndDelete(id);
    res.status(200).json({ message: 'Banner request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get requests by logged-in seller
export const getMyBannerRequests = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const requests = await BannerAd.find({ seller: sellerId })
      .populate('planId', 'name price durationInDays')
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


