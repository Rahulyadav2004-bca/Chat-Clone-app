import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, Image as ImageIcon, Smile, CheckCheck, Check, Phone, Video, Info } from 'lucide-react';

const EMOJI_LIST = ['😊', '🔥', '🚀', '❤️', '👍', '🎉', '💻', '✨', '🙌', '💯', '😍', '😎'];

const SAMPLE_IMAGE_ATTACHMENTS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80'
];

export const ChatBox = ({ contact }) => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isOnline = onlineUsers.includes(contact._id);

  // Fetch Chat History when contact changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${contact._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };

    if (contact?._id) {
      fetchChatHistory();
    }
  }, [contact?._id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Real-time Socket Listeners for Incoming Messages & Typing Indicators
  useEffect(() => {
    if (!socket) return;

    // Receive Message
    const handleReceiveMessage = (newMsg) => {
      const senderId = (newMsg.sender?._id || newMsg.sender)?.toString();
      const recipientId = (newMsg.recipient?._id || newMsg.recipient)?.toString();
      const contactId = contact?._id?.toString();
      const currentUserId = user?._id?.toString();

      if (
        (senderId === contactId && recipientId === currentUserId) ||
        (senderId === currentUserId && recipientId === contactId)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });

        // Mark message as read via socket
        socket.emit('mark_read', { senderId: contact._id, recipientId: user._id });
      }
    };

    // Confirmation when my message is sent
    const handleMessageSent = (sentMsg) => {
      const sentRecipientId = (sentMsg.recipient?._id || sentMsg.recipient)?.toString();
      const contactId = contact?._id?.toString();

      if (sentRecipientId === contactId) {
        setMessages((prev) => {
          // Replace matching temporary optimistic message if present
          const tempIndex = prev.findIndex(
            (m) =>
              m._id?.toString().startsWith('temp_') &&
              m.text === sentMsg.text &&
              (m.image || '') === (sentMsg.image || '')
          );
          if (tempIndex !== -1) {
            const next = [...prev];
            next[tempIndex] = sentMsg;
            return next;
          }
          if (prev.some((m) => m._id === sentMsg._id)) return prev;
          return [...prev, sentMsg];
        });
      }
    };

    // User Typing
    const handleUserTyping = ({ senderId }) => {
      if (senderId?.toString() === contact?._id?.toString()) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = ({ senderId }) => {
      if (senderId?.toString() === contact?._id?.toString()) {
        setIsTyping(false);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, contact._id, user._id]);

  // Handle Input Typing Event
  const handleInputChange = (e) => {
    setText(e.target.value);

    if (socket) {
      socket.emit('typing', { senderId: user._id, recipientId: contact._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { senderId: user._id, recipientId: contact._id });
      }, 1500);
    }
  };

  // Send Message Action
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !selectedImage) return;

    const msgPayload = {
      sender: user._id,
      recipient: contact._id,
      text: text.trim(),
      image: selectedImage
    };

    // Optimistic UI update
    const optimisticMsg = {
      _id: 'temp_' + Date.now(),
      sender: user._id,
      recipient: contact._id,
      text: text.trim(),
      image: selectedImage,
      status: 'sent',
      createdAt: new Date()
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    // Emit via socket for real-time delivery
    if (socket) {
      socket.emit('send_message', msgPayload);
      socket.emit('stop_typing', { senderId: user._id, recipientId: contact._id });
    }

    setText('');
    setSelectedImage('');
    setShowEmojiPicker(false);
    setShowImagePicker(false);
  };

  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.chatContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerUser}>
          <div style={{ position: 'relative' }}>
            <img src={contact.avatar} alt={contact.username} style={styles.avatar} />
            <span className={isOnline ? 'online-indicator' : 'offline-indicator'} />
          </div>
          <div>
            <h2 style={styles.username}>{contact.username}</h2>
            <span style={{ ...styles.statusText, color: isOnline ? '#10b981' : '#94a3b8' }}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.headerIconBtn} title="Audio Call (Simulated)">
            <Phone size={18} color="#94a3b8" />
          </button>
          <button style={styles.headerIconBtn} title="Video Call (Simulated)">
            <Video size={18} color="#94a3b8" />
          </button>
          <button style={styles.headerIconBtn} title="User Details">
            <Info size={18} color="#94a3b8" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div style={styles.messagesArea}>
        <div style={styles.encryptionNotice}>
          🔒 End-to-end encrypted real-time connection powered by Socket.IO & JWT
        </div>

        {messages.map((msg, index) => {
          const isMe = (msg.sender?._id || msg.sender)?.toString() === user._id?.toString();

          return (
            <div
              key={msg._id || index}
              className="animate-fade-in"
              style={{
                ...styles.messageRow,
                justifyContent: isMe ? 'flex-end' : 'flex-start'
              }}
            >
              {!isMe && (
                <img src={contact.avatar} alt={contact.username} style={styles.msgAvatar} />
              )}

              <div
                style={{
                  ...styles.bubble,
                  ...(isMe ? styles.myBubble : styles.theirBubble)
                }}
              >
                {msg.image && (
                  <img src={msg.image} alt="Attachment" style={styles.attachmentImg} />
                )}
                {msg.text && <p style={styles.bubbleText}>{msg.text}</p>}

                <div style={styles.bubbleFooter}>
                  <span style={styles.timestamp}>{formatTime(msg.createdAt)}</span>
                  {isMe && (
                    <span style={styles.readReceipt}>
                      {msg.status === 'read' ? (
                        <CheckCheck size={14} color="#38bdf8" />
                      ) : (
                        <Check size={14} color="#94a3b8" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Dots Indicator */}
        {isTyping && (
          <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
            <img src={contact.avatar} alt={contact.username} style={styles.msgAvatar} />
            <div style={styles.typingBubble}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview Bar */}
      {selectedImage && (
        <div style={styles.previewBar}>
          <img src={selectedImage} alt="Preview" style={styles.previewThumb} />
          <span style={styles.previewText}>Image attachment ready</span>
          <button style={styles.removePreviewBtn} onClick={() => setSelectedImage('')}>
            ✕
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div style={styles.inputArea}>
        {/* Emoji Picker Popover */}
        {showEmojiPicker && (
          <div className="glass-card animate-pop-in" style={styles.emojiPopover}>
            {EMOJI_LIST.map((emoji, idx) => (
              <button key={idx} style={styles.emojiBtn} onClick={() => addEmoji(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Image Attachment Popover */}
        {showImagePicker && (
          <div className="glass-card animate-pop-in" style={styles.imagePopover}>
            <p style={styles.popoverTitle}>Attach Sample Image:</p>
            <div style={styles.sampleImgGrid}>
              {SAMPLE_IMAGE_ATTACHMENTS.map((imgUrl, i) => (
                <img
                  key={i}
                  src={imgUrl}
                  alt="sample attachment"
                  style={styles.sampleThumb}
                  onClick={() => {
                    setSelectedImage(imgUrl);
                    setShowImagePicker(false);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} style={styles.inputForm}>
          <div style={styles.inputActions}>
            <button
              type="button"
              style={styles.toolBtn}
              onClick={() => {
                setShowEmojiPicker((prev) => !prev);
                setShowImagePicker(false);
              }}
            >
              <Smile size={20} color={showEmojiPicker ? '#6366f1' : '#94a3b8'} />
            </button>

            <button
              type="button"
              style={styles.toolBtn}
              onClick={() => {
                setShowImagePicker((prev) => !prev);
                setShowEmojiPicker(false);
              }}
            >
              <ImageIcon size={20} color={showImagePicker ? '#6366f1' : '#94a3b8'} />
            </button>
          </div>

          <input
            type="text"
            placeholder={`Message ${contact.username}...`}
            value={text}
            onChange={handleInputChange}
            style={styles.chatInput}
          />

          <button type="submit" className="btn-primary" style={styles.sendBtn}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  chatContainer: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-chat)'
  },
  header: {
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(15, 23, 42, 0.9)',
    borderBottom: '1px solid var(--border-color)'
  },
  headerUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  username: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f8fafc'
  },
  statusText: {
    fontSize: '12px',
    fontWeight: '500'
  },
  headerActions: {
    display: 'flex',
    gap: '8px'
  },
  headerIconBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'var(--bg-card-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  encryptionNotice: {
    alignSelf: 'center',
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid var(--border-color)',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '12px'
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    maxWidth: '80%'
  },
  msgAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  bubble: {
    padding: '10px 14px',
    borderRadius: '16px',
    position: 'relative',
    maxWidth: '100%',
    wordBreak: 'break-word'
  },
  myBubble: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#ffffff',
    borderBottomRightRadius: '4px',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
  },
  theirBubble: {
    background: 'rgba(30, 41, 59, 0.9)',
    color: '#f8fafc',
    borderBottomLeftRadius: '4px',
    border: '1px solid var(--border-color)'
  },
  bubbleText: {
    fontSize: '14px',
    lineHeight: '1.4'
  },
  attachmentImg: {
    maxWidth: '240px',
    maxHeight: '200px',
    borderRadius: '10px',
    marginBottom: '6px',
    display: 'block'
  },
  bubbleFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
    marginTop: '4px'
  },
  timestamp: {
    fontSize: '10px',
    opacity: 0.75
  },
  readReceipt: {
    display: 'flex',
    alignItems: 'center'
  },
  typingBubble: {
    background: 'rgba(30, 41, 59, 0.9)',
    padding: '12px 18px',
    borderRadius: '18px',
    borderBottomLeftRadius: '4px',
    display: 'flex',
    gap: '4px',
    alignItems: 'center'
  },
  previewBar: {
    padding: '8px 16px',
    background: 'rgba(30, 41, 59, 0.8)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderTop: '1px solid var(--border-color)'
  },
  previewThumb: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    objectFit: 'cover'
  },
  previewText: {
    fontSize: '12px',
    color: '#cbd5e1'
  },
  removePreviewBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '16px'
  },
  inputArea: {
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.9)',
    borderTop: '1px solid var(--border-color)',
    position: 'relative'
  },
  emojiPopover: {
    position: 'absolute',
    bottom: '75px',
    left: '16px',
    padding: '10px',
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '6px',
    zIndex: 10
  },
  emojiBtn: {
    fontSize: '20px',
    background: 'transparent',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px'
  },
  imagePopover: {
    position: 'absolute',
    bottom: '75px',
    left: '50px',
    padding: '12px',
    zIndex: 10
  },
  popoverTitle: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '8px'
  },
  sampleImgGrid: {
    display: 'flex',
    gap: '8px'
  },
  sampleThumb: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    objectFit: 'cover',
    cursor: 'pointer'
  },
  inputForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  inputActions: {
    display: 'flex',
    gap: '4px'
  },
  toolBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'var(--bg-card-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  chatInput: {
    flex: 1,
    padding: '12px 16px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    color: '#f8fafc',
    fontSize: '14px'
  },
  sendBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    padding: 0
  }
};
