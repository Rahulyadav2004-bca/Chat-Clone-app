import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Search, LogOut, Settings } from 'lucide-react';

export const Sidebar = ({ activeContact, onSelectContact, onOpenProfile }) => {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users');
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching contacts:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside style={styles.sidebar}>
      {/* Header Profile Section */}
      <div style={styles.header}>
        <div style={styles.userInfo}>
          <div style={{ position: 'relative' }}>
            <img src={user?.avatar} alt={user?.username} style={styles.myAvatar} />
            <span className="online-indicator" />
          </div>
          <div style={styles.userText}>
            <h3 style={styles.username}>{user?.username}</h3>
            <p style={styles.statusText}>{user?.statusMessage || 'Available'}</p>
          </div>
        </div>

        <div style={styles.actionButtons}>
          <button style={styles.iconBtn} onClick={onOpenProfile} title="Edit Profile">
            <Settings size={18} color="#94a3b8" />
          </button>
          <button style={styles.iconBtn} onClick={logout} title="Sign Out">
            <LogOut size={18} color="#ef4444" />
          </button>
        </div>
      </div>

      {/* Search Contact Bar */}
      <div style={styles.searchContainer}>
        <div style={styles.searchWrapper}>
          <Search size={16} color="#64748b" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search contacts or start chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Contacts List Header */}
      <div style={styles.listHeader}>
        <span style={styles.listHeaderTitle}>Messages & Contacts</span>
        <span style={styles.onlineBadgeCount}>
          {onlineUsers.length} Online
        </span>
      </div>

      {/* Users / Contacts List */}
      <div style={styles.contactsList}>
        {loading ? (
          <div style={styles.emptyState}>Loading contacts...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={styles.emptyState}>No users found</div>
        ) : (
          filteredUsers.map((contact) => {
            const isOnline = onlineUsers.includes(contact._id);
            const isActive = activeContact?._id === contact._id;

            return (
              <div
                key={contact._id}
                onClick={() => onSelectContact(contact)}
                style={{
                  ...styles.contactItem,
                  ...(isActive ? styles.activeContactItem : {})
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={contact.avatar} alt={contact.username} style={styles.contactAvatar} />
                  <span className={isOnline ? 'online-indicator' : 'offline-indicator'} />
                </div>

                <div style={styles.contactInfo}>
                  <div style={styles.contactTopRow}>
                    <span style={styles.contactName}>{contact.username}</span>
                    <span style={styles.statusLabel}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <p style={styles.contactBio}>{contact.statusMessage}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '320px',
    height: '100%',
    background: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0
  },
  header: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.9)'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  myAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  userText: {
    display: 'flex',
    flexDirection: 'column'
  },
  username: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#f8fafc'
  },
  statusText: {
    fontSize: '12px',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px'
  },
  actionButtons: {
    display: 'flex',
    gap: '4px'
  },
  iconBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  searchContainer: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)'
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '10px'
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px 8px 34px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '13px'
  },
  listHeader: {
    padding: '12px 16px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  listHeaderTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  onlineBadgeCount: {
    fontSize: '11px',
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: '500'
  },
  contactsList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'all 0.15s ease'
  },
  activeContactItem: {
    background: 'rgba(99, 102, 241, 0.15)',
    borderLeft: '4px solid #6366f1'
  },
  contactAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  contactInfo: {
    flex: 1,
    overflow: 'hidden'
  },
  contactTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2px'
  },
  contactName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9'
  },
  statusLabel: {
    fontSize: '11px',
    color: '#64748b'
  },
  contactBio: {
    fontSize: '12px',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  emptyState: {
    padding: '32px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px'
  }
};
