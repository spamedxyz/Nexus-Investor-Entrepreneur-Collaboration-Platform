/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MessageSquare, Shield, HelpCircle, Check, Clock } from 'lucide-react';

interface ChatPanelProps {
  user: any;
  profile: any;
  activeChatTargetId?: string;
}

export default function ChatPanel({ user, profile, activeChatTargetId }: ChatPanelProps) {
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pollIntervalRef = useRef<any | null>(null);

  useEffect(() => {
    fetchChannels();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Set initial active target channel if passed by parent (e.g. Back Venture or Direct Message click on dashboards)
  useEffect(() => {
    if (activeChatTargetId) {
      handleInitiateChannel(activeChatTargetId);
    }
  }, [activeChatTargetId]);

  // Handle periodic message polling when a channel is active
  useEffect(() => {
    if (activeChannelId) {
      fetchMessages(activeChannelId);
      
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(activeChannelId);
      }, 3000);
    } else {
      setMessages([]);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeChannelId]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch('/api/chat/channels', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setChannels(data);
      if (data.length > 0 && !activeChannelId && !activeChatTargetId) {
        setActiveChannelId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch(`/api/chat/channels/${channelId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInitiateChannel = async (targetUserId: string) => {
    try {
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch('/api/chat/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId })
      });
      const data = await response.json();
      fetchChannels();
      setActiveChannelId(data.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChannelId) return;

    const textToSend = typedMessage.trim();
    setTypedMessage('');

    try {
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          channelId: activeChannelId,
          text: textToSend
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, data]);
    } catch (e) {
      console.error(e);
    }
  };

  // Get current active partner profile
  const activeChannel = channels.find(c => c.id === activeChannelId);
  const activePartnerName = activeChannel ? (activeChannel.user1Id === user.id ? activeChannel.user2Name : activeChannel.user1Name) : '';

  const filteredChannels = channels.filter(c => {
    const partner = c.user1Id === user.id ? c.user2Name : c.user1Name;
    return partner.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div id="chat-panel" className="h-[520px] rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm overflow-hidden flex animate-in fade-in duration-300">
      
      {/* Channels Sidebar */}
      <div className="w-64 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-900 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Venture Inbox</span>
          
          <div className="relative">
            <input
              type="text"
              id="chat-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Channels List scrolling */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50 dark:divide-slate-800/40">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(n => <div key={n} className="h-10 bg-slate-100 dark:bg-slate-900 rounded-lg animate-pulse"></div>)}
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No conversations started yet.
            </div>
          ) : (
            filteredChannels.map((c) => {
              const partnerName = c.user1Id === user.id ? c.user2Name : c.user1Name;
              const isActive = c.id === activeChannelId;

              return (
                <div
                  key={c.id}
                  id={`chat-channel-${c.id}`}
                  onClick={() => setActiveChannelId(c.id)}
                  className={`p-3 text-xs flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all ${
                    isActive ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-l-2 border-indigo-500 font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">
                    {partnerName[0]}
                  </div>
                  <div className="space-y-0.5 truncate flex-1">
                    <p className="truncate text-slate-800 dark:text-slate-200 font-semibold">{partnerName}</p>
                    <p className="text-[10px] text-slate-400 truncate">Venture Matching Channel</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Secure Ledger notice */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-900/60 text-[9px] text-slate-400 flex items-center gap-1.5 font-mono">
          <Shield className="w-3.5 h-3.5 text-emerald-500" /> SECURED CHAT
        </div>
      </div>

      {/* Messages Pane */}
      <div className="flex-1 flex flex-col justify-between bg-white/20 dark:bg-slate-950/20">
        
        {activeChannelId ? (
          <>
            {/* Active partner bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">{activePartnerName}</h3>
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5">DIRECT SECURED TELEMETRY</span>
              </div>
            </div>

            {/* Bubble Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => {
                const isMine = msg.senderUserId === user.id;

                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-150`}
                  >
                    <div className="max-w-[70%] space-y-1">
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMine 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/40 dark:border-slate-800/40'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono text-right block pr-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Form Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-900 flex gap-2">
              <input
                type="text"
                required
                id="chat-message-input"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Write secure message..."
                className="flex-1 px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                id="chat-message-submit"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md shadow-indigo-500/10"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* Empty State visual */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-800" />
            <div className="space-y-1">
              <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-300">Select Conversation Thread</h4>
              <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                Pick a venture partner from the inbox channel sidebar, or browse dashboard opportunities to start chats.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
