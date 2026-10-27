const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { getDBStatus } = require('../config/db');

// In-Memory Storage fallback when MongoDB is not locally running
const memoryStore = {
  users: [],
  messages: [],
  conversations: []
};

const bcrypt = require('bcryptjs');

// Seed MongoDB if connected and empty
const seedMongoData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const defaultPasswordHash = bcrypt.hashSync('password123', 10);
      const user1 = await User.create({
        username: 'Sarah Connor',
        email: 'sarah@example.com',
        password: defaultPasswordHash,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
        statusMessage: 'Building real-time apps! 🚀',
        isOnline: true
      });

      const user2 = await User.create({
        username: 'Alex Morgan',
        email: 'alex@example.com',
        password: defaultPasswordHash,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
        statusMessage: 'Full-stack developer | React & Node.js',
        isOnline: false
      });

      await User.create({
        username: 'Emily Chen',
        email: 'emily@example.com',
        password: defaultPasswordHash,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        statusMessage: 'Designing beautiful UI/UX experiences ✨',
        isOnline: true
      });

      await Message.create({
        sender: user1._id,
        recipient: user2._id,
        text: 'Hey Alex! Welcome to Chat Clone. Try logging in from another tab!',
        status: 'read'
      });

      console.log('🌱 MongoDB Demo users and sample messages seeded successfully!');
    }
  } catch (err) {
    console.warn('MongoDB Seed error:', err.message);
  }
};

// Default sample demo users so the user can test instant messaging between tabs immediately!
const seedDemoData = () => {
  if (memoryStore.users.length === 0) {
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);
    const defaultUsers = [
      {
        _id: '65f000000000000000000001',
        username: 'Sarah Connor',
        email: 'sarah@example.com',
        password: defaultPasswordHash,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
        statusMessage: 'Building real-time apps! 🚀',
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date()
      },
      {
        _id: '65f000000000000000000002',
        username: 'Alex Morgan',
        email: 'alex@example.com',
        password: defaultPasswordHash,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
        statusMessage: 'Full-stack developer | React & Node.js',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000),
        createdAt: new Date()
      },
      {
        _id: '65f000000000000000000003',
        username: 'Emily Chen',
        email: 'emily@example.com',
        password: defaultPasswordHash,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        statusMessage: 'Designing beautiful UI/UX experiences ✨',
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date()
      }
    ];
    memoryStore.users.push(...defaultUsers);

    // Seed sample message
    memoryStore.messages.push({
      _id: '65m000000000000000000001',
      sender: '65f000000000000000000001',
      recipient: '65f000000000000000000002',
      text: 'Hey Alex! Welcome to Chat Clone. Try logging in from another tab!',
      status: 'read',
      createdAt: new Date(Date.now() - 1800000)
    });
  }
};

seedDemoData();


const generateId = () => {
  return (
    Math.floor(Date.now() / 1000).toString(16) +
    'xxxxxxxxxxxxxxxx'
      .replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16))
      .slice(0, 16)
  );
};

// Data Layer APIs
const dbStore = {
  // USER OPERATIONS
  async createUser(userData) {
    if (getDBStatus()) {
      const user = new User(userData);
      return await user.save();
    } else {
      const newUser = {
        _id: generateId(),
        ...userData,
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date()
      };
      memoryStore.users.push(newUser);
      return newUser;
    }
  },

  async findUserByEmail(email) {
    if (getDBStatus()) {
      return await User.findOne({ email: email.toLowerCase() });
    } else {
      return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async findUserById(id) {
    if (getDBStatus()) {
      return await User.findById(id).select('-password');
    } else {
      const u = memoryStore.users.find(user => user._id.toString() === id.toString());
      if (!u) return null;
      const { password, ...rest } = u;
      return rest;
    }
  },

  async findUserWithPassword(email) {
    if (getDBStatus()) {
      return await User.findOne({ email: email.toLowerCase() });
    } else {
      return memoryStore.users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async getAllUsers(currentUserId) {
    if (getDBStatus()) {
      return await User.find({ _id: { $ne: currentUserId } }).select('-password').sort({ isOnline: -1, username: 1 });
    } else {
      return memoryStore.users
        .filter(u => u._id.toString() !== currentUserId.toString())
        .map(({ password, ...rest }) => rest);
    }
  },

  async updateUserStatus(userId, isOnline) {
    if (getDBStatus()) {
      return await User.findByIdAndUpdate(
        userId,
        { isOnline, lastSeen: new Date() },
        { new: true }
      ).select('-password');
    } else {
      const user = memoryStore.users.find(u => u._id.toString() === userId.toString());
      if (user) {
        user.isOnline = isOnline;
        user.lastSeen = new Date();
      }
      return user;
    }
  },

  async updateUserProfile(userId, updates) {
    if (getDBStatus()) {
      return await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    } else {
      const index = memoryStore.users.findIndex(u => u._id.toString() === userId.toString());
      if (index !== -1) {
        memoryStore.users[index] = { ...memoryStore.users[index], ...updates };
        const { password, ...rest } = memoryStore.users[index];
        return rest;
      }
      return null;
    }
  },

  // MESSAGE OPERATIONS
  async createMessage({ sender, recipient, text, image }) {
    if (getDBStatus()) {
      const msg = new Message({ sender, recipient, text, image });
      const savedMsg = await msg.save();
      
      let conversation = await Conversation.findOne({
        participants: { $all: [sender, recipient] }
      });

      if (conversation) {
        conversation.lastMessage = savedMsg._id;
        await conversation.save();
      } else {
        await Conversation.create({
          participants: [sender, recipient],
          lastMessage: savedMsg._id
        });
      }
      
      return savedMsg;
    } else {
      const newMsg = {
        _id: generateId(),
        sender,
        recipient,
        text,
        image: image || '',
        status: 'sent',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.messages.push(newMsg);
      return newMsg;
    }
  },

  async getMessagesBetweenUsers(userId1, userId2) {
    if (getDBStatus()) {
      return await Message.find({
        $or: [
          { sender: userId1, recipient: userId2 },
          { sender: userId2, recipient: userId1 }
        ]
      }).sort({ createdAt: 1 });
    } else {
      return memoryStore.messages
        .filter(
          m =>
            (m.sender.toString() === userId1.toString() && m.recipient.toString() === userId2.toString()) ||
            (m.sender.toString() === userId2.toString() && m.recipient.toString() === userId1.toString())
        )
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
  },

  async markMessagesAsRead(senderId, recipientId) {
    if (getDBStatus()) {
      await Message.updateMany(
        { sender: senderId, recipient: recipientId, status: { $ne: 'read' } },
        { status: 'read' }
      );
    } else {
      memoryStore.messages.forEach(m => {
        if (m.sender.toString() === senderId.toString() && m.recipient.toString() === recipientId.toString()) {
          m.status = 'read';
        }
      });
    }
  },

  seedMongoData
};

module.exports = dbStore;

