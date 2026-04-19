import mongoose from 'mongoose';

const paymentInfoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const PaymentInfo = mongoose.model('PaymentInfo', paymentInfoSchema);
export default PaymentInfo;
