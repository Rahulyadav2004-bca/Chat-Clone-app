import React from 'react';
import { MessageSquare, Zap, ShieldCheck, Database, Cpu } from 'lucide-react';

export const EmptyChat = () => {
  return (
    <div style={styles.container}>
      <div className="glass-card animate-pop-in" style={styles.card}>
        <div style={styles.iconCircle}>
          <MessageSquare size={40} color="#6366f1" />
        </div>
        <h2 style={styles.title}>Select a Contact to Start Messaging</h2>
        <p style={styles.subtitle}>
          Choose any user from the sidebar on the left to start a real-time conversation.
        </p>

        <div style={styles.featuresGrid}>
          <div style={styles.featureItem}>
            <Zap size={20} color="#10b981" />
            <div>
              <h4 style={styles.featureTitle}>Socket.IO Real-Time</h4>
              <p style={styles.featureDesc}>Instant messaging & active status</p>
            </div>
          </div>

          <div style={styles.featureItem}>
            <ShieldCheck size={20} color="#06b6d4" />
            <div>
              <h4 style={styles.featureTitle}>JWT Authentication</h4>
              <p style={styles.featureDesc}>Secure token-based auth flow</p>
            </div>
          </div>

          <div style={styles.featureItem}>
            <Database size={20} color="#a855f7" />
            <div>
              <h4 style={styles.featureTitle}>MongoDB Storage</h4>
              <p style={styles.featureDesc}>Persistent users & message history</p>
            </div>
          </div>

          <div style={styles.featureItem}>
            <Cpu size={20} color="#f59e0b" />
            <div>
              <h4 style={styles.featureTitle}>RESTful Express APIs</h4>
              <p style={styles.featureDesc}>Clean Node.js architecture</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-chat)',
    padding: '32px'
  },
  card: {
    maxWidth: '520px',
    padding: '40px 32px',
    textAlign: 'center',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  iconCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  title: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '22px',
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '32px',
    lineHeight: '1.5'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    width: '100%',
    textAlign: 'left'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(15, 23, 42, 0.6)',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)'
  },
  featureTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#f1f5f9'
  },
  featureDesc: {
    fontSize: '11px',
    color: '#94a3b8'
  }
};
