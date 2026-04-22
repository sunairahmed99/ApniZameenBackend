import mongoose from 'mongoose';
import Chat from './models/Chat.js';
import Message from './models/Message.js';

/**
 * Initialize Socket.IO event handlers
 * @param {import('socket.io').Server} io - Socket.IO server instance
 */
const initializeSocket = (io) => {
  // Track online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {

    // Track user online status
    socket.on('user_online', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        io.emit('online_users', Array.from(onlineUsers.keys()));
      }
    });

    // Join a chat room
    socket.on('join_chat', (room) => {
      socket.join(room);
    });

    // Send message
    socket.on('send_message', async (data) => {
      const { chatId, senderId, text } = data;

      if (!chatId || !senderId || !text) {
        console.error('Socket send_message error: Missing required fields', { chatId, senderId, text: !!text });
        return;
      }

      try {
        // Ensure IDs are valid ObjectIds
        if (!mongoose.Types.ObjectId.isValid(chatId) || !mongoose.Types.ObjectId.isValid(senderId)) {
          throw new Error(`Invalid ObjectId format: chatId=${chatId}, senderId=${senderId}`);
        }

        const newMessage = new Message({ 
          chatId: new mongoose.Types.ObjectId(chatId), 
          senderId: new mongoose.Types.ObjectId(senderId), 
          text 
        });
        await newMessage.save();

        // Update Chat lastMessage
        const updatedChat = await Chat.findByIdAndUpdate(chatId, {
          lastMessage: {
            text,
            sender: senderId,
            timestamp: new Date(),
          },
          updatedAt: new Date(),
        }, { new: true });

        if (!updatedChat) {
          console.warn(`Socket send_message: Chat ${chatId} not found for update`);
        }

        // Emit to room (excluding sender)
        socket.to(chatId).emit('receive_message', newMessage);
      } catch (err) {
        console.error('❌ Socket send_message error:', err.message);
        // Optionally send error status back to user
        socket.emit('message_error', { error: err.message, chatId });
      }
    });

    // Mark messages as read
    socket.on('mark_as_read', async (data) => {
      const { chatId, userId } = data;
      try {
        await Message.updateMany(
          { chatId, senderId: { $ne: userId }, read: false },
          { $set: { read: true } }
        );
        io.to(chatId).emit('messages_read', { chatId });
      } catch (err) {
        console.error('Socket mark_as_read error:', err.message);
      }
    });

    // Typing indicators
    socket.on('typing', (data) => {
      socket.to(data.chatId).emit('user_typing', data);
    });

    socket.on('stop_typing', (data) => {
      socket.to(data.chatId).emit('user_stop_typing', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      // Remove from online users
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

export default initializeSocket;
