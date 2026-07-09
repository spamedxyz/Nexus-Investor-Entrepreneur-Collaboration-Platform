/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import InvestorDashboard from './components/InvestorDashboard';
import EntrepreneurDashboard from './components/EntrepreneurDashboard';
import AdminDashboard from './components/AdminDashboard';
import MeetingsPanel from './components/MeetingsPanel';
import DocumentsPanel from './components/DocumentsPanel';
import WalletPanel from './components/WalletPanel';
import ChatPanel from './components/ChatPanel';
import { UserRole } from './types';
import { HelpCircle, Sparkles, LogIn } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [wallet, setWallet] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeChatTargetId, setActiveChatTargetId] = useState<string | undefined>(undefined);
  const [appReady, setAppReady] = useState(false);

  const notificationsPollRef = useRef<any | null>(null);

  // Validate session on mount
  useEffect(() => {
    checkActiveSession();
    // Configure default dark theme on document root
    const savedTheme = localStorage.getItem('nexus_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Update theme document class whenever state changes
  useEffect(() => {
    localStorage.setItem('nexus_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle polling unread notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      if (notificationsPollRef.current) clearInterval(notificationsPollRef.current);
      notificationsPollRef.current = setInterval(fetchNotifications, 5000);
    } else {
      setNotifications([]);
      if (notificationsPollRef.current) clearInterval(notificationsPollRef.current);
    }
    return () => {
      if (notificationsPollRef.current) clearInterval(notificationsPollRef.current);
    };
  }, [isAuthenticated]);

  const checkActiveSession = async () => {
    const token = localStorage.getItem('nexus_auth_token');
    if (!token) {
      setAppReady(true);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfile(data.profile);
        setWallet(data.wallet);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('nexus_auth_token');
      }
    } catch (e) {
      console.error('Session validation error:', e);
    } finally {
      setAppReady(true);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('nexus_auth_token');
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefreshWallet = async () => {
    try {
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
        setProfile(data.profile);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessageFromFeed = (receiverId: string, initialText: string) => {
    setActiveChatTargetId(receiverId);
    setActiveTab('chat');
  };

  const handleRequestMeetingFromFeed = (receiverId: string) => {
    setActiveTab('meetings');
  };

  const handleLogoutSession = () => {
    localStorage.removeItem('nexus_auth_token');
    setUser(null);
    setProfile(null);
    setWallet(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  if (!appReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-slate-400 mt-3 tracking-widest uppercase">Nexus Security Checking...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {!isAuthenticated ? (
        <Auth
  onAuthSuccess={(token, userData, profileData, walletData) => {
    localStorage.setItem("nexus_auth_token", token);

    setUser(userData);
    setProfile(profileData);
    setWallet(walletData);
    setIsAuthenticated(true);
  }}
/>
      ) : (
        <div className="flex flex-col min-h-screen">
          <Navbar
            user={user}
            profile={profile}
            wallet={wallet}
            theme={theme}
            setTheme={setTheme}
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'chat') setActiveChatTargetId(undefined);
            }}
            onLogout={handleLogoutSession}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
            
            {/* View tab routers */}
            {activeTab === 'dashboard' && (
              <>
                {user.role === UserRole.INVESTOR && (
                  <InvestorDashboard
                    user={user}
                    profile={profile}
                    wallet={wallet}
                    onRefreshWallet={handleRefreshWallet}
                    onSendMessage={handleSendMessageFromFeed}
                    onRequestMeeting={handleRequestMeetingFromFeed}
                    onNavigateToTab={setActiveTab}
                  />
                )}
                {user.role === UserRole.ENTREPRENEUR && (
                  <EntrepreneurDashboard
                    user={user}
                    profile={profile}
                    wallet={wallet}
                    onRefreshProfile={(updated) => setProfile(updated)}
                    onRefreshWallet={handleRefreshWallet}
                  />
                )}
                {user.role === UserRole.ADMIN && (
                  <AdminDashboard />
                )}
              </>
            )}

            {activeTab === 'meetings' && (
              <MeetingsPanel
                user={user}
                profile={profile}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsPanel
                user={user}
                profile={profile}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'chat' && (
              <ChatPanel
                user={user}
                profile={profile}
                activeChatTargetId={activeChatTargetId}
              />
            )}

            {activeTab === 'wallet' && (
              <WalletPanel
                user={user}
                profile={profile}
                wallet={wallet}
                onRefreshWallet={handleRefreshWallet}
              />
            )}

          </main>
        </div>
      )}
    </div>
  );
}

