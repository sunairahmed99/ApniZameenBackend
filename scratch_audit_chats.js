import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chat from './models/Chat.js';
import Seller from './models/Seller.js';

dotenv.config();

async function auditChats() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the user "sunair"
    const user = await Seller.findOne({ name: 'sunair' });
    if (!user) {
        console.log('User "sunair" not found.');
        process.exit(1);
    }
    
    const userId = user._id;
    console.log(`Auditing chats for user: ${user.name} (${userId})`);

    const chats = await Chat.find({
        participants: { $in: [userId] }
    }).populate('participants', 'name').lean();

    console.log(`Found ${chats.length} chats.`);

    chats.forEach((chat, i) => {
        const participantNames = chat.participants.map(p => `${p.name} (${p._id})`);
        console.log(`[${i}] ChatID: ${chat._id}`);
        console.log(`    Participants: ${participantNames.join(', ')}`);
        
        const otherParticipant = chat.participants.find(p => String(p._id) !== String(userId));
        console.log(`    Identified Other: ${otherParticipant ? otherParticipant.name : 'NONE FOUND'}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

auditChats();
