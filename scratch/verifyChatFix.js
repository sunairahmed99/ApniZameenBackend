import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import Seller from '../models/Seller.js';

async function verify() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    // 1. Find or create a test chat
    const testParticipants = await Seller.find().limit(2);
    if (testParticipants.length < 2) {
      console.log('❌ Not enough sellers to test');
      process.exit(1);
    }

    const p1 = testParticipants[0]._id;
    const p2 = testParticipants[1]._id;

    console.log(`🧪 Testing chat between ${testParticipants[0].name} (${p1}) and ${testParticipants[1].name} (${p2})`);

    let chat = await Chat.findOne({ participants: { $all: [p1, p2] } });
    if (!chat) {
      console.log('🆕 Creating test chat...');
      chat = new Chat({ participants: [p1, p2] });
      await chat.save();
    }
    const chatId = chat._id;
    console.log(`✅ Chat ID: ${chatId}`);

    // 2. Simulate message save (like socket.js does)
    console.log('\n💾 Simulating message save...');
    const text = `Test message at ${new Date().toISOString()}`;
    const newMessage = new Message({
      chatId: new mongoose.Types.ObjectId(chatId),
      senderId: new mongoose.Types.ObjectId(p1),
      text
    });
    await newMessage.save();
    console.log('✅ Message saved successfully');

    // 3. Update Chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: { text, sender: p1, timestamp: new Date() },
      updatedAt: new Date()
    });
    console.log('✅ Chat lastMessage updated');

    // 4. Verify in DB
    const savedMsg = await Message.findOne({ chatId, text });
    if (savedMsg) {
      console.log('\n🎉 VERIFICATION SUCCESSFUL: Message found in database!');
      console.log(`   Text: ${savedMsg.text}`);
      console.log(`   ChatID: ${savedMsg.chatId}`);
    } else {
      console.log('\n❌ VERIFICATION FAILED: Message not found!');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verify();
