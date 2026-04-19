import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller', 
    required: true
  }],
  // Optional: Link to a specific property if the chat is about one
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  lastMessage: {
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    timestamp: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


chatSchema.pre('save', async function () {
  this.updatedAt = Date.now();
});


const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
