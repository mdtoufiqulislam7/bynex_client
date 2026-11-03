'use client'

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { Wallet, TrendingUp, DollarSign, ArrowUpRight, ArrowDownLeft, Loader2, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useGetWalletQuery } from '@/store/api/walletApi';
import { useGetMyTransactionsQuery, useGetTodaysProfitQuery } from '@/store/api/transactionApi';
import BinanceLivePrices from '@/components/BinanceLivePrices';

// Demo data override — applied only for this specific account
const DEMO_USER_EMAIL = 'sakhawatsahir1996@gmail.com';
const DEMO_STATS = {
  balance: 13.85,
  totalDeposit: 7500,
  totalWithdraw: 68327,
  todaysProfit: 352.92,
  totalProfit: 68340.85,
};

interface TransactionsData {
  results?: any[]
  totalPages?: number
  totalResults?: number
}

// Simple Sparkline Component
const Sparkline = ({ data, color = "white" }: { data: number[], color?: string }) => {
  const width = 100;
  const height = 40;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 -4 ${width} ${height + 8}`} className="overflow-visible">
       <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        className="opacity-90"
      />
    </svg>
  );
};

// Truncates amounts that would overflow a card; shows full value in a popup on click
const AMOUNT_CHAR_LIMIT = 12; // "$200,598.00" = 11 chars fits; longer gets truncated

const StatAmount = ({ value, className = '' }: { value: number; className?: string }) => {
  const [showModal, setShowModal] = useState(false);
  const formatted = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const full = `$${formatted}`;
  const isTruncated = full.length > AMOUNT_CHAR_LIMIT;
  const display = isTruncated ? `${full.slice(0, AMOUNT_CHAR_LIMIT - 3)}...` : full;

  return (
    <>
      <span
        className={`${className} ${isTruncated ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        onClick={isTruncated ? () => setShowModal(true) : undefined}
        title={isTruncated ? `Click to see full amount: ${full}` : undefined}
      >
        {display}
      </span>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center min-w-[240px] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-3">Full Amount</p>
            <p className="text-white text-3xl font-bold break-all">{full}</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-5 text-xs text-slate-400 hover:text-white transition-colors px-5 py-2 rounded-lg hover:bg-slate-700 border border-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const DashboardHome = () => {
  // Check if this is the demo user
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isDemoUser = currentUser?.email === DEMO_USER_EMAIL;

  // Fetch data from APIs
  const { data: walletData, isLoading: walletLoading, error: walletError } = useGetWalletQuery();
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useGetMyTransactionsQuery({
    page: 1,
    limit: 5,
  });
  // Fetch today's profit from server (sums all profit transactions for today)
  const { data: todaysProfitData } = useGetTodaysProfitQuery();

  const wallet = walletData?.data?.attributes;
  const transactionsResponse = (transactionsData?.data?.attributes || {}) as TransactionsData;
  const transactions = transactionsResponse.results || [];
  const todaysProfitFromApi = todaysProfitData?.data?.attributes?.todaysProfit ?? 0;

  // Apply demo overrides for specific account, otherwise use real API data
  const displayBalance = isDemoUser ? DEMO_STATS.balance : (wallet?.balance ?? 0);
  const displayTotalDeposit = isDemoUser ? DEMO_STATS.totalDeposit : (wallet?.totalDeposit ?? 0);
  const displayTotalWithdraw = isDemoUser ? DEMO_STATS.totalWithdraw : (wallet?.totalWithdraw ?? 0);
  const displayTotalProfit = isDemoUser ? DEMO_STATS.totalProfit : (wallet?.totalProfit ?? 0);
  const todaysProfit = isDemoUser ? DEMO_STATS.todaysProfit : todaysProfitFromApi;

  // 7-day balance trend for sparkline
  const balanceTrend = (isDemoUser || wallet) ? [
    displayBalance * 0.95,
    displayBalance * 0.96,
    displayBalance * 0.97,
    displayBalance * 0.98,
    displayBalance * 0.99,
    displayBalance * 0.995,
    displayBalance
  ] : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit':
        return 'text-emerald-400';
      case 'withdraw':
        return 'text-rose-400';
      case 'profit':
        return 'text-cyan-400';
      case 'investment':
        return 'text-blue-400';
      case 'referral':
        return 'text-purple-400';
      case 'bonus':
        return 'text-amber-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'rejected':
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  if (walletLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-cyan-400 mx-auto mb-4" size={48} />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (walletError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
          <p className="text-rose-400 font-medium mb-2">Failed to load dashboard data</p>
          <p className="text-slate-500 text-sm">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
        {/* Available Balance - full width on mobile */}
        <Link href="/dashboard/wallet/stats" className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden group hover:shadow-2xl hover:scale-[1.02] transition-all">
          <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10">
            <Wallet size={48} />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-200 font-medium mb-1 text-xs sm:text-sm">Available Balance</p>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
              <StatAmount value={displayBalance} />
            </h3>
            <div className="flex justify-between items-end">
              <div className="flex items-center text-[10px] sm:text-xs bg-indigo-500/30 px-2 py-1 rounded-md backdrop-blur-sm">
                <Wallet size={10} className="mr-1" />
                Current
              </div>
              {balanceTrend.length > 0 && (
                <div className="w-16 h-5 sm:w-20 sm:h-6">
                  <Sparkline data={balanceTrend} />
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Total Deposit */}
        <Link href="/dashboard/deposit" className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-2xl hover:scale-[1.02] transition-all">
          <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10">
            <ArrowDownLeft size={40} className="text-emerald-500 sm:hidden" />
            <ArrowDownLeft size={64} className="text-emerald-500 hidden sm:block" />
          </div>
          <p className="text-slate-400 font-medium mb-1 text-[11px] sm:text-sm">Total Deposit</p>
          <h3 className="text-base sm:text-2xl font-bold mb-2 sm:mb-3 text-emerald-400">
            <StatAmount value={displayTotalDeposit} />
          </h3>
          <div className="h-1 w-full bg-slate-700 rounded-full mt-1 sm:mt-2">
            <div className="h-1 bg-emerald-500 rounded-full" style={{ width: `${Math.min((displayTotalDeposit / (displayTotalDeposit + displayTotalWithdraw + 1)) * 100, 100)}%` }}></div>
          </div>
        </Link>

        {/* Total Withdraw */}
        <Link href="/dashboard/withdraw" className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-2xl hover:scale-[1.02] transition-all">
          <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10">
             <ArrowUpRight size={40} className="text-rose-500 sm:hidden" />
             <ArrowUpRight size={64} className="text-rose-500 hidden sm:block" />
          </div>
          <p className="text-slate-400 font-medium mb-1 text-[11px] sm:text-sm">Total Withdraw</p>
          <h3 className="text-base sm:text-2xl font-bold mb-2 sm:mb-3 text-rose-400">
            <StatAmount value={displayTotalWithdraw} />
          </h3>
          <div className="h-1 w-full bg-slate-700 rounded-full mt-1 sm:mt-2">
            <div className="h-1 bg-rose-500 rounded-full" style={{ width: `${Math.min((displayTotalWithdraw / (displayTotalDeposit + displayTotalWithdraw + 1)) * 100, 100)}%` }}></div>
          </div>
        </Link>

        {/* Total Profit */}
        <Link href="/dashboard/profits/history" className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-slate-950 shadow-xl shadow-cyan-500/20 relative overflow-hidden group hover:shadow-2xl hover:scale-[1.02] transition-all">
          <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10">
             <DollarSign size={40} className="sm:hidden" />
             <DollarSign size={64} className="hidden sm:block" />
          </div>
          <p className="text-slate-900/70 font-bold mb-1 text-[11px] sm:text-sm">Total Profit</p>
          <h3 className="text-base sm:text-2xl font-extrabold mb-2 sm:mb-3">
            <StatAmount value={displayTotalProfit} />
          </h3>
          <div className="flex items-center text-[10px] sm:text-xs bg-black/10 w-fit px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-bold">
            All time earnings
          </div>
        </Link>

        {/* Today's Profit */}
        <Link href="/dashboard/profits/history" className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group hover:shadow-2xl hover:scale-[1.02] transition-all">
          <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10">
             <Calendar size={40} className="sm:hidden" />
             <Calendar size={64} className="hidden sm:block" />
          </div>
          <p className="text-emerald-100 font-bold mb-1 text-[11px] sm:text-sm">Today's Profit</p>
          <h3 className="text-base sm:text-2xl font-extrabold mb-2 sm:mb-3">
            <StatAmount value={todaysProfit} />
          </h3>
          <div className="flex items-center text-[10px] sm:text-xs bg-white/10 w-fit px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-bold">
            <TrendingUp size={10} className="mr-1" />
            Today
          </div>
        </Link>
      </div>

      {/* Row 2: Action Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <Link href="/dashboard/deposit" className="flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg shadow-green-500/10 transition-all transform hover:-translate-y-1">
          <div className="bg-white/20 p-2 sm:p-3 rounded-full">
            <ArrowDownLeft size={18} className="sm:hidden" />
            <ArrowDownLeft size={28} className="hidden sm:block" />
          </div>
          <div className="text-left">
            <span className="block text-sm sm:text-2xl font-bold">Deposit</span>
            <span className="text-green-100 text-[10px] sm:text-sm hidden sm:block">Add funds securely</span>
          </div>
        </Link>

        <Link href="/dashboard/withdraw" className="flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg shadow-red-500/10 transition-all transform hover:-translate-y-1">
          <div className="bg-white/20 p-2 sm:p-3 rounded-full">
            <ArrowUpRight size={18} className="sm:hidden" />
            <ArrowUpRight size={28} className="hidden sm:block" />
          </div>
          <div className="text-left">
            <span className="block text-sm sm:text-2xl font-bold">Withdraw</span>
            <span className="text-red-100 text-[10px] sm:text-sm hidden sm:block">Request payouts instantly</span>
          </div>
        </Link>
      </div>

      {/* Row 3: Recent Transactions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
        {/* <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm sm:text-lg font-bold text-white">Recent Transactions</h3>
          <Link href="/dashboard/transactions" className="text-cyan-400 text-xs sm:text-sm hover:underline font-medium">View All</Link>
        </div> */}

        {/* Desktop Table View */}
        {/* <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <DollarSign className="mx-auto mb-2 text-slate-600" size={40} />
                    <p>No transactions yet</p>
                    <p className="text-xs mt-1">Your transaction history will appear here</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500">{tx.transactionId}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center font-medium capitalize ${getTypeColor(tx.type)}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatDate(tx.createdAt)}</td>
                    <td className={`px-6 py-4 font-bold ${
                       tx.type === 'withdraw' ? 'text-rose-400' : 'text-white'
                    }`}>
                      {tx.type === 'withdraw' ? '-' : '+'}${tx.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div> */}

        {/* Mobile Card View */}
        {/* <div className="sm:hidden divide-y divide-slate-800">
          {transactions.length === 0 ? (
            <div className="px-4 py-10 text-center text-slate-500">
              <DollarSign className="mx-auto mb-2 text-slate-600" size={32} />
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Your transaction history will appear here</p>
            </div>
          ) : (
            transactions.map((tx: any) => (
              <div key={tx.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' :
                    tx.type === 'withdraw' ? 'bg-rose-500/10 text-rose-400' :
                    tx.type === 'profit' ? 'bg-cyan-500/10 text-cyan-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {tx.type === 'deposit' ? <ArrowDownLeft size={14} /> :
                     tx.type === 'withdraw' ? <ArrowUpRight size={14} /> :
                     <DollarSign size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white capitalize">{tx.type}</p>
                    <p className="text-[10px] text-slate-500">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`text-sm font-bold ${tx.type === 'withdraw' ? 'text-rose-400' : 'text-white'}`}>
                    {tx.type === 'withdraw' ? '-' : '+'}${tx.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div> */}
      </div>

      {/* Live Binance prices (after recent transactions) */}
      <BinanceLivePrices />
    </div>
  );
};

export default DashboardHome;
