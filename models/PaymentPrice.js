import mongoose from 'mongoose';

const paymentPriceSchema = new mongoose.Schema({
    paymentType: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String
    }
}, { timestamps: true });

const PaymentPrice = mongoose.model('PaymentPrice', paymentPriceSchema);
export default PaymentPrice;
