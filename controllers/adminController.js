import Seller from '../models/Seller.js';
import Property from '../models/Property.js';
import Project from '../models/Project.js';
import Agency from '../models/Agency.js';
import Inquiry from '../models/Inquiry.js';
import BannerAd from '../models/BannerAd.js';
import PaymentPrice from '../models/PaymentPrice.js';

import Analytics from '../models/Analytics.js';

export const getDashboardStats = async (req, res) => {
    try {
        const [
            sellersCount,
            propertiesCount,
            projectsCount,
            agenciesCount,
            inquiriesCount,
            bannersCount,
            revenueData,
            analyticsData
        ] = await Promise.all([
            Seller.countDocuments(),
            Property.countDocuments(),
            Project.countDocuments(),
            Agency.countDocuments(),
            Inquiry.countDocuments(),
            BannerAd.countDocuments(),
            PaymentPrice.aggregate([
                { $group: { _id: "$paymentType", total: { $sum: "$price" } } }
            ]),
            Analytics.aggregate([
                { $group: { _id: "$eventType", count: { $sum: 1 } } }
            ])
        ]);

        // Process revenue data into a more accessible format
        const revenue = {
            Banner: 0,
            Agency: 0,
            Property: 0
        };

        revenueData.forEach(item => {
            if (revenue.hasOwnProperty(item._id)) {
                revenue[item._id] = item.total;
            }
        });

        // Process analytics data
        const analytics = {
            visit: 0,
            search: 0,
            contact_click: 0,
            property_view: 0
        };

        analyticsData.forEach(item => {
            if (analytics.hasOwnProperty(item._id)) {
                analytics[item._id] = item.count;
            }
        });

        // Property Type Distribution
        const typeDistribution = await Property.aggregate([
            { $group: { _id: "$propertyType", count: { $sum: 1 } } },
            { $project: { name: "$_id", value: "$count", _id: 0 } }
        ]);

        // Monthly Growth (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const growthDataRaw = await Property.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const growthData = growthDataRaw.map(item => ({
            name: monthNames[item._id.month - 1],
            properties: item.count
        }));

        const revenueRadarData = [
            { subject: 'Banner', A: revenue.Banner, fullMark: Math.max(revenue.Banner, revenue.Agency, revenue.Property) || 1000 },
            { subject: 'Agency', A: revenue.Agency, fullMark: Math.max(revenue.Banner, revenue.Agency, revenue.Property) || 1000 },
            { subject: 'Property', A: revenue.Property, fullMark: Math.max(revenue.Banner, revenue.Agency, revenue.Property) || 1000 },
        ];

        res.json({
            sellers: sellersCount,
            properties: propertiesCount,
            projects: projectsCount,
            agencies: agenciesCount,
            inquiries: inquiriesCount,
            banners: bannersCount,
            revenue,
            analytics,
            revenueRadarData,
            charts: {
                typeDistribution,
                growthData
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch admin stats" });
    }
};
