import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['seller', 'admin'],
    default: 'admin'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: String,
  verificationCodeExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  currentDeal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  },
  quotaRemaining: {
    type: Number,
    default: 0
  },
  quotaExpiry: {
    type: Date
  },
  isUnlimited: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Encrypt password using bcrypt
sellerSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match Seller entered password to hashed password in database
sellerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

sellerSchema.index({ isActive: 1 });

export default mongoose.model("Seller", sellerSchema);

