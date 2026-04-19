import Property from "../models/Property.js";
import Seller from "../models/Seller.js";
import Agency from "../models/Agency.js";
import PropertyPlan from "../models/PropertyPlan.js";
import SubscriptionRequest from "../models/SubscriptionRequest.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Inquiry from "../models/Inquiry.js";

// Create Property
export const createProperty = async (req, res) => {
  try {
    const { sellerId, subscriptionId } = req.body;
    if (!sellerId)
      return res.status(400).json({ message: "Seller ID is required" });

    let seller = await Seller.findById(sellerId).populate('currentDeal');
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }



    let targetSubscription = null;
    if (subscriptionId) {
      targetSubscription = await SubscriptionRequest.findById(subscriptionId).populate('dealId');
      if (!targetSubscription) return res.status(404).json({ message: "Subscription not found" });
      if (targetSubscription.status !== 'approved') return res.status(400).json({ message: "Selected subscription is not approved" });
    }

    // Prepare property data
    const propertyData = { ...req.body };

    // Handle nested area object from FormData if they come as area[value] etc.
    if (req.body['area[value]'] || req.body['area[unit]']) {
      propertyData.area = {
        value: req.body['area[value]'],
        unit: req.body['area[unit]']
      };
      // Remove the flat keys
      delete propertyData['area[value]'];
      delete propertyData['area[unit]'];
    }

    // Check Plan Logic
    if (seller.isUnlimited) {

    } else {
      if (targetSubscription) {
        // Check specific subscription quota
        if (targetSubscription.quotaRemaining <= 0) {
          return res.status(403).json({
            message: "This package has 0 properties remaining. Please select another package or buy a new one.",
            quotaExceeded: true
          });
        }
        if (targetSubscription.expiryDate && new Date() > new Date(targetSubscription.expiryDate)) {
          return res.status(403).json({ message: "Selected package has expired." });
        }
      } else {
        // Fallback to global seller quota if no specific subscription selected
        const remaining = Number(seller.quotaRemaining) || 0;


        if (remaining <= 0) {
          return res.status(403).json({
            message: "All your packages quotas are exhausted. Please buy a new package to list more properties.",
            quotaExceeded: true
          });
        }

        if (seller.quotaExpiry && new Date() > new Date(seller.quotaExpiry)) {
          return res.status(403).json({
            message: "Global plan expired. Please renew your subscription.",
            quotaExceeded: true
          });
        }
      }
    }

    const newProperty = new Property({
      ...propertyData,
      isFeatured: targetSubscription ? targetSubscription.dealId?.planType === 'featured' : seller.currentDeal?.planType === 'featured',
      expiryDate: targetSubscription ? targetSubscription.expiryDate : seller.quotaExpiry
    });

    // Decrement Quota
    if (!seller.isUnlimited) {
      if (targetSubscription) {
        targetSubscription.quotaRemaining = Math.max(0, targetSubscription.quotaRemaining - 1);
        await targetSubscription.save();
      }

      // Also decrement global as fallback/sync
      const oldQuota = seller.quotaRemaining;
      seller.quotaRemaining = Math.max(0, (Number(seller.quotaRemaining) || 0) - 1);

      await seller.save();
    }

    if (req.files) {
      if (req.files.images) {
        newProperty.images = req.files.images.map((f) => f.path);
      }
      if (req.files.video) {
        newProperty.video = req.files.video[0].path;
      }
    }
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Properties (for public/search with filters)
export const getProperties = async (req, res) => {
  try {
    const { city, purpose, type, category, minPrice, maxPrice, search, location, sellerId, featured } = req.query;

    const queryParts = [{ status: "approved" }];

    if (sellerId) queryParts.push({ sellerId });
    if (featured === 'true') queryParts.push({ isFeatured: true });

    if (city) queryParts.push({ city: { $regex: new RegExp(`^${city}$`, "i") } });

    // Broad location/area match (Checks areaName, blockName, and address)
    if (location) {
      const locationStr = Array.isArray(location) ? location[0] : location;
      let cleanLoc = locationStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/[-_\s]+/g, '[-\\s_]+')
        .replace(/([a-zA-Z])([0-9])/g, '$1[-\\s_]*$2')
        .replace(/([0-9])([a-zA-Z])/g, '$1[-\\s_]*$2');

      queryParts.push({
        $or: [
          { areaName: { $regex: cleanLoc, $options: 'i' } },
          { blockName: { $regex: cleanLoc, $options: 'i' } },
          { address: { $regex: cleanLoc, $options: 'i' } }
        ]
      });
    }

    // Map frontend terms to database values
    if (purpose) {
      const p = purpose.toLowerCase();
      let mappedPurpose;
      if (p === "buy" || p === "sale" || p === "for sale") mappedPurpose = "For Sale";
      else if (p === "rent" || p === "for rent") mappedPurpose = "For Rent";
      
      if (mappedPurpose) {
        queryParts.push({ purpose: mappedPurpose });
      } else {
        queryParts.push({ purpose: { $regex: new RegExp(`^${purpose}$`, "i") } });
      }
    }

    // Handle category parameter (HOMES, PLOTS, COMMERCIAL)
    if (category) {
      const c = category.toUpperCase();
      if (c === "HOMES") {
        queryParts.push({ propertyType: { $in: ["House", "Flat", "Upper Portion", "Lower Portion", "Farm House", "Room", "Penthouse"] } });
      } else if (c === "PLOTS") {
        queryParts.push({ propertyType: "Plot" });
      } else if (c === "COMMERCIAL") {
        queryParts.push({ propertyType: "Commercial" });
      }
    }
    // Handle specific type parameter (overrides category if both present)
    else if (type) {
      const t = type.toLowerCase();
      let typeCondition;
      if (t === "homes" || t === "home") {
        typeCondition = { propertyType: { $in: ["House", "Flat", "Upper Portion", "Lower Portion", "Farm House", "Room", "Penthouse"] } };
      }
      else if (t === "plots" || t === "plot") {
        typeCondition = { propertyType: "Plot" };
      }
      else if (t === "commercials" || t === "commercial") {
        typeCondition = { propertyType: "Commercial" };
      }
      else if (t === "flats" || t === "flat") typeCondition = { propertyType: "Flat" };
      else if (t === "house") typeCondition = { propertyType: "House" };
      else if (t === "upper portion") typeCondition = { propertyType: "Upper Portion" };
      else if (t === "lower portion") typeCondition = { propertyType: "Lower Portion" };
      else if (t === "farm house") typeCondition = { propertyType: "Farm House" };
      else if (t === "room") typeCondition = { propertyType: "Room" };
      else if (t === "penthouse") typeCondition = { propertyType: "Penthouse" };
      else typeCondition = { propertyType: { $regex: new RegExp(`^${type}$`, "i") } };

      if (typeCondition) queryParts.push(typeCondition);
    }

    if (minPrice || maxPrice) {
      const priceCond = {};
      if (minPrice) priceCond.$gte = Number(minPrice);
      if (maxPrice) priceCond.$lte = Number(maxPrice);
      queryParts.push({ price: priceCond });
    }

    // Strict Area Size Filter (e.g. from Homepage types)
    const { areaSize, areaUnit, areaMin, areaMax } = req.query;
    if (areaSize) {
      queryParts.push({ 'area.value': Number(areaSize) });
    }
    if (areaUnit) {
      queryParts.push({ 'area.unit': { $regex: new RegExp(`^${areaUnit}$`, "i") } });
    }

    // Area Range Filter (Search Bar)
    if (areaMin || areaMax) {
      if (!req.query.areaSize) { // Only if not strict
        const areaCond = {};
        if (areaMin) areaCond.$gte = Number(areaMin);
        if (areaMax && areaMax !== 'Any') areaCond.$lte = Number(areaMax);
        if (Object.keys(areaCond).length > 0) {
          queryParts.push({ 'area.value': areaCond });
        }
      }
    }

    if (search) {
      const searchStr = Array.isArray(search) ? search[0] : search;
      let cleanSearch = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      cleanSearch = cleanSearch
        .replace(/[-_\s]+/g, '[-\\s_]+')
        .replace(/([a-zA-Z])([0-9])/g, '$1[-\\s_]*$2')
        .replace(/([0-9])([a-zA-Z])/g, '$1[-\\s_]*$2');

      queryParts.push({
        $or: [
          { areaName: { $regex: cleanSearch, $options: 'i' } },
          { city: { $regex: cleanSearch, $options: 'i' } },
          { title: { $regex: cleanSearch, $options: 'i' } }
        ]
      });
    }

    // Combine all parts into a final query
    const query = queryParts.length > 1 ? { $and: queryParts } : queryParts[0];

    // Limit results
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;

    // BROAD SEARCH RANDOMIZATION
    const isBroadSearch = city && !type && !category && !location && !search && !minPrice && !maxPrice;
    
    const pipeline = [
      { $match: query },
      ...(isBroadSearch ? [{ $sample: { size: limit } }] : []),
      {
        $sort: (isBroadSearch ? {
          isBoosted: -1,
          isFeatured: -1,
        } : {
          isBoosted: -1,
          isFeatured: -1,
          createdAt: -1
        })
      },
      { $limit: limit }, 
      {
        $lookup: {
          from: 'sellers',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'agencies',
          localField: 'seller._id',
          foreignField: 'ownerId',
          as: 'agency'
        }
      },
      { $unwind: { path: '$agency', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          price: 1,
          city: 1,
          areaName: 1,
          location: 1,
          images: 1,
          bedrooms: 1,
          bathrooms: 1,
          beds: '$bedrooms',
          baths: '$bathrooms',
          area: 1,
          sizeRange: 1,
          description: 1,
          sellerId: {
            _id: '$seller._id',
            name: '$seller.name',
            email: '$seller.email',
            phone: '$seller.phone'
          },
          agency: {
            _id: '$agency._id',
            name: '$agency.name'
          },
          purpose: 1,
          propertyType: 1,
          slug: 1,
          createdAt: 1,
          isBoosted: 1,
          isFeatured: 1,
          seller: {
            name: '$seller.name'
          }
        }
      }
    ];

    const properties = await Property.aggregate(pipeline).allowDiskUse(true);
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

// Get Search Counts (Aggregate by Property Type)
export const getSearchCounts = async (req, res) => {
  try {
    const { city, purpose, type, category, minPrice, maxPrice, search, location, sellerId, featured } = req.query;

    const queryParts = [{ status: "approved" }];

    if (sellerId) queryParts.push({ sellerId });
    if (city) queryParts.push({ city: { $regex: new RegExp(`^${city}$`, "i") } });

    if (location) {
      const locationStr = Array.isArray(location) ? location[0] : location;
      let cleanLoc = locationStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/[-_\s]+/g, '[-\\s_]+')
        .replace(/([a-zA-Z])([0-9])/g, '$1[-\\s_]*$2')
        .replace(/([0-9])([a-zA-Z])/g, '$1[-\\s_]*$2');

      queryParts.push({
        $or: [
          { areaName: { $regex: cleanLoc, $options: 'i' } },
          { blockName: { $regex: cleanLoc, $options: 'i' } },
          { address: { $regex: cleanLoc, $options: 'i' } }
        ]
      });
    }

    if (purpose) {
      const p = purpose.toLowerCase();
      let mappedPurpose;
      if (p === "buy" || p === "sale" || p === "for sale") mappedPurpose = "For Sale";
      else if (p === "rent" || p === "for rent") mappedPurpose = "For Rent";
      
      if (mappedPurpose) {
        queryParts.push({ purpose: mappedPurpose });
      } else {
        queryParts.push({ purpose: { $regex: new RegExp(`^${purpose}$`, "i") } });
      }
    }

    if (category) {
      const c = category.toUpperCase();
      if (c === "HOMES") {
        queryParts.push({ propertyType: { $in: ["House", "Flat", "Upper Portion", "Lower Portion", "Farm House", "Room", "Penthouse"] } });
      } else if (c === "PLOTS") {
        queryParts.push({ propertyType: "Plot" });
      } else if (c === "COMMERCIAL") {
        queryParts.push({ propertyType: "Commercial" });
      }
    }
    else if (type) {
      const t = type.toLowerCase();
      let typeCondition;
      if (t === "homes" || t === "home") {
        typeCondition = { propertyType: { $in: ["House", "Flat", "Upper Portion", "Lower Portion", "Farm House", "Room", "Penthouse"] } };
      }
      else if (t === "plots" || t === "plot") {
        typeCondition = { propertyType: "Plot" };
      }
      else if (t === "commercials" || t === "commercial") {
        typeCondition = { propertyType: "Commercial" };
      }
      else if (t === "flats" || t === "flat") typeCondition = { propertyType: "Flat" };
      else if (t === "house") typeCondition = { propertyType: "House" };
      else if (t === "upper portion") typeCondition = { propertyType: "Upper Portion" };
      else if (t === "lower portion") typeCondition = { propertyType: "Lower Portion" };
      else if (t === "farm house") typeCondition = { propertyType: "Farm House" };
      else if (t === "room") typeCondition = { propertyType: "Room" };
      else if (t === "penthouse") typeCondition = { propertyType: "Penthouse" };
      else typeCondition = { propertyType: { $regex: new RegExp(`^${type}$`, "i") } };

      if (typeCondition) queryParts.push(typeCondition);
    }

    if (minPrice || maxPrice) {
      const priceCond = {};
      if (minPrice) priceCond.$gte = Number(minPrice);
      if (maxPrice) priceCond.$lte = Number(maxPrice);
      queryParts.push({ price: priceCond });
    }

    const { areaSize, areaUnit, areaMin, areaMax } = req.query;
    if (areaSize) {
      queryParts.push({ 'area.value': Number(areaSize) });
    }
    if (areaUnit) {
      queryParts.push({ 'area.unit': { $regex: new RegExp(`^${areaUnit}$`, "i") } });
    }

    if (areaMin || areaMax) {
      if (!req.query.areaSize) {
        const areaCond = {};
        if (areaMin) areaCond.$gte = Number(areaMin);
        if (areaMax && areaMax !== 'Any') areaCond.$lte = Number(areaMax);
        if (Object.keys(areaCond).length > 0) {
          queryParts.push({ 'area.value': areaCond });
        }
      }
    }

    if (search) {
      const searchStr = Array.isArray(search) ? search[0] : search;
      let cleanSearch = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      cleanSearch = cleanSearch
        .replace(/[-_\s]+/g, '[-\\s_]+') 
        .replace(/([a-zA-Z])([0-9])/g, '$1[-\\s_]*$2') 
        .replace(/([0-9])([a-zA-Z])/g, '$1[-\\s_]*$2');

      queryParts.push({
        $or: [
          { areaName: { $regex: cleanSearch, $options: 'i' } },
          { city: { $regex: cleanSearch, $options: 'i' } },
          { title: { $regex: cleanSearch, $options: 'i' } }
        ]
      });
    }

    const query = queryParts.length > 1 ? { $and: queryParts } : queryParts[0];

    const counts = await Property.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$propertyType",
          count: { $sum: 1 }
        }
      }
    ]);

    const countsMap = {};
    let total = 0;

    counts.forEach(item => {
      const key = item._id || 'Other';
      countsMap[key] = item.count;
      total += item.count;
    });

    countsMap['All'] = total;
    res.status(200).json(countsMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get All (including pending)
export const adminGetProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let matchStage = {};

    // 1. Build Match Stage (Filter)
    if (search) {
      // Escape special regex characters
      let cleanSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Make search fuzzy for hyphens and spaces
      cleanSearch = cleanSearch
        .replace(/[-_\s]+/g, '[-\\s_]+') 
        .replace(/([a-zA-Z])([0-9])/g, '$1[-\\s_]*$2') 
        .replace(/([0-9])([a-zA-Z])/g, '$1[-\\s_]*$2');

      matchStage = {
        $or: [
          { title: { $regex: cleanSearch, $options: 'i' } },
          { city: { $regex: cleanSearch, $options: 'i' } },
          { propertyType: { $regex: cleanSearch, $options: 'i' } },
          { purpose: { $regex: cleanSearch, $options: 'i' } },
          { areaName: { $regex: cleanSearch, $options: 'i' } } // Added areaName
        ]
      };
    }

    // 2. Get Count (Efficiently)
    const total = await Property.countDocuments(matchStage);

    // 3. Pipeline with Sort -> Skip -> Limit -> Lookup (OPTIMIZED)
    const pipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      // Lookups only on the page items
      {
        $lookup: {
          from: 'sellers',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'agencies',
          localField: 'seller._id',
          foreignField: 'ownerId',
          as: 'agency'
        }
      },
      { $unwind: { path: '$agency', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          images: 1,
          propertyType: 1,
          purpose: 1,
          city: 1,
          state: 1,
          price: 1,
          status: 1,
          isBoosted: 1,
          isFeatured: 1,
          createdAt: 1,
          whatsapp: 1,
          email: 1,
          'seller.name': 1,
          'seller.phone': 1,
          'agency.name': 1,
          'agency.phone': 1
        }
      }
    ];

    const properties = await Property.aggregate(pipeline);

    res.status(200).json({
      properties,
      totalProperties: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Property Status/Boost
export const updatePropertyAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Property.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Property Details (Seller) — handles both full edit (PUT) and status-only (PATCH)
export const updatePropertySeller = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller._id; // Property.sellerId = Seller._id (set by frontend at creation)

    // Verify property belongs to this seller
    const property = await Property.findOne({ _id: id, sellerId });
    if (!property) {
      return res.status(404).json({ message: "Property not found or you are not authorized to edit it" });
    }

    const propertyData = { ...req.body };

    // Remove internal/protected fields that seller should not change
    delete propertyData.sellerId;
    delete propertyData.isBoosted;
    delete propertyData.isFeatured;
    delete propertyData.planId;
    delete propertyData.expiryDate;
    delete propertyData.keptImages;
    delete propertyData['area[value]'];
    delete propertyData['area[unit]'];

    // Only allow status update via PATCH, not via PUT (full edit)
    if (req.method === 'PUT') {
      delete propertyData.status;
    }

    // Handle area fields from FormData
    const areaValue = req.body['area[value]'];
    const areaUnit = req.body['area[unit]'];
    if (areaValue || areaUnit) {
      propertyData.area = {
        value: areaValue || property.area?.value,
        unit: areaUnit || property.area?.unit
      };
    }

    // Handle images: merge kept existing + new uploads
    let keptImages = [];
    if (req.body.keptImages) {
      try {
        keptImages = JSON.parse(req.body.keptImages);
      } catch (_) {
        keptImages = Array.isArray(req.body.keptImages) ? req.body.keptImages : [];
      }
    }

    const newUploadedImages = (req.files?.images || []).map(f => f.path);
    const mergedImages = [...keptImages, ...newUploadedImages].slice(0, 7);
    if (mergedImages.length > 0) propertyData.images = mergedImages;

    // Replace video only if new one uploaded
    if (req.files?.video?.length > 0) {
      propertyData.video = req.files.video[0].path;
    }

    const updatedProperty = await Property.findByIdAndUpdate(id, propertyData, { new: true });
    res.status(200).json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Property
export const deleteProperty = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Property Types Configuration
export const getPropertyTypes = async (req, res) => {
  try {
    const config = {
      types: {
        House: ['House'],
        Flat: ['Flat'],
        Portion: ['Lower Portion', 'Upper Portion'],
        'Farm House': ['Farm House'],
        Plots: ['All', 'Residential Plot', 'Commercial Plot', 'Agricultural Land', 'Industrial Land'],
        Commercial: ['All', 'Office', 'Shop', 'Warehouse', 'Factory', 'Building']
      },
      priceRange: { min: 0, max: 5000000000 },
      areaRange: { min: 0, max: 5000 }
    };
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific counts for footer/popular locations
export const getPropertyCounts = async (req, res) => {
  try {
    const { locations, types, purposes, areas } = req.query;

    const locArr = locations ? locations.split(',') : ['Lahore', 'Karachi', 'Islamabad'];
    const typeArr = types ? types.split(',') : ['House', 'Flat', 'Plot'];
    const purposeArr = purposes ? purposes.split(',') : ['For Sale', 'For Rent'];
    const areaArr = areas ? areas.split(',') : [];

    // Aggregation pipeline for efficiency
    const match = { status: 'approved' };

    const results = await Property.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            city: "$city",
            type: "$propertyType",
            purpose: "$purpose",
            area: "$areaName"
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format results for frontend consumption
    const formatted = results.map(r => ({
      city: r._id.city,
      type: r._id.type,
      purpose: r._id.purpose,
      area: r._id.area,
      count: r.count
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Dynamic Homepage Boxes
export const getDynamicHomepageBoxes = async (req, res) => {
  try {
    const { city } = req.query;
    const baseMatch = { status: 'approved' };
    if (city) {
      baseMatch.city = { $regex: new RegExp(`^${city}$`, "i") };
    }

    // Helper to get metrics for a specific category (Homes, Plots, Commercial)
    const getCategoryMetrics = async (categoryTypes) => {
      const match = { ...baseMatch, propertyType: { $in: categoryTypes } };

      const [areas, popular, types] = await Promise.all([
        // Areas (Sizes) present in this category - Sorted by POPULARITY (frequency)
        Property.aggregate([
          { $match: match },
          {
            $group: {
              _id: { value: "$area.value", unit: "$area.unit" },
              count: { $sum: 1 }
            }
          },
          { $match: { "_id.value": { $ne: null }, "_id.unit": { $ne: null } } },
          { $sort: { count: -1 } },
          { $limit: 20 }
        ]),
        // Popular Locations for this category - Sorted by COUNT (Groups by area + block)
        Property.aggregate([
          { $match: match },
          {
            $group: {
              _id: {
                area: "$areaName",
                block: "$blockName"
              },
              count: { $sum: 1 }
            }
          },
          { $match: { "_id.area": { $ne: null, $ne: "" } } },
          { $sort: { count: -1 } },
          { $limit: 20 }
        ]),
        // Actual Types present in this category with counts
        Property.aggregate([
          { $match: match },
          { $group: { _id: "$propertyType", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);

      // Determine query param for this category
      let pTypeParam;
      if (categoryTypes.length === 1) pTypeParam = categoryTypes[0];
      else if (categoryTypes.includes('House') && categoryTypes.includes('Flat')) pTypeParam = 'Homes';

      return {
        types: types.map(t => ({
          title: t._id,
          subtitle: `${t.count} Properties`,
          query: { propertyType: t._id, city: city }
        })),
        areas: areas.map(a => ({
          title: `${a._id.value} ${a._id.unit}`,
          subtitle: `${a.count} Properties`,
          query: { areaMin: a._id.value, areaMax: a._id.value, areaUnit: a._id.unit, city: city, type: pTypeParam }
        })),
        popular: popular.map(p => {
          const title = p._id.block ? `${p._id.area} ${p._id.block}` : p._id.area;
          return {
            title,
            subtitle: `${p.count} Properties`,
            query: { location: title, city: city, type: pTypeParam }
          };
        })
      };
    };

    // Define categories based on Schema Enum: ['House', 'Plot', 'Flat', 'Commercial', 'Upper Portion', 'Lower Portion', 'Farm House', 'Room', 'Penthouse']
    // Homes: House, Flat, Upper Portion, Lower Portion, Farm House, Room, Penthouse
    // Plots: Plot
    // Commercial: Commercial

    // Note: If you want 'Homes' to strictly be 'House' and 'Flat' box to be 'Flat', adjust accordingly.
    // Based on browse boxes: "Homes", "Plots", "Commercial".
    const [homesData, plotsData, commercialData] = await Promise.all([
      getCategoryMetrics(['House', 'Flat', 'Upper Portion', 'Lower Portion', 'Farm House', 'Room', 'Penthouse']),
      getCategoryMetrics(['Plot']),
      getCategoryMetrics(['Commercial'])
    ]);

    res.status(200).json({
      homes: homesData,
      plots: plotsData,
      commercial: commercialData
    });

  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

// Get Single Property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('sellerId', 'name email phone')
      .lean();
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Try to find Agency for this seller
    if (property.sellerId) {
      const agency = await Agency.findOne({ ownerId: property.sellerId._id }).select('name').lean();
      if (agency) {
        property.sellerId.name = agency.name; // Prioritize Agency name
      }
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Property by Slug
export const getPropertyBySlug = async (req, res) => {
  try {
    const property = await Property.findOne({ slug: req.params.slug })
      .populate('sellerId', 'name email phone')
      .lean();
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Try to find Agency for this seller
    if (property.sellerId) {
      const agency = await Agency.findOne({ ownerId: property.sellerId._id }).select('name').lean();
      if (agency) {
        property.sellerId.name = agency.name; // Prioritize Agency name
      }
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Properties List
export const getMyPropertiesList = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const { page = 1, limit = 10, search, status, sort } = req.query;

    const query = { sellerId };

    if (status && status !== 'All') {
      if (status === 'expired') {
        query.$or = [{ expiryDate: { $lte: new Date() } }];
      } else {
        query.status = status;
      }
    }

    if (search) {
      query.$text = { $search: search };
    }

    const sortOption = {};
    if (sort === 'oldest') sortOption.createdAt = 1;
    else if (sort === 'price_high') sortOption.price = -1;
    else if (sort === 'price_low') sortOption.price = 1;
    else if (sort === 'views') sortOption.views = -1;
    else sortOption.createdAt = -1; // default new

    const properties = await Property.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Property.countDocuments(query);

    res.status(200).json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalProperties: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Seller Dashboard Stats (OPTIMIZED)
export const getSellerDashboardStats = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const now = new Date();

    // Use aggregation to calculate all stats in ONE query
    const statsAgg = await Property.aggregate([
      { $match: { sellerId } },
      {
        $facet: {
          // Total Properties
          total: [{ $count: 'count' }],

          // Active Listings
          active: [
            {
              $match: {
                status: 'approved',
                $or: [
                  { expiryDate: { $gt: now } },
                  { expiryDate: { $exists: false } },
                  { expiryDate: null }
                ]
              }
            },
            { $count: 'count' }
          ],

          // Inactive/Expired
          inactive: [
            {
              $match: {
                $or: [
                  { status: { $ne: 'approved' } },
                  { expiryDate: { $lte: now } }
                ]
              }
            },
            { $count: 'count' }
          ],

          // Boosted/Featured
          boosted: [
            {
              $match: {
                $or: [{ isBoosted: true }, { isFeatured: true }]
              }
            },
            { $count: 'count' }
          ],

          // Sum of views and leads
          metrics: [
            {
              $group: {
                _id: null,
                totalViews: { $sum: { $ifNull: ['$views', 0] } },
                totalLeads: { $sum: { $ifNull: ['$leads', 0] } }
              }
            }
          ]
        }
      }
    ]);

    const stats = statsAgg[0];
    const totalProperties = stats.total[0]?.count || 0;
    const activeListings = stats.active[0]?.count || 0;
    const inactiveListings = stats.inactive[0]?.count || 0;
    const boostedProperties = stats.boosted[0]?.count || 0;
    const totalViews = stats.metrics[0]?.totalViews || 0;
    const totalLeads = stats.metrics[0]?.totalLeads || 0;

    // Unread Messages (separate query, but optimized)
    const unreadMessagesCount = await Message.countDocuments({
      'chat.participants': sellerId,
      senderId: { $ne: sellerId },
      read: false
    });

    // Inquiries (linked via sellerId OR via properties owned by seller)
    const sellerPropertyIds = await Property.find({ sellerId }).distinct('_id');

    // Total Agencies owned by seller
    const totalAgencies = await Agency.countDocuments({ ownerId: sellerId });

    const totalInquiries = await Inquiry.countDocuments({
      $or: [
        { sellerId },
        { propertyId: { $in: sellerPropertyIds } }
      ]
    });
    const pendingInquiries = await Inquiry.countDocuments({
      $or: [
        { sellerId },
        { propertyId: { $in: sellerPropertyIds } }
      ],
      status: 'pending'
    });

    // 4. Property Distribution (for Pie/Doughnut Chart)
    const propertyDistribution = await Property.aggregate([
      { $match: { sellerId } },
      { $group: { _id: "$propertyType", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } }
    ]);

    // 5. Inquiries Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const inquiriesTrend = await Inquiry.aggregate([
      {
        $match: {
          $or: [
            { sellerId },
            { propertyId: { $in: sellerPropertyIds } }
          ],
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $project: { date: "$_id", value: "$count", _id: 0 } }
    ]);

    // 6. Performance Radar (Calculated Scores 0-100)
    const performanceRadar = [
      { subject: 'Listing Health', A: (activeListings / (totalProperties || 1)) * 100, fullMark: 100 },
      { subject: 'Visibility', A: Math.min(100, (totalViews / (totalProperties * 10 || 1)) * 10), fullMark: 100 },
      { subject: 'Lead Logic', A: Math.min(100, (totalLeads / (totalViews || 1)) * 100), fullMark: 100 },
      { subject: 'Promotion', A: (boostedProperties / (totalProperties || 1)) * 100, fullMark: 100 },
      { subject: 'Response', A: totalInquiries > 0 ? ((totalInquiries - pendingInquiries) / totalInquiries) * 100 : 100, fullMark: 100 },
    ];

    res.status(200).json({
      properties: totalProperties,
      agencies: totalAgencies,
      activeListings,
      inactiveListings,
      boostedProperties,
      views: totalViews,
      leads: totalLeads,
      unreadMessages: unreadMessagesCount,
      inquiries: totalInquiries,
      pendingInquiries: pendingInquiries,
      propertyDistribution,
      inquiriesTrend,
      performanceRadar,
      activeOrders: 0 // Placeholder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View Increment
export const incrementPropertyViews = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.status(200).json({ views: property.views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lead Increment
export const incrementPropertyLeads = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { leads: 1 } },
      { new: true }
    );
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.status(200).json({ leads: property.leads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Seller Scoreboard (Leaderboard)
export const getSellerScoreboard = async (req, res) => {

  try {


    // Get all sellers with their agencies using aggregation
    const sellersWithAgencies = await Seller.aggregate([
      {
        $lookup: {
          from: 'agencies',
          localField: '_id',
          foreignField: 'ownerId',
          as: 'agency'
        }
      },
      {
        $unwind: {
          path: '$agency',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          agencyName: { $ifNull: ['$agency.name', 'No Agency'] }
        }
      }
    ]);



    // Get all sold and rented properties
    const properties = await Property.find({
      status: { $in: ['sold', 'rented'] },
      sellerId: { $exists: true, $ne: null }
    });



    // Initialize all sellers with 0 counts
    const sellerMap = {};
    for (const seller of sellersWithAgencies) {
      const sellerId = seller._id.toString();

      sellerMap[sellerId] = {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        agencyName: seller.agencyName,
        soldCount: 0,
        rentedCount: 0,
        totalPoints: 0
      };
    }

    // Update counts for sellers with sold/rented properties
    properties.forEach(property => {
      if (!property.sellerId) return;

      const sellerId = property.sellerId.toString();

      if (sellerMap[sellerId]) {
        if (property.status === 'sold') {
          sellerMap[sellerId].soldCount++;
          sellerMap[sellerId].totalPoints += 10;
        } else if (property.status === 'rented') {
          sellerMap[sellerId].rentedCount++;
          sellerMap[sellerId].totalPoints += 5;
        }
      }
    });

    // Convert to array and sort by points (highest first)
    const scoreboard = Object.values(sellerMap).sort((a, b) => b.totalPoints - a.totalPoints);


    res.status(200).json(scoreboard);
  } catch (error) {

    res.status(500).json({
      message: error.message,
      stack: error.stack,
      error: error.toString()
    });
  }
};

// Renew Property Listing
export const renewProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscriptionId } = req.body;
    const sellerId = req.seller._id;

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Ownership check
    if (property.sellerId.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: "Not authorized to renew this property" });
    }

    let seller = await Seller.findById(sellerId);
    let targetSubscription = null;

    if (subscriptionId) {
      targetSubscription = await SubscriptionRequest.findById(subscriptionId).populate('dealId');
      if (!targetSubscription) return res.status(404).json({ message: "Subscription not found" });
      if (targetSubscription.status !== 'approved') return res.status(400).json({ message: "Subscription is not approved" });
      if (targetSubscription.quotaRemaining <= 0) return res.status(400).json({ message: "No quota remaining in this package" });
      if (targetSubscription.expiryDate && new Date() > new Date(targetSubscription.expiryDate)) {
        return res.status(400).json({ message: "Subscription has expired" });
      }
    } else {
      // Check global quota
      if (seller.isUnlimited) {
        // Proceed
      } else {
        if ((Number(seller.quotaRemaining) || 0) <= 0) {
          return res.status(400).json({ message: "No global quota remaining" });
        }
        if (seller.quotaExpiry && new Date() > new Date(seller.quotaExpiry)) {
          return res.status(400).json({ message: "Global plan has expired" });
        }
      }
    }

    // Apply Renewal
    property.status = 'approved'; // Re-approve if it was in any other state
    property.expiryDate = targetSubscription ? targetSubscription.expiryDate : seller.quotaExpiry;

    // Decrement Quota
    if (!seller.isUnlimited) {
      if (targetSubscription) {
        targetSubscription.quotaRemaining = Math.max(0, targetSubscription.quotaRemaining - 1);
        await targetSubscription.save();
      }
      seller.quotaRemaining = Math.max(0, (Number(seller.quotaRemaining) || 0) - 1);
      await seller.save();
    }

    await property.save();
    res.status(200).json({ message: "Property renewed successfully", property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



