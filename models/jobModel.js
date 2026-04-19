import mongoose from 'mongoose';

const jobSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title']
    },
    department: {
        type: String,
        required: [true, 'Please add a department']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    type: {
        type: String,
        enum: ['Remote', 'On-site', 'Hybrid'],
        default: 'On-site'
    },
    salary: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
