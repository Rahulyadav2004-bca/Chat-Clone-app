import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Lock, Mail, User, Sparkles, Check } from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80'
];

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [statusMessage, setStatusMessage] = useState('Building awesome apps! 🚀');
  const [loading, setLoading] = useState(false);
  const [localErr, setLocalErr] = useState('');

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr('');
    setLoading(true);

    if (isLogin) {
      if (!email || !password) {
        setLocalErr('Please fill in all fields');
        setLoading(false);
        return;
      }
      const res = await login(email, password);
      if (!res.success) {
        setLocalErr(res.message);
      }
    } else {
      if (!username || !email || !password) {
        setLocalErr('Please fill in all required fields');
        setLoading(false);
        return;
      }
      const res = await register(username, email, password, selectedAvatar, statusMessage);
      if (!res.success) {
        setLocalErr(res.message);
      }
    }
    setLoading(false);
  };

  const handleQuickDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div style={styles.container}>
      <div style={styles.backdropGlow} />
      <div className="glass-panel animate-pop-in" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <MessageSquare size={28} color="#6366f1" />
          </div>
          <h1 style={styles.title}>ChatClone</h1>
          <p style={styles.subtitle}>
            {isLogin ? 'Welcome back! Sign in to continue' : 'Create an account to start messaging'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={styles.tabContainer}>
          <button
            style={{
              ...styles.tabBtn,
              ...(isLogin ? styles.activeTab : {})
            }}
            onClick={() => {
              setIsLogin(true);
              setLocalErr('');
            }}
          >
            Sign In
          </button>
          <button
            style={{
              ...styles.tabBtn,
              ...(!isLogin ? styles.activeTab : {})
            }}
            onClick={() => {
              setIsLogin(false);
              setLocalErr('');
            }}
          >
            Register
          </button>
        </div>

        {localErr && <div style={styles.errorBox}>{localErr}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <div style={styles.inputWrapper}>
                <User size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="e.g. alex_dev"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Choose Avatar</label>
                <div style={styles.avatarGrid}>
                  {AVATAR_PRESETS.map((imgUrl, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedAvatar(imgUrl)}
                      style={{
                        ...styles.avatarOption,
                        border: selectedAvatar === imgUrl ? '2px solid #6366f1' : '2px solid transparent'
                      }}
                    >
                      <img src={imgUrl} alt="avatar option" style={styles.avatarImg} />
                      {selectedAvatar === imgUrl && (
                        <div style={styles.avatarCheck}>
                          <Check size={12} color="#fff" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Status Bio</label>
                <input
                  type="text"
                  placeholder="Status message..."
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  style={styles.inputWithoutIcon}
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" style={styles.submitBtn} disabled={loading}>
            {loading ? (
              'Processing...'
            ) : isLogin ? (
              'Sign In to Chat'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Quick Demo Login Helpers */}
        {isLogin && (
          <div style={styles.demoSection}>
            <div style={styles.demoTitle}>
              <Sparkles size={14} color="#6366f1" /> Quick Demo Accounts (Click to test):
            </div>
            <div style={styles.demoButtons}>
              <button
                type="button"
                style={styles.demoBtn}
                onClick={() => handleQuickDemoUser('sarah@example.com')}
              >
                Sarah Connor
              </button>
              <button
                type="button"
                style={styles.demoBtn}
                onClick={() => handleQuickDemoUser('alex@example.com')}
              >
                Alex Morgan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0b0f19 70%)',
    position: 'relative',
    padding: '20px'
  },
  backdropGlow: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'rgba(99, 102, 241, 0.15)',
    filter: 'blur(100px)',
    borderRadius: '50%',
    pointerEvents: 'none'
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    position: 'relative',
    zIndex: 1
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  logoBadge: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px'
  },
  title: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '28px',
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: '6px'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px'
  },
  tabContainer: {
    display: 'flex',
    background: 'rgba(15, 23, 42, 0.8)',
    borderRadius: '12px',
    padding: '4px',
    marginBottom: '20px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  tabBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeTab: {
    background: '#6366f1',
    color: '#ffffff',
    boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)'
  },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#cbd5e1'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px'
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#f8fafc',
    fontSize: '14px',
    transition: 'border 0.2s ease'
  },
  inputWithoutIcon: {
    width: '100%',
    padding: '12px',
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#f8fafc',
    fontSize: '14px'
  },
  avatarGrid: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'space-between'
  },
  avatarOption: {
    position: 'relative',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.2s ease'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarCheck: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(99, 102, 241, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitBtn: {
    marginTop: '8px',
    width: '100%',
    padding: '12px'
  },
  demoSection: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
  },
  demoTitle: {
    fontSize: '12px',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px'
  },
  demoButtons: {
    display: 'flex',
    gap: '8px'
  },
  demoBtn: {
    flex: 1,
    padding: '8px',
    fontSize: '12px',
    borderRadius: '8px',
    background: 'rgba(30, 41, 59, 0.6)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer'
  }
};
