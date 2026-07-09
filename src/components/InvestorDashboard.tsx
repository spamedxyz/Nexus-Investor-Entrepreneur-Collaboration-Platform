/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, Calendar, Compass, ArrowRight, DollarSign, Award, Target, HelpCircle } from 'lucide-react';

interface InvestorDashboardProps {
  user: any;
  profile: any;
  wallet: any;
  onRefreshWallet: () => void;
  onSendMessage: (receiverId: string, text: string) => void;
  onRequestMeeting: (receiverId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function InvestorDashboard({
  user,
  profile,
  wallet,
  onRefreshWallet,
  onSendMessage,
  onRequestMeeting,
  onNavigateToTab
}: InvestorDashboardProps) {
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [targetStartup, setTargetStartup] = useState<any | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [investMessage, setInvestMessage] = useState('');
  const [investError, setInvestError] = useState<string | null>(null);
  const [investSuccess, setInvestSuccess] = useState(false);

  useEffect(() => {
    fetchStartups();
  }, [search, selectedIndustry]);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      let query = `/api/profiles?role=entrepreneur`;
      if (selectedIndustry) {
        query += `&industry=${encodeURIComponent(selectedIndustry)}`;
      }
      if (search) {
        query += `&q=${encodeURIComponent(search)}`;
      }

      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch(query, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStartups(data);
    } catch (e) {
      console.error('Error fetching startups:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvest = (startup: any) => {
    setTargetStartup(startup);
    setInvestAmount('');
    setInvestMessage('');
    setInvestError(null);
    setInvestSuccess(false);
    setShowInvestModal(true);
  };

  const handleExecuteInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvestError(null);

    const amount = Number(investAmount);
    if (!amount || amount <= 0) {
      setInvestError('Please enter a valid positive capital amount');
      return;
    }

    if (amount > wallet.balance) {
      setInvestError('Insufficient capital ledger balance. Please deposit more funds in your Wallet.');
      return;
    }

    try {
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: targetStartup.userId,
          amount,
          message: investMessage || `Seed Capital Injection from ${profile.name}`
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete ledger transaction');
      }

      setInvestSuccess(true);
      onRefreshWallet();
      setTimeout(() => {
        setShowInvestModal(false);
        fetchStartups();
      }, 1500);

    } catch (err: any) {
      setInvestError(err.message);
    }
  };

  return (
    <div id="investor-dashboard" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Visual Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 relative">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Investor Intelligence</h1>
            <p className="text-slate-300 text-sm">
              Discover verified opportunities, deploy capital from ledger wallets, and track equity positions.
            </p>
          </div>
          <button 
            onClick={() => onNavigateToTab('wallet')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-mono tracking-wider text-slate-100 flex items-center gap-1.5 transition-all"
          >
            <DollarSign className="w-4 h-4 text-emerald-400" /> DEPOSIT LEDGER FUNDS
          </button>
        </div>
      </div>

      {/* Overview stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 flex items-center gap-4">
          <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Total Deployed</p>
            <p className="text-xl font-display font-semibold mt-0.5 text-slate-800 dark:text-white">
              ${(profile?.totalInvested || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Deals Closed</p>
            <p className="text-xl font-display font-semibold mt-0.5 text-slate-800 dark:text-white">
              {profile?.investmentsCount || 0} Backed
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 flex items-center gap-4">
          <div className="p-3.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Available Liquidity</p>
            <p className="text-xl font-display font-semibold mt-0.5 text-slate-800 dark:text-white">
              ${(wallet?.balance || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Discovery Area */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Market Venture Directory</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                id="startup-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search startup name, keywords..."
                className="w-full sm:w-64 pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Filter select */}
            <div className="relative">
              <select
                id="startup-industry-filter"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full pl-9 pr-6 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
              >
                <option value="">All Industries</option>
                <option>Artificial Intelligence</option>
                <option>SaaS</option>
                <option>Fintech</option>
                <option>Healthcare & Life Sciences</option>
                <option>ClimateTech</option>
                <option>Cybersecurity</option>
                <option>Deeptech</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Startups List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map(n => (
              <div key={n} className="p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 bg-white/30 dark:bg-slate-950/30 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : startups.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-sm text-slate-400">No startup ventures match your active filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {startups.map((startup) => {
              const fundingPercent = Math.min(100, Math.round(((startup.fundingRaised || 0) / (startup.fundingGoal || 1)) * 100));
              return (
                <div 
                  key={startup.userId} 
                  id={`startup-card-${startup.userId}`}
                  className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm flex flex-col justify-between hover:shadow-lg hover:border-indigo-500/20 dark:hover:border-indigo-500/25 transition-all group"
                >
                  <div className="space-y-4">
                    {/* Startup Header */}
                    <div className="flex items-start gap-3">
                      <img
                        src={startup.avatar}
                        alt={startup.name}
                        className="w-12 h-12 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50 object-cover"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {startup.startupName || `${startup.name}'s Startup`}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-400 font-mono">
                            {startup.fundingStage}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-none">Founded by {startup.name} • {startup.industry}</p>
                      </div>
                    </div>

                    {/* Startup Bio */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans line-clamp-2">
                      {startup.startupDescription || startup.bio}
                    </p>

                    {/* Funding statistics */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase">
                        <span>Fundraising Goal</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          ${(startup.fundingRaised || 0).toLocaleString()} / ${(startup.fundingGoal || 0).toLocaleString()} ({fundingPercent}%)
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${fundingPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Skills/Tags */}
                    {startup.skills && startup.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {startup.skills.slice(0, 3).map((tag: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-500/5 dark:bg-indigo-500/10 text-[9px] text-indigo-500 dark:text-indigo-400 font-mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA Actions */}
                  <div className="flex items-center gap-2 pt-5 mt-4 border-t border-slate-100 dark:border-slate-900">
                    <button
                      onClick={() => onSendMessage(startup.userId, `Hi ${startup.name}, I reviewed your startup OmniMind AI on the dashboard and wanted to learn more.`)}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all flex items-center justify-center cursor-pointer"
                      title="Direct Chat Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRequestMeeting(startup.userId)}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all flex items-center justify-center cursor-pointer"
                      title="Schedule Meeting"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenInvest(startup)}
                      className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/10 text-white font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Back Venture
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Investment Modal */}
      {showInvestModal && targetStartup && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-premium rounded-3xl overflow-hidden border border-white/40 dark:border-slate-800/80 animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white">Back Venture Capital</h2>
              <button 
                onClick={() => setShowInvestModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteInvestment} className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <img src={targetStartup.avatar} className="w-9 h-9 rounded-lg border border-slate-200/50 object-cover" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-white">{targetStartup.startupName}</h4>
                  <p className="text-[10px] text-slate-400">By {targetStartup.name} • Stage: {targetStartup.fundingStage}</p>
                </div>
              </div>

              {investError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                  <span>{investError}</span>
                </div>
              )}

              {investSuccess ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto text-lg font-bold">
                    ✓
                  </div>
                  <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white">Transaction Successful</h3>
                  <p className="text-xs text-slate-400">Capital wired to the startup ledger securely.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Capital Ledger Injection (USD)</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        id="invest-amount-input"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        placeholder="e.g. 50000"
                        className="w-full pl-8 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">Available balance: ${wallet.balance.toLocaleString()}</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">VC Investment Reference Message</label>
                    <textarea
                      value={investMessage}
                      id="invest-message-textarea"
                      onChange={(e) => setInvestMessage(e.target.value)}
                      placeholder="e.g. Series Seed backing for private cloud expansion"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2"
                      rows={2}
                    />
                  </div>

                  <button
                    type="submit"
                    id="invest-execute-button"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-all cursor-pointer shadow-md"
                  >
                    Confirm Ledger Wire Capital
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
