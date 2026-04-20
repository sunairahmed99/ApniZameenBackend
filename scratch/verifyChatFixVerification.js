import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

dotenv.config();

async function verifyChatFix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find any chat
    let chat = await Chat.findOne().sort({ updatedAt: 1 }); // Oldest updated one
    if (!chat) {
        console.log('No chats found to test with.');
        process.exit(0);
    }
    
    const chatId = chat._id;
    const oldUpdatedAt = chat.updatedAt;
    console.log(`Testing with Chat ID: ${chatId}`);
    console.log(`Old UpdatedAt: ${oldUpdatedAt}`);

    // Simulate the logic from socket.js:send_message
    const senderId = chat.participants[0];
    const text = `Test message at ${new Date().toISOString()}`;

    // 1. Create message
    const newMessage = new Message({ 
      chatId, 
      senderId, 
      text 
    });
    await newMessage.save();

    // 2. Update Chat (The logic from socket.js)
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        text,
        sender: senderId,
        timestamp: new Date(),
      },
      updatedAt: new Date(),
    }, { new: true });

    // 3. Verify
    const updatedChat = await Chat.findById(chatId);
    console.log(`New UpdatedAt: ${updatedChat.updatedAt}`);

    if (updatedChat.updatedAt > oldUpdatedAt) {
        console.log('✅ Success: Chat updatedAt was bumped correctly!');
    } else {
        console.log('❌ Failure: Chat updatedAt was NOT bumped.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

verifyChatFix();
