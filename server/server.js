const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const setupSocket = require('./socket/socketHandler');

// Load env variables
dotenv.config();

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for dev/testing ease
    methods: ['GET', 'POST']
  }
});

// Express Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// REST API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Chat Clone MERN Server', timestamp: new Date() });
});

// Initialize Socket.IO Handler
setupSocket(io);

// Server Listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Chat Clone Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.IO Real-Time Messaging Active`);
  console.log(`===================================================`);
});
