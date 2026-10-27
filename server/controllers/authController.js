const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbStore = require('../store/dbStore');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_chat_clone_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, avatar, statusMessage } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please include username, email and password' });
    }

    // Check if user exists
    const userExists = await dbStore.findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default avatar if none provided
    const userAvatar =
      avatar ||
      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`;

    // Create user
    const user = await dbStore.createUser({
      username,
      email,
      password: hashedPassword,
      avatar: userAvatar,
      statusMessage: statusMessage || 'Hey there! I am using Chat Clone.'
    });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        statusMessage: user.statusMessage,
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await dbStore.findUserWithPassword(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update online status
    await dbStore.updateUserStatus(user._id, true);

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      statusMessage: user.statusMessage,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await dbStore.findUserById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { username, avatar, statusMessage } = req.body;
    const updatedUser = await dbStore.updateUserProfile(req.user._id, {
      ...(username && { username }),
      ...(avatar && { avatar }),
      ...(statusMessage && { statusMessage })
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};
