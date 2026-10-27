const dbStore = require('../store/dbStore');

// Store map of online users: userId -> socketId
const onlineUsers = new Map();

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡ New Socket Client Connected: ${socket.id}`);

    // User logs in / connects socket
    socket.on('user_online', async (userId) => {
      if (!userId) return;

      onlineUsers.set(userId.toString(), socket.id);
      socket.userId = userId;

      // Update online status in database
      await dbStore.updateUserStatus(userId, true);

      // Broadcast to all clients that this user is now online
      io.emit('user_status_changed', { userId, isOnline: true });
      io.emit('online_users_list', Array.from(onlineUsers.keys()));

      console.log(`👤 User ${userId} is now ONLINE (Socket: ${socket.id})`);
    });

    // Send Message Event (Real-time)
    socket.on('send_message', async (data) => {
      try {
        const { sender, recipient, text, image } = data;

        if (!sender || !recipient || (!text && !image)) return;

        // Save to database
        const savedMessage = await dbStore.createMessage({
          sender,
          recipient,
          text,
          image
        });

        // Get recipient's socket ID
        const recipientSocketId = onlineUsers.get(recipient.toString());

        // Emit to recipient if online
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_message', savedMessage);
        }

        // Emit confirmation back to sender socket
        socket.emit('message_sent', savedMessage);
      } catch (error) {
        console.error('Socket send_message error:', error);
        socket.emit('message_error', { message: 'Failed to deliver message' });
      }
    });

    // Typing Indicators
    socket.on('typing', ({ senderId, recipientId }) => {
      const recipientSocketId = onlineUsers.get(recipientId.toString());
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_typing', { senderId });
      }
    });

    socket.on('stop_typing', ({ senderId, recipientId }) => {
      const recipientSocketId = onlineUsers.get(recipientId.toString());
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_stop_typing', { senderId });
      }
    });

    // Mark Messages as Read
    socket.on('mark_read', async ({ senderId, recipientId }) => {
      await dbStore.markMessagesAsRead(senderId, recipientId);
      const senderSocketId = onlineUsers.get(senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages_read', { readBy: recipientId });
      }
    });

    // Handle Disconnect
    socket.on('disconnect', async () => {
      console.log(`🔌 Socket Disconnected: ${socket.id}`);
      if (socket.userId) {
        onlineUsers.delete(socket.userId.toString());
        await dbStore.updateUserStatus(socket.userId, false);

        // Notify other clients
        io.emit('user_status_changed', { userId: socket.userId, isOnline: false });
        io.emit('online_users_list', Array.from(onlineUsers.keys()));
      }
    });
  });
};

module.exports = setupSocket;
