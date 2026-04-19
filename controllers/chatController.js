import asyncHandler from 'express-async-handler';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import Seller from '../models/Seller.js';

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
// @route   POST /api/chats/initiate
// @access  Private
export const createChat = asyncHandler(async (req, res) => {
    const { recipientId, userId, propertyId, sellerId } = req.body;

    // The frontend might send recipientId, or userId (when chatting with admin/other)
    const targetRecipientId = recipientId || userId;
    const currentUserId = req.seller?._id || sellerId;

    if (!currentUserId) {
        res.status(401);
        throw new Error('User not logged in');
    }

    if (!targetRecipientId) {
        res.status(400);
        throw new Error('Recipient ID is required');
    }

    // Check if chat already exists between these participants (and property if provided)
    const query = {
        participants: { $all: [currentUserId, targetRecipientId] }
    };
    
    if (propertyId) {
        query.propertyId = propertyId;
    }

    let chat = await Chat.findOne(query);

    if (chat) {
        return res.json(chat);
    }

    // If not exists, create new chat
    chat = new Chat({
        participants: [req.seller._id, targetRecipientId],
        propertyId
    });

    const savedChat = await chat.save();
    
    // Populate and return
    const fullChat = await Chat.findById(savedChat._id)
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
