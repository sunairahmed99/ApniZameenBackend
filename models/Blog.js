import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: "SAMRA ZULFIQAR"
    },
    readTime: {
        type: String,
        default: "3 MIN READ"
    },
    excerpt: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

BlogSchema.pre('save', async function () {
    if (!this.isModified('title')) return;

    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
});

// Indexes - slug index is created automatically by unique: true
BlogSchema.index({ category: 1 });

export default mongoose.model("Blog", BlogSchema);
