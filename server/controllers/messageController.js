const dbStore = require('../store/dbStore');

// @desc    Get messages between logged-in user and target user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Fetch message history
    const messages = await dbStore.getMessagesBetweenUsers(currentUserId, userId);

    // Mark messages sent by target user to current user as read
    await dbStore.markMessagesAsRead(userId, currentUserId);

    res.json(messages);
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ message: 'Error fetching chat messages' });
  }
};

// @desc    Send a message (REST API endpoint)
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { recipientId, text, image } = req.body;
    const senderId = req.user._id;

    if (!recipientId || (!text && !image)) {
      return res.status(400).json({ message: 'Recipient and message content are required' });
    }

    const message = await dbStore.createMessage({
      sender: senderId,
      recipient: recipientId,
      text,
      image
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

module.exports = { getMessages, sendMessage };
