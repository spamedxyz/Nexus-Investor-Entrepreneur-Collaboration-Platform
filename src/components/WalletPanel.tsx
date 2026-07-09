/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, Shield, Check, Clock, TrendingUp, HelpCircle, AlertCircle } from 'lucide-react';

interface WalletPanelProps {
  user: any;
  profile: any;
  wallet: any;
  onRefreshWallet: () => void;
}

export default function WalletPanel({ user, profile, wallet, onRefreshWallet }: WalletPanelProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [depositError, setDepositError] = useState<string | null>(null);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [wallet]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch('/api/wallet/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTransactions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError(null);
    setDepositSuccess(false);
    setDepositLoading(true);

    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      setDepositError('Please enter a valid positive deposit amount');
      setDepositLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to complete deposit');

      setDepositSuccess(true);
      setDepositAmount('');
      onRefreshWallet();
      setTimeout(() => setDepositSuccess(false), 3000);
    } catch (err: any) {
      setDepositError(err.message);
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <div id="wallet-panel" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Visual Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 relative">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Ledger Wallet & Capital Management</h1>
            <p className="text-slate-300 text-sm">
              Deploy capital directly, review certified sandbox transactions, and track multi-party ledger balances.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Grid: Balance & Stripe Sandbox Deposit Portal */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Card: Current Balance */}
          <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm flex flex-col justify-between h-44">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Ledger Account Liquidity</span>
              <h2 className="text-3xl font-display font-bold mt-1.5 text-slate-900 dark:text-white">
                ${(wallet?.balance || 0).toLocaleString()}
              </h2>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> SECURED BY NEXUS LEDGER
              </span>
              <span>USD ACCOUNT</span>
            </div>
          </div>

          {/* Card: Stripe simulated card portal */}
          <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
              <CreditCard className="w-4.5 h-4.5 text-indigo-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Simulated Stripe Deposit Portal</h3>
            </div>

            <form onSubmit={handleDepositFunds} className="space-y-4 text-xs">
              
              {depositError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{depositError}</span>
                </div>
              )}

              {depositSuccess && (
                <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Deposit completed! Ledger balance synced immediately.</span>
                </div>
              )}

              {/* Visual Card Form */}
              <div className="p-4 rounded-xl bg-slate-950 text-white space-y-3 shadow-md relative overflow-hidden">
                <div className="absolute top-[-30%] right-[-10%] w-32 h-32 rounded-full bg-indigo-500/20 blur-xl pointer-events-none"></div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">Sandbox Card Terminal</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-[8px] font-mono text-slate-300">Stripe Sync</span>
                </div>

                <div className="space-y-2 pt-2">
                  <div>
                    <label className="text-[9px] text-slate-400 uppercase font-mono">Card Number</label>
                    <input
                      type="text"
                      disabled
                      value={cardNumber}
                      className="w-full bg-transparent border-b border-white/20 pb-1 text-xs font-mono tracking-widest text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-mono">Expiry Date</label>
                      <input
                        type="text"
                        disabled
                        value={cardExpiry}
                        className="w-full bg-transparent border-b border-white/20 pb-1 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-mono">CVV</label>
                      <input
                        type="text"
                        disabled
                        value={cardCvv}
                        className="w-full bg-transparent border-b border-white/20 pb-1 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500">Deposit Amount (USD)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    id="wallet-deposit-amount-input"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="e.g. 100000"
                    className="w-full pl-8 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                id="wallet-deposit-submit"
                disabled={depositLoading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {depositLoading ? 'Verifying Card...' : 'Confirm Sandbox Deposit'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Grid: Certified Transaction Ledgers */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Venture Transaction Ledgers</h3>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(n => <div key={n} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-900 animate-pulse"></div>)}
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No ledger transactions recorded in this wallet sandbox
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-200/40 dark:border-slate-800/60 rounded-xl">
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {transactions.map((tx) => {
                    const isDeposit = tx.type === 'deposit';
                    const isSender = tx.senderUserId === user.id;

                    return (
                      <div key={tx.id} className="p-3.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-900/30 flex items-center justify-between gap-4 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            isDeposit ? 'bg-emerald-500/10 text-emerald-500' :
                            isSender ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> :
                             isSender ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                          </div>

                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800 dark:text-white">
                              {isDeposit ? 'Stripe Sandbox Deposit' :
                               isSender ? `Capital Deployment to ${tx.receiverName}` : `Capital Injection from ${tx.senderName}`}
                            </p>
                            <p className="text-[10px] text-slate-400 max-w-xs truncate" title={tx.message}>
                              {tx.message || 'Certified digital ledger wire.'}
                            </p>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {new Date(tx.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className={`text-right font-mono font-semibold ${
                          isDeposit ? 'text-emerald-500' :
                          isSender ? 'text-rose-500' : 'text-emerald-500'
                        }`}>
                          {isDeposit ? '+' : isSender ? '-' : '+'}${tx.amount.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
