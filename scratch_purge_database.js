import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chat from './models/Chat.js';
import Message from './models/Message.js';

dotenv.config();

async function purgeChats() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const chatCount = await Chat.countDocuments();
    const msgCount = await Message.countDocuments();
    
    console.log(`Deleting ${chatCount} chats and ${msgCount} messages...`);

    await Chat.deleteMany({});
    await Message.deleteMany({});

    console.log('✅ Cleanup complete. Database is fresh.');
    process.exit(0);
  } catch (err) {
    console.error('Error during purge:', err);
    process.exit(1);
  }
}

purgeChats();
