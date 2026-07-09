/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Bell, CreditCard, LogOut, Moon, Sun, Shield, Layers, HelpCircle } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  user: any;
  profile: any;
  wallet: any;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  onLogout: () => void;
  notifications: any[];
  onMarkNotificationRead: (id: string) => void;
}

export default function Navbar({
  user,
  profile,
  wallet,
  theme,
  setTheme,
  activeTab,
  setActiveTab,
  onLogout,
  notifications,
  onMarkNotificationRead
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (id: string) => {
    onMarkNotificationRead(id);
  };

  return (
    <header id="app-navbar" className="sticky top-0 z-40 w-full glass border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Nav links */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="p-2 bg-indigo-600 rounded-xl shadow-md shadow-indigo-500/10">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-semibold text-lg tracking-tight text-slate-900 dark:text-white">NEXUS</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              V1.2
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'dashboard' 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              Dashboard
            </button>
            <button
              id="nav-tab-meetings"
              onClick={() => setActiveTab('meetings')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'meetings' 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              Scheduler & Call
            </button>
            <button
              id="nav-tab-documents"
              onClick={() => setActiveTab('documents')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'documents' 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              Document Chamber
            </button>
            <button
              id="nav-tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'chat' 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              Messenger
            </button>
            <button
              id="nav-tab-wallet"
              onClick={() => setActiveTab('wallet')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'wallet' 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              Wallet
            </button>
          </nav>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          
          {/* Wallet Balance Widget */}
          <div 
            onClick={() => setActiveTab('wallet')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-pointer hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition-all font-mono text-sm font-semibold"
          >
            <CreditCard className="w-4 h-4" />
            <span>${(wallet?.balance || 0).toLocaleString()}</span>
          </div>

          {/* Theme Toggler */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
            title="Toggle Visual Theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center border-2 border-white dark:border-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl glass-premium border border-slate-200/60 dark:border-slate-800/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Activity stream</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                    {unreadCount} unread
                  </span>
                </div>
                
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No recent notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n.id)}
                        className={`p-3.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all cursor-pointer relative ${
                          !n.read ? 'bg-indigo-500/5 dark:bg-indigo-500/10 font-medium' : ''
                        }`}
                      >
                        {!n.read && (
                          <span className="absolute left-2.5 top-4.5 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                        )}
                        <div className="pl-2">
                          <p className="font-semibold text-slate-800 dark:text-white">{n.title}</p>
                          <p className="text-slate-500 dark:text-slate-400 leading-normal mt-0.5">{n.message}</p>
                          <span className="text-[9px] text-slate-400 block mt-1.5 font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Identity Capsule */}
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
            <img
              src={profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.name || 'User')}`}
              alt={profile?.name}
              className="w-8.5 h-8.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 object-cover"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-white leading-none">{profile?.name || 'Venture Partner'}</p>
              <span className="text-[10px] text-slate-400 capitalize block mt-0.5">
                {user?.role === UserRole.ADMIN ? 'Administrator' : user?.role}
              </span>
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={onLogout}
            className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
            title="Log out of session"
          >
            <LogOut className="w-5 h-5" />
          </button>

        </div>
      </div>

      {/* Mobile navigation tab-bar */}
      <div className="md:hidden flex h-12 border-t border-slate-200/50 dark:border-slate-800/50 justify-around items-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-md">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`text-xs flex flex-col items-center gap-0.5 ${activeTab === 'dashboard' ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}
        >
          <span>Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab('meetings')} 
          className={`text-xs flex flex-col items-center gap-0.5 ${activeTab === 'meetings' ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}
        >
          <span>Scheduler</span>
        </button>
        <button 
          onClick={() => setActiveTab('documents')} 
          className={`text-xs flex flex-col items-center gap-0.5 ${activeTab === 'documents' ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}
        >
          <span>Chamber</span>
        </button>
        <button 
          onClick={() => setActiveTab('chat')} 
          className={`text-xs flex flex-col items-center gap-0.5 ${activeTab === 'chat' ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}
        >
          <span>Chat</span>
        </button>
        <button 
          onClick={() => setActiveTab('wallet')} 
          className={`text-xs flex flex-col items-center gap-0.5 ${activeTab === 'wallet' ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}
        >
          <span>Wallet</span>
        </button>
      </div>
    </header>
  );
}
