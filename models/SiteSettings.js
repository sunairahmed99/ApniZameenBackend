import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
    contactNumber: {
        type: String,
        required: true,
        default: '0800-APNIZAMEEN (92633)'
    },
    timings: {
        type: String,
        required: true,
        default: 'Monday To Sunday 9AM To 6PM'
    },
    email: {
        type: String,
        required: true,
        default: 'info@zameen.com'
    },
    branches: [
        {
            title: {
                type: String,
                required: true,
                default: 'Head Office'
            },
            addressLines: [
                {
                    type: String
                }
            ]
        }
    ],
    socialLinks: {
        facebook: { type: String, default: 'https://facebook.com' },
        instagram: { type: String, default: 'https://instagram.com' },
        youtube: { type: String, default: 'https://youtube.com' },
        linkedin: { type: String, default: 'https://linkedin.com' },
        twitter: { type: String, default: 'https://twitter.com' }
    }
}, {
    timestamps: true
});

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;
