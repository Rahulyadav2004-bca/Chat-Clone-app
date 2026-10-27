/**
 * Comprehensive Automated Test Suite for Chat Clone
 * Tests REST APIs, Authentication, Database Operations, and Real-Time WebSockets
 */

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { io: ClientSocket } = require('../../client/node_modules/socket.io-client');
const dbStore = require('../store/dbStore');
const setupSocket = require('../socket/socketHandler');

const TEST_PORT = 5055;

// Build test express app instance
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/users', require('../routes/userRoutes'));
app.use('/api/messages', require('../routes/messageRoutes'));
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Chat Clone MERN Server', timestamp: new Date() });
});

setupSocket(io);

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedTests++;
  }
}

async function request(path, options = {}) {
  const url = `http://localhost:${TEST_PORT}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 Starting Full Test Suite for Chat Clone App');
  console.log('====================================================\n');

  // Start server on test port
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));

  try {
    // ----------------------------------------------------
    // TEST 1: Health Check Endpoint
    // ----------------------------------------------------
    console.log('🔹 [Group 1: Server & Health Endpoints]');
    const health = await request('/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'Health check responds HTTP 200 with status ok');

    // ----------------------------------------------------
    // TEST 2: Authentication & User Accounts
    // ----------------------------------------------------
    console.log('\n🔹 [Group 2: Authentication & Authorization]');
    
    // 2.1 Demo User Login
    const demoLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'sarah@example.com', password: 'password123' })
    });
    assert(demoLogin.status === 200 && demoLogin.data.token && demoLogin.data.username === 'Sarah Connor', 'Seeded demo user (Sarah) can log in successfully');
    const sarahToken = demoLogin.data.token;
    const sarahId = demoLogin.data._id;

    // 2.2 Invalid Login Rejection
    const invalidLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'sarah@example.com', password: 'wrongpassword' })
    });
    assert(invalidLogin.status === 401, 'Invalid password correctly returns HTTP 401 Unauthorized');

    // 2.3 User Registration
    const testEmail = `testuser_${Date.now()}@example.com`;
    const registerRes = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'Test Bob',
        email: testEmail,
        password: 'password123',
        statusMessage: 'Ready to chat!'
      })
    });
    assert(registerRes.status === 201 && registerRes.data.token && registerRes.data.username === 'Test Bob', 'New user registration returns HTTP 201 and JWT token');
    const bobToken = registerRes.data.token;
    const bobId = registerRes.data._id;

    // 2.4 Duplicate Email Registration Prevention
    const duplicateReg = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'Bob Clone',
        email: testEmail,
        password: 'password123'
      })
    });
    assert(duplicateReg.status === 400, 'Duplicate registration attempt is prevented with HTTP 400');

    // 2.5 Protected Route: /api/auth/me with Token
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${sarahToken}` }
    });
    assert(meRes.status === 200 && meRes.data.email === 'sarah@example.com', 'Protected /api/auth/me correctly returns profile for valid JWT token');

    // 2.6 Protected Route: /api/auth/me without Token
    const unauthMe = await request('/api/auth/me');
    assert(unauthMe.status === 401, 'Unauthenticated access to protected route is rejected with HTTP 401');

    // 2.7 Update User Profile
    const updateProfileRes = await request('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${sarahToken}` },
      body: JSON.stringify({ statusMessage: 'Testing real-time sockets! ⚡' })
    });
    assert(updateProfileRes.status === 200 && updateProfileRes.data.statusMessage === 'Testing real-time sockets! ⚡', 'User profile update successfully updates status message');

    // ----------------------------------------------------
    // TEST 3: User Listing
    // ----------------------------------------------------
    console.log('\n🔹 [Group 3: User Directory & Contacts]');
    const usersRes = await request('/api/users', {
      headers: { Authorization: `Bearer ${sarahToken}` }
    });
    assert(usersRes.status === 200 && Array.isArray(usersRes.data), 'User contacts list returns an array');
    const hasBobInList = usersRes.data.some((u) => u._id.toString() === bobId.toString());
    const hasSarahInList = usersRes.data.some((u) => u._id.toString() === sarahId.toString());
    assert(hasBobInList && !hasSarahInList, 'Contacts list includes other users and excludes the requesting user');

    // ----------------------------------------------------
    // TEST 4: REST Messaging API
    // ----------------------------------------------------
    console.log('\n🔹 [Group 4: REST Messaging Operations]');
    const sendMsgRes = await request('/api/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sarahToken}` },
      body: JSON.stringify({
        recipientId: bobId,
        text: 'Hello Bob! This is Sarah via REST API.'
      })
    });
    assert(sendMsgRes.status === 201 && sendMsgRes.data.text.includes('Hello Bob'), 'Sending message via REST API saves message with HTTP 201');

    const chatHistoryRes = await request(`/api/messages/${bobId}`, {
      headers: { Authorization: `Bearer ${sarahToken}` }
    });
    assert(chatHistoryRes.status === 200 && Array.isArray(chatHistoryRes.data) && chatHistoryRes.data.length > 0, 'Fetching conversation history returns message list');

    // ----------------------------------------------------
    // TEST 5: Real-Time Socket.IO Communications
    // ----------------------------------------------------
    console.log('\n🔹 [Group 5: Real-Time Socket.IO Events]');
    const socketA = ClientSocket(`http://localhost:${TEST_PORT}`, { transports: ['websocket'], reconnection: false });
    const socketB = ClientSocket(`http://localhost:${TEST_PORT}`, { transports: ['websocket'], reconnection: false });

    // Wait for socket connections
    await Promise.all([
      new Promise((res) => socketA.on('connect', res)),
      new Promise((res) => socketB.on('connect', res))
    ]);
    assert(socketA.connected && socketB.connected, 'Two client sockets connected to server successfully');

    // Test user_online event
    const onlineListPromise = new Promise((resolve) => {
      socketA.on('online_users_list', (list) => {
        if (list.includes(bobId.toString())) {
          resolve(true);
        }
      });
    });

    socketA.emit('user_online', sarahId);
    socketB.emit('user_online', bobId);

    const onlineSuccess = await Promise.race([
      onlineListPromise,
      new Promise((res) => setTimeout(() => res(false), 2000))
    ]);
    assert(onlineSuccess, 'Socket emits user_online and broadcasts online users list');

    // Test Real-Time Send & Receive Message
    const receiveMessagePromise = new Promise((resolve) => {
      socketB.on('receive_message', (msg) => {
        resolve(msg);
      });
    });

    const messageSentAckPromise = new Promise((resolve) => {
      socketA.on('message_sent', (msg) => {
        resolve(msg);
      });
    });

    socketA.emit('send_message', {
      sender: sarahId,
      recipient: bobId,
      text: 'Instant real-time socket message! 🚀'
    });

    const [receivedMsg, ackMsg] = await Promise.all([
      receiveMessagePromise,
      messageSentAckPromise
    ]);

    assert(receivedMsg && receivedMsg.text === 'Instant real-time socket message! 🚀', 'Recipient receives real-time message through socket');
    assert(ackMsg && ackMsg.text === 'Instant real-time socket message! 🚀', 'Sender receives message_sent confirmation from server');

    // Test Typing Indicators
    const typingPromise = new Promise((resolve) => {
      socketB.on('user_typing', ({ senderId }) => {
        resolve(senderId.toString() === sarahId.toString());
      });
    });

    socketA.emit('typing', { senderId: sarahId, recipientId: bobId });
    const typingSuccess = await Promise.race([
      typingPromise,
      new Promise((res) => setTimeout(() => res(false), 2000))
    ]);
    assert(typingSuccess, 'Typing event emitted by sender is received by recipient');

    // Cleanup Sockets
    socketA.disconnect();
    socketB.disconnect();

  } catch (err) {
    console.error('Unexpected test runner error:', err);
    failedTests++;
  } finally {
    // Close test server
    server.close();
  }

  // ----------------------------------------------------
  // TEST SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`📊 Test Results: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
