import SiteSettings from '../models/SiteSettings.js';

export const getSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        
        // If no settings exist yet, create default settings
        if (!settings) {
            settings = await SiteSettings.create({
                contactNumber: '0800-APNIZAMEEN (92633)',
                timings: 'Monday To Sunday 9AM To 6PM',
                email: 'info@zameen.com',
                branches: [
                    {
                        title: 'Head Office',
                        addressLines: ['Pearl One, 94-B/I, MM Alam Road,', 'Gulberg III, Lahore, Pakistan']
                    }
                ],
                socialLinks: {
                    facebook: 'https://facebook.com',
                    instagram: 'https://instagram.com',
                    youtube: 'https://youtube.com',
                    linkedin: 'https://linkedin.com',
                    twitter: 'https://twitter.com'
                }
            });
        }
        
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();

        if (!settings) {
            settings = new SiteSettings(req.body);
            await settings.save();
        } else {
            // Update fields
            settings.contactNumber = req.body.contactNumber || settings.contactNumber;
            settings.timings = req.body.timings || settings.timings;
            settings.email = req.body.email || settings.email;
            
            if (req.body.branches) {
                settings.branches = req.body.branches;
            }
            if (req.body.socialLinks) {
                settings.socialLinks = { ...settings.socialLinks, ...req.body.socialLinks };
            }

            await settings.save();
        }

        res.status(200).json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
};
