/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, Sparkles, AlertCircle, TrendingUp, Cpu, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (token: string, user: any, profile: any, wallet: any) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.ENTREPRENEUR);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [industry, setIndustry] = useState('Artificial Intelligence');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password }
      : { email, password, role, name, industry };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onAuthSuccess(data.token, data.user, data.profile, data.wallet);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole: 'investor' | 'entrepreneur' | 'admin') => {
    setError(null);
    setLoading(true);
    let demoEmail = '';
    
    if (demoRole === 'investor') demoEmail = 'investor@nexus.com';
    else if (demoRole === 'entrepreneur') demoEmail = 'entrepreneur@nexus.com';
    else demoEmail = 'admin@nexus.com';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'nexus123' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Demo login failed');
      }

      onAuthSuccess(data.token, data.user, data.profile, data.wallet);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-page" className="min-h-screen bg-mesh-light dark:bg-mesh-dark flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-5xl grid md:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl glass-premium border border-white/40 dark:border-slate-800/80">
        
        {/* Left column: Branding & Pitch */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle graphic glows */}
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3 z-10">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 backdrop-blur-md">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="font-display font-semibold text-xl tracking-tight">NEXUS</span>
          </div>

          <div className="my-12 space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen Collaboration
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold leading-tight text-white/95">
              Where Capital Meets Innovation.
            </h1>
            <p className="text-slate-300/90 text-sm leading-relaxed">
              Nexus bridges the gap between ambitious founders and strategic capital partners. 
              Schedule encrypted WebRTC meetings, exchange electronic signatures, 
              manage startup capital accounts, and align investments with AI-guided tools.
            </p>
          </div>

          <div className="z-10 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-400 font-mono">
              SECURE PLATFORM // EST. 2026
            </p>
          </div>
        </div>

        {/* Right column: Auth form */}
        <div className="md:col-span-7 p-8 md:p-12 bg-white/45 dark:bg-slate-950/45 backdrop-blur-md flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-semibold tracking-tight text-slate-900 dark:text-white">
                {isLogin ? 'Welcome Back' : 'Create Your Space'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isLogin ? 'Access your dashboard or utilize a demonstration account.' : 'Join Nexus and collaborate with global visionaries.'}
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="select-role-entrepreneur"
                      onClick={() => setRole(UserRole.ENTREPRENEUR)}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex flex-col gap-1 items-start ${
                        role === UserRole.ENTREPRENEUR 
                          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/10' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Cpu className="w-4 h-4 mb-1" />
                      <span>Entrepreneur</span>
                      <span className="text-[10px] text-slate-400 font-normal">Building startups</span>
                    </button>
                    <button
                      type="button"
                      id="select-role-investor"
                      onClick={() => setRole(UserRole.INVESTOR)}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex flex-col gap-1 items-start ${
                        role === UserRole.INVESTOR 
                          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/10' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 mb-1" />
                      <span>Investor</span>
                      <span className="text-[10px] text-slate-400 font-normal">Deploying capital</span>
                    </button>
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    id="auth-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marcus Aurelius"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  id="auth-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 font-sans">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="auth-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Primary Industry Focus</label>
                  <select
                    value={industry}
                    id="auth-industry-select"
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
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
              )}

              <button
                type="submit"
                disabled={loading}
                id="auth-submit-button"
                className="w-full py-2.5 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs pt-2">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                id="toggle-auth-mode"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
              <button 
                type="button"
                onClick={() => alert('Demo sandbox: You can sign in instantly using the demo accounts below.')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            {/* Quick Demo Access Panel */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block text-center">
                Sandbox Demo Entry
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="demo-investor"
                  onClick={() => handleQuickDemo('investor')}
                  className="py-2 px-1 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-indigo-950/20 text-[11px] text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium border border-slate-200/50 dark:border-slate-800/50 transition-all text-center"
                >
                  Investor VC
                </button>
                <button
                  type="button"
                  id="demo-entrepreneur"
                  onClick={() => handleQuickDemo('entrepreneur')}
                  className="py-2 px-1 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-indigo-950/20 text-[11px] text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium border border-slate-200/50 dark:border-slate-800/50 transition-all text-center"
                >
                  Entrepreneur
                </button>
                <button
                  type="button"
                  id="demo-admin"
                  onClick={() => handleQuickDemo('admin')}
                  className="py-2 px-1 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-indigo-950/20 text-[11px] text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium border border-slate-200/50 dark:border-slate-800/50 transition-all text-center"
                >
                  Platform Admin
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
