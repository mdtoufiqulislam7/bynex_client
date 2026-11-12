'use client'

import React, { useState } from 'react';
import { Users, DollarSign, Copy, Share2, CheckCheck, TrendingUp, Loader2, AlertCircle, Award } from 'lucide-react';
import { useGetReferralStatsQuery, useGetCommissionRatesQuery } from '@/store/api/referralApi';

const REFERRAL_BASE_DOMAIN = process.env.NEXT_PUBLIC_REFERRAL_BASE_DOMAIN || 'http://localhost:3000';

const Referrals = () => {
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useGetReferralStatsQuery();
  const { data: ratesData } = useGetCommissionRatesQuery();
  const stats = data?.data?.attributes as any;
  const commissionRates = ratesData?.data?.attributes || [];

  const baseDomain = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_REFERRAL_BASE_DOMAIN || 'http://localhost:7498');
  const referralCode = stats?.referralCode || '';
  const referralLink = referralCode ? `${baseDomain}/register?ref=${referralCode}` : '';

  const totalEarnings = stats?.totalEarnings ?? 0;
  const totalReferrals = stats?.totalReferrals ?? 0;
  const activeReferrals = stats?.activeReferrals ?? 0;
  const referrals = stats?.referrals ?? [];

  // Get commission rates from API, fallback to server defaults
  const defaultRates = [10, 5, 4, 3, 2, 1, 1];
  const rates = commissionRates.length > 0
    ? commissionRates.map((r: any) => ({ level: r.level, rate: r.commissionRate }))
    : defaultRates.map((rate, i) => ({ level: i + 1, rate }));
  const totalCommissionRate = rates.reduce((sum: number, r: any) => sum + r.rate, 0);

  const handleCopy = () => {
    if (!referralLink) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(referralLink);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-amber-400" size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
        <p className="text-rose-400 font-medium">Failed to load referral data</p>
        <p className="text-neutral-500 text-sm mt-1">{(error as any)?.data?.message || 'Please try again later'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Referral Program</h2>
          <p className="text-neutral-400 text-xs sm:text-sm">Invite friends and earn a commission from their investment profits.</p>
        </div>
        {activeReferrals > 0 && (
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-lg text-amber-400">
            <TrendingUp size={18} />
            <span className="font-bold text-sm">{activeReferrals} Active Referrals</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <div className="col-span-2 md:col-span-1 bg-[#0D0D0D] border border-neutral-800 p-4 sm:p-6 rounded-xl sm:rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign size={64} className="text-amber-400" />
          </div>
          <p className="text-neutral-400 font-medium mb-1 text-xs sm:text-base">Total Earnings</p>
          <h3 className="text-xl sm:text-3xl font-bold text-white">${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1 sm:mt-2">
            From all 7 referral levels
          </p>
        </div>

        <div className="bg-[#0D0D0D] border border-neutral-800 p-4 sm:p-6 rounded-xl sm:rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users size={64} className="text-amber-500" />
          </div>
          <p className="text-neutral-400 font-medium mb-1 text-xs sm:text-base">Total Referrals</p>
          <h3 className="text-xl sm:text-3xl font-bold text-white">{totalReferrals}</h3>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1 sm:mt-2">
            {activeReferrals} Active
          </p>
        </div>

        <div className="bg-[#0D0D0D] border border-neutral-800 p-4 sm:p-6 rounded-xl sm:rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Share2 size={64} className="text-purple-500" />
          </div>
          <p className="text-neutral-400 font-medium mb-1 text-xs sm:text-base">Total Commission</p>
          <h3 className="text-xl sm:text-3xl font-bold text-white">{totalCommissionRate}%</h3>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1 sm:mt-2">
            Across 7 levels
          </p>
        </div>
      </div>

      {/* 7-Level Commission Structure */}
      <div className="bg-gradient-to-br from-[#0D0D0D] to-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-amber-400" size={22} />
            <h3 className="text-sm sm:text-base font-bold text-white">7-Level Commission Structure</h3>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
            {rates.map((r: any) => (
              <div key={r.level} className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-[10px] sm:text-xs text-neutral-400 mb-1">Level {r.level}</p>
                <p className="text-sm sm:text-lg font-bold text-amber-400">{r.rate}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-gradient-to-br from-[#0D0D0D] to-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-8 relative overflow-hidden">
         {/* Decoration */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

         <div className="relative z-10 text-center md:text-left md:flex items-center justify-between gap-8">
            <div className="mb-4 md:mb-0">
                <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2">Your Unique Referral Link</h3>
                <p className="text-neutral-400 text-xs sm:text-sm max-w-md">
                    Share this link with your network. Earn commissions from their profits.
                </p>
            </div>
            <div className="flex-1 max-w-lg w-full">
                <div className="relative flex items-center shadow-lg">
                <input
                    type="text"
                    readOnly
                    value={referralLink || 'No referral code available'}
                    className="w-full bg-[#050505] border border-neutral-700 rounded-lg py-2.5 sm:py-3.5 pl-3 sm:pl-4 pr-24 sm:pr-32 text-neutral-300 focus:outline-none focus:border-amber-500 transition-colors font-mono text-xs sm:text-sm"
                />
                <button
                    onClick={handleCopy}
                    disabled={!referralLink}
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-black font-bold px-3 sm:px-4 rounded-md transition-colors flex items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                    {copied ? <CheckCheck size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
                </div>
            </div>
         </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-[#0D0D0D] border border-neutral-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
        <div className="p-3 sm:p-6 border-b border-neutral-800 flex justify-between items-center">
          <h3 className="text-sm sm:text-lg font-bold text-white">Referred Users</h3>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#050505] text-neutral-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Tier</th>
                <th className="px-6 py-4 font-medium">Date Joined</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-sm text-neutral-300">
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No referrals yet. Share your link to start earning!
                  </td>
                </tr>
              ) : (
                referrals.map((ref: any, idx: number) => (
                  <tr key={ref.id || idx} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center mr-3 text-xs font-bold text-neutral-400 shadow-sm">
                        {(ref.user || '?').charAt(0).toUpperCase()}
                      </div>
                      {ref.user || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-neutral-400 text-xs uppercase font-bold tracking-wide">Level {ref.level || 1}</td>
                    <td className="px-6 py-4 text-neutral-400">{ref.date ? formatDate(ref.date) : '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit ${
                        ref.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-neutral-800/50 text-neutral-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${ref.status === 'active' ? 'bg-green-500' : 'bg-neutral-500'}`}></span>
                        {ref.status ? ref.status.charAt(0).toUpperCase() + ref.status.slice(1) : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-amber-400">
                      ${(ref.earnings ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden divide-y divide-neutral-800">
          {referrals.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-sm">
              No referrals yet. Share your link to start earning!
            </div>
          ) : (
            referrals.map((ref: any, idx: number) => (
              <div key={ref.id || idx} className="p-3 hover:bg-neutral-900/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-neutral-400">
                      {(ref.user || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{ref.user || 'Unknown'}</p>
                      <p className="text-[10px] text-neutral-500">Level {ref.level || 1} &middot; {ref.date ? formatDate(ref.date) : '-'}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-bold text-amber-400">${(ref.earnings ?? 0).toFixed(2)}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ref.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-neutral-800/50 text-neutral-500'
                    }`}>
                      <span className={`w-1 h-1 rounded-full mr-1 ${ref.status === 'active' ? 'bg-green-500' : 'bg-neutral-500'}`}></span>
                      {ref.status ? ref.status.charAt(0).toUpperCase() + ref.status.slice(1) : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {referrals.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-neutral-800 flex justify-between items-center text-xs sm:text-sm text-neutral-500">
            <span>Showing {referrals.length} of {totalReferrals} users</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;
