import asyncHandler from 'express-async-handler';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import Seller from '../models/Seller.js';
import Property from '../models/Property.js';

// Helper to safely get string ID from any format (ObjectId or String or Object)
const getSafeId = (input) => {
    if (!input) return "";
    if (typeof input === 'string') return input;
    if (typeof input === 'object') return (input._id || input.id || input).toString();
    return String(input);
};

// @desc    Get Admin ID
// @route   GET /api/chats/admin-id
// @access  Private
export const getAdminId = asyncHandler(async (req, res) => {
    const admin = await Seller.findOne({ role: 'admin' }).select('_id');
    
    if (!admin) {
        res.status(404);
        throw new Error('Admin user not found');
    }
    
    res.json(admin);
});

// @desc    Get all chats for the logged in seller
// @route   GET /api/chats
// @access  Private
export const getChats = asyncHandler(async (req, res) => {
    if (!req.seller?._id) return res.status(401).json({ message: "Not authorized" });

    const chats = await Chat.find({
        participants: { $in: [req.seller._id] }
    })
    .populate('participants', 'name')
    .populate('propertyId', 'title images')
    .sort({ updatedAt: -1 });

    res.json(chats);
});

// @desc    Get messages for a specific chat
// @route   GET /api/chats/:chatId
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    // Pseudo chat handling: if it's a new synthetic chat, there are no messages
    if (chatId && chatId.toString().startsWith('new_')) {
        return res.json([]);
    }

    if (!req.seller?._id) return res.status(401).json({ message: "Not authorized" });

    // Check if chat exists and user is a participant
    const chat = await Chat.findOne({
        _id: chatId,
        participants: { $in: [req.seller._id] }
    });

    if (!chat) {
        res.status(404);
        throw new Error('Chat not found or access denied');
    }

    const messages = await Message.find({ chatId })
        .sort({ timestamp: 1 });

    res.json(messages);
});

// @desc    Create or get a chat between two participants
export const createChat = asyncHandler(async (req, res) => {
    const { recipientId, userId, propertyId, sellerId } = req.body;

    const senderId = req.seller?._id;
    
    if (!senderId) {
        res.status(401);
        throw new Error('User not logged in');
    }

    // Determine target recipient (handle various frontend naming conventions)
    let targetRecipientId = recipientId;
    
    // 1. Resolve Recipient (if not direct)
    if (!targetRecipientId) {
        // If recipientId not provided, check if either sellerId or userId is someone other than the sender
        if (sellerId && sellerId.toString() !== senderId.toString()) {
            targetRecipientId = sellerId;
        } else if (userId && userId.toString() !== senderId.toString()) {
            targetRecipientId = userId;
        }
    }

    // 2. Resolve via Property if still missing
    if (!targetRecipientId && propertyId) {
        const property = await Property.findById(propertyId);
        if (property && property.sellerId) {
            targetRecipientId = property.sellerId;
        }
    }

    // 3. Admin Fallback (Absolute fail-safe)
    if (!targetRecipientId || targetRecipientId.toString() === senderId.toString()) {
        const admin = await Seller.findOne({ role: 'admin' }).select('_id');
        if (admin && admin._id.toString() !== senderId.toString()) {
            targetRecipientId = admin._id;
        }
    }

    // 4. Final Validation
    if (!targetRecipientId) {
        res.status(400);
        throw new Error('Valid recipient ID is required');
    }

    if (senderId.toString() === targetRecipientId.toString()) {
        res.status(400);
        throw new Error('Cannot start a chat with yourself');
    }

    // Check if chat already exists between these participants (and property if provided)
    const query = {
        participants: { $all: [senderId, targetRecipientId] }
    };
    
    if (propertyId) {
        query.propertyId = propertyId;
    }

    let chat = await Chat.findOne(query)
        .populate('participants', 'name')
        .populate('propertyId', 'title images');

    if (chat) {
        return res.json(chat);
    }

    // If not exists, create new chat
    chat = new Chat({
        participants: [senderId, targetRecipientId],
        propertyId
    });

    await chat.save();
    
    // Populate and return (ensure we find it again to get full population)
    const fullChat = await Chat.findById(chat._id)
        .populate('participants', 'name')
        .populate('propertyId', 'title images');

    res.status(201).json(fullChat);
});

// @desc    Get all chats and registered sellers (Admin)
// @route   GET /api/chats/all
// @access  Private (Admin Role expected)
export const getAllAdminChats = asyncHandler(async (req, res) => {
    const adminId = req.seller?._id;
    if (!adminId) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // 1. Fetch all existing chats in database
    const allChats = await Chat.find()
        .populate('participants', 'name')
        .populate('propertyId', 'title images')
        .sort({ updatedAt: -1 })
        .lean();

    // 2. Fetch all registered sellers
    const sellers = await Seller.find({ role: { $ne: 'admin' } })
        .select('name _id')
        .lean();

    // 3. Create synthetic pseudo-chats for sellers who don't have a chat with admin
    const adminChats = allChats.filter(chat => 
        chat.participants && Array.isArray(chat.participants) && 
        chat.participants.some(p => p && getSafeId(p) === getSafeId(adminId))
    );

    const syntheticChats = [];
    
    sellers.forEach(seller => {
        // Check if admin already has a chat with this seller
        const hasChat = adminChats.some(chat => 
            chat.participants && Array.isArray(chat.participants) &&
            chat.participants.some(p => p && getSafeId(p) === getSafeId(seller._id))
        );

        if (!hasChat) {
            syntheticChats.push({
                _id: `new_${seller._id}`,
                participants: [
                    { _id: adminId, name: 'Admin' },
                    { _id: seller._id, name: seller.name }
                ],
                lastMessage: null,
                isNew: true,
                updatedAt: new Date(0) // Put them at the bottom
            });
        }
    });

    // Merge existing chats and pseudo chats
    res.json([...allChats, ...syntheticChats]);
});

/**
 * Send a message via HTTP (Reliability fix for Vercel)
 */
export const sendChatMessage = async (req, res) => {
    const { chatId, text } = req.body;
    const senderId = req.seller?._id || req.user?._id || req.admin?._id;

    if (!chatId || !text) {
        return res.status(400).json({ message: 'Chat ID and text are required.' });
    }

    try {
        // 1. Create message
        const newMessage = new Message({
            chatId,
            senderId,
            text
        });
        await newMessage.save();

        // 2. Update Chat
        const updatedChat = await Chat.findByIdAndUpdate(chatId, {
            lastMessage: {
                text,
                sender: senderId,
                timestamp: new Date(),
            },
            updatedAt: new Date(),
        }, { new: true }).populate('participants', 'name');

        // 3. Emit real-time via Socket
        const io = req.app.get('io');
        if (io) {
            io.to(chatId).emit('receive_message', newMessage);
            // Also notify participants list of the update for sorting
            io.emit('chat_updated', updatedChat);
        }

        res.status(201).json(newMessage);
    } catch (err) {
        console.error('Error in sendChatMessage:', err);
        res.status(500).json({ message: err.message });
    }
};
