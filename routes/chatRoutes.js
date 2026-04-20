import express from 'express';
import { getChats, getMessages, createChat, getAdminId, getAllAdminChats, sendChatMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All chat routes are protected

router.route('/')
    .get(getChats)
    .post(createChat);

router.get('/admin-id', getAdminId);
router.post('/initiate', createChat);
router.post('/message', sendChatMessage);
router.get('/all', getAllAdminChats); // MUST be before /:chatId
router.get('/:chatId/messages', getMessages);

// Keep the old route for compatibility if needed
router.get('/:chatId', getMessages);

export default router;