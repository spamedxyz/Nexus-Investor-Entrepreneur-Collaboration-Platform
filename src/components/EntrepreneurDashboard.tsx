/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Target, Sparkles, TrendingUp, Compass, Cpu, HelpCircle, Save, Check, RefreshCw, AlertTriangle, Lightbulb } from 'lucide-react';

interface EntrepreneurDashboardProps {
  user: any;
  profile: any;
  wallet: any;
  onRefreshProfile: (updatedProfile: any) => void;
  onRefreshWallet: () => void;
}

export default function EntrepreneurDashboard({
  user,
  profile,
  wallet,
  onRefreshProfile,
  onRefreshWallet
}: EntrepreneurDashboardProps) {
  // Profile Form States
  const [startupName, setStartupName] = useState(profile?.startupName || '');
  const [startupDescription, setStartupDescription] = useState(profile?.startupDescription || '');
  const [fundingGoal, setFundingGoal] = useState(profile?.fundingGoal || 500000);
  const [fundingStage, setFundingStage] = useState(profile?.fundingStage || 'Seed');
  const [skills, setSkills] = useState(profile?.skills?.join(', ') || '');
  const [industry, setIndustry] = useState(profile?.industry || 'Artificial Intelligence');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // AI Matchmaker States
  const [pitchInput, setPitchInput] = useState(profile?.startupDescription || '');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Update states on profile prop change
  useEffect(() => {
    if (profile) {
      setStartupName(profile.startupName || '');
      setStartupDescription(profile.startupDescription || '');
      setFundingGoal(profile.fundingGoal || 500000);
      setFundingStage(profile.fundingStage || 'Seed');
      setSkills(profile.skills?.join(', ') || '');
      setIndustry(profile.industry || 'Artificial Intelligence');
      if (!pitchInput) setPitchInput(profile.startupDescription || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');

    const updatedData = {
      startupName,
      startupDescription,
      fundingGoal: Number(fundingGoal),
      fundingStage,
      industry,
      skills: skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
    };

    try {
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update startup profile');

      onRefreshProfile(data);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus('idle');
    }
  };

  const handleAIMatchmaking = async () => {
    if (!pitchInput.trim()) {
      setAiError('Please describe your pitch or business description first');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch('/api/ai/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pitch: pitchInput,
          goals: `Seeking $${fundingGoal} at ${fundingStage} Stage`
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch AI feedback');

      setAiResult(data);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const fundingRaised = profile?.fundingRaised || 0;
  const fundingGoalVal = profile?.fundingGoal || 1;
  const fundingPercent = Math.min(100, Math.round((fundingRaised / fundingGoalVal) * 100));

  return (
    <div id="entrepreneur-dashboard" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Visual Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 relative">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Venture Intelligence Dashboard</h1>
            <p className="text-slate-300 text-sm">
              Refine your business pitch deck, utilize AI-guided matchmaking, and track active investor backing.
            </p>
          </div>
          <div className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-xs font-mono text-indigo-300 flex items-center gap-1.5">
            <Cpu className="w-4 h-4" /> LEDGER SYNCED
          </div>
        </div>
      </div>

      {/* Overview Cards & Funding Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Funding Tracker */}
        <div className="md:col-span-2 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Investment Ledger Progress</span>
              <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white">
                ${fundingRaised.toLocaleString()} Raised
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-[10px] font-mono font-semibold text-indigo-500">
              Goal: ${fundingGoalVal.toLocaleString()}
            </span>
          </div>

          <div className="space-y-2 mt-4">
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${fundingPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>{fundingPercent}% Complete</span>
              <span>${(fundingGoalVal - fundingRaised).toLocaleString()} Remaining</span>
            </div>
          </div>
        </div>

        {/* Quick Profile Status */}
        <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 flex items-center gap-4">
          <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Startup Stage</p>
            <p className="text-lg font-display font-semibold mt-0.5 text-slate-800 dark:text-white">
              {fundingStage} Round
            </p>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{industry}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Grid: Startup Profile Editor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-3 mb-4">
              <Compass className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Startup Profile Card</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Venture Name</label>
                  <input
                    type="text"
                    required
                    id="setup-startup-name-input"
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Industry Sector</label>
                  <select
                    value={industry}
                    id="setup-industry-select"
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none transition-all"
                  >
                    <option>Artificial Intelligence</option>
                    <option>SaaS</option>
                    <option>Fintech</option>
                    <option>Healthcare & Life Sciences</option>
                    <option>ClimateTech</option>
                    <option>Cybersecurity</option>
                    <option>Deeptech</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Target Raise (USD)</label>
                  <input
                    type="number"
                    required
                    id="setup-funding-goal-input"
                    value={fundingGoal}
                    onChange={(e) => setFundingGoal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Funding Round</label>
                  <select
                    value={fundingStage}
                    id="setup-funding-stage-select"
                    onChange={(e) => setFundingStage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none transition-all"
                  >
                    <option>Pre-Seed</option>
                    <option>Seed</option>
                    <option>Series A</option>
                    <option>Series B</option>
                    <option>Growth</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Venture Pitch Summary</label>
                <textarea
                  required
                  id="setup-startup-description-textarea"
                  value={startupDescription}
                  onChange={(e) => {
                    setStartupDescription(e.target.value);
                    setPitchInput(e.target.value);
                  }}
                  rows={4}
                  placeholder="Describe your startup core value proposition, tech-stack, and market segment..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Venture Keywords / Tech Stack (Comma separated)</label>
                <input
                  type="text"
                  id="setup-skills-input"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. LLMs, PyTorch, Local AI, Hospital Integrations"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                id="setup-profile-submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {saveStatus === 'saving' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : saveStatus === 'saved' ? (
                  <>
                    <Check className="w-4 h-4" /> Profile Updated
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Update Venture Details
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Grid: Gemini AI Pitch Helper */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">AI Pitch Reviewer & Matchmaker</h2>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">
                Gemini 3.5 Flash
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed leading-normal">
              Utilize Google Gemini AI to analyze your current pitch narrative, score investor readiness, and highlight recommended venture capital matches based on industry focus.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Evaluating Pitch Narrative</label>
              <textarea
                value={pitchInput}
                id="ai-pitch-input-textarea"
                onChange={(e) => setPitchInput(e.target.value)}
                placeholder="Write or review your pitch deck details here..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <button
              onClick={handleAIMatchmaking}
              disabled={aiLoading}
              id="ai-pitch-analyze-button"
              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/10"
            >
              {aiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Pitch Deck...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run AI Matchmaker Analysis
                </>
              )}
            </button>

            {aiError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* AI Result Card */}
            {aiResult && (
              <div className="p-4 rounded-xl border border-indigo-500/25 bg-indigo-500/5 dark:bg-indigo-500/10 space-y-4 animate-in slide-in-from-bottom-2 duration-200">
                
                {/* Visual score display */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Investor Readiness Score
                  </span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-bold font-display text-indigo-600 dark:text-indigo-400">{aiResult.score}</span>
                    <span className="text-[10px] text-slate-400 font-mono">/100</span>
                  </div>
                </div>

                {/* Score slider indicator */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      aiResult.score >= 80 ? 'bg-emerald-500' : aiResult.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${aiResult.score}%` }}
                  ></div>
                </div>

                {/* AI Analysis */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Strategic Review</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {aiResult.analysis}
                  </p>
                </div>

                {/* Recommendations */}
                {aiResult.recommendations && aiResult.recommendations.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-900">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Actionable Slides Adjustments</span>
                    <ul className="space-y-1">
                      {aiResult.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 leading-normal">
                          <span className="text-indigo-500 font-bold shrink-0">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Investors matches */}
                {aiResult.suggestedInvestors && aiResult.suggestedInvestors.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Suggested Capital Matches</span>
                    <div className="space-y-1.5">
                      {aiResult.suggestedInvestors.map((inv: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/40">
                          <p className="text-xs font-semibold text-slate-800 dark:text-white">{inv.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">{inv.matchReason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
