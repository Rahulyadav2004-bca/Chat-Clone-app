import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { ChatBox } from './components/ChatBox';
import { EmptyChat } from './components/EmptyChat';
import { ProfileModal } from './components/ProfileModal';

const ChatAppContent = () => {
  const { user, loading } = useAuth();
  const [activeContact, setActiveContact] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading ChatClone...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <SocketProvider>
      <div style={styles.appContainer}>
        <Sidebar
          activeContact={activeContact}
          onSelectContact={(contact) => setActiveContact(contact)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {activeContact ? (
          <ChatBox contact={activeContact} />
        ) : (
          <EmptyChat />
        )}

        {isProfileModalOpen && (
          <ProfileModal onClose={() => setIsProfileModalOpen(false)} />
        )}
      </div>
    </SocketProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ChatAppContent />
    </AuthProvider>
  );
}

export default App;

const styles = {
  loadingContainer: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-dark)',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(99, 102, 241, 0.2)',
    borderTop: '3px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  appContainer: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--bg-dark)'
  }
};
