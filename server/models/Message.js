const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Message', messageSchema);
