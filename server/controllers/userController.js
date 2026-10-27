const dbStore = require('../store/dbStore');

// @desc    Get all users for chat contact list
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await dbStore.getAllUsers(req.user._id);
    res.json(users);
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: 'Error fetching users list' });
  }
};

module.exports = { getUsers };
