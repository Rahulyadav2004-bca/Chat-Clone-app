import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Check } from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80'
];

export const ProfileModal = ({ onClose }) => {
  const { user, updateProfile } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || '');
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_PRESETS[0]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const res = await updateProfile({ username, statusMessage, avatar });
    setLoading(false);
    if (res.success) {
      setMsg('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setMsg(res.message || 'Failed to update');
    }
  };

  return (
    <div style={styles.overlay}>
      <div className="glass-card animate-pop-in" style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Edit Profile Settings</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} color="#94a3b8" />
          </button>
        </div>

        {msg && <div style={styles.msgBanner}>{msg}</div>}

        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.avatarSection}>
            <img src={avatar} alt="Current avatar" style={styles.currentAvatar} />
            <div style={styles.avatarPickerGroup}>
              <label style={styles.label}>Preset Avatars</label>
              <div style={styles.presetGrid}>
                {AVATAR_PRESETS.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setAvatar(url)}
                    style={{
                      ...styles.presetOption,
                      border: avatar === url ? '2px solid #6366f1' : '2px solid transparent'
                    }}
                  >
                    <img src={url} alt="preset" style={styles.presetImg} />
                    {avatar === url && (
                      <div style={styles.presetCheck}>
                        <Check size={10} color="#fff" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Display Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Status Message</label>
            <input
              type="text"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.modalFooter}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '20px'
  },
  modal: {
    width: '100%',
    maxWidth: '460px',
    padding: '24px',
    borderRadius: '20px'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#f8fafc'
  },
  closeBtn: {
    background: 'transparent',
    cursor: 'pointer'
  },
  msgBanner: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  avatarSection: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    background: 'rgba(15, 23, 42, 0.6)',
    padding: '12px',
    borderRadius: '12px'
  },
  currentAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  avatarPickerGroup: {
    flex: 1
  },
  label: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '6px',
    display: 'block'
  },
  presetGrid: {
    display: 'flex',
    gap: '6px'
  },
  presetOption: {
    position: 'relative',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    overflow: 'hidden'
  },
  presetImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  presetCheck: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(99, 102, 241, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  field: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    padding: '10px 14px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '14px'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '12px'
  }
};
