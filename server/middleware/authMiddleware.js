const jwt = require('jsonwebtoken');
const dbStore = require('../store/dbStore');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_chat_clone_2026');

      // Get user from token payload
      const user = await dbStore.findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
