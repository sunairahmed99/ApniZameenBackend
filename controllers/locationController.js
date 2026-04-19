import Location from '../models/Location.js';

// Get Locations by Parent
export const getLocations = async (req, res) => {
    try {
        const { parentId, type } = req.query;
        let query = { isActive: true };
        if (parentId) query.parent = parentId;
        if (type) query.type = type;
        if (!parentId && !type) query.parent = null; // Get states by default

        const locations = await Location.find(query).lean();
        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Add Location
export const addLocation = async (req, res) => {
    try {
        const newLocation = new Location(req.body);
        await newLocation.save();
        res.status(201).json(newLocation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Delete Location
export const deleteLocation = async (req, res) => {
    try {
        await Location.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Location deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
