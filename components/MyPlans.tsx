'use client'

import React, { useState } from 'react';
import { TrendingUp, AlertCircle, PlayCircle, Loader2, Clock, Trash2, AlertTriangle, X } from 'lucide-react';
import { useGetActiveInvestmentsQuery, useDestroyInvestmentMutation } from '@/store/api/investmentApi';
import type { Investment } from '@/store/api/investmentApi';
import Link from 'next/link';
import { Toast, ToastType } from '@/components/Toast';

const MyPlans = () => {
  const { data: investmentsResponse, isLoading, error } = useGetActiveInvestmentsQuery();
  const activePlans = investmentsResponse?.data?.attributes || [];
  const [destroyInvestment, { isLoading: isDestroying }] = useDestroyInvestmentMutation();
  const [destroyModal, setDestroyModal] = useState<Investment | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDaysElapsed = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    if (now >= end) return 100;
    if (now <= start) return 0;

    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-cyan-400 mx-auto mb-4" size={48} />
          <p className="text-slate-400">Loading your investments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
          <p className="text-rose-400 font-medium">Failed to load investments</p>
          <p className="text-slate-500 text-sm mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  const handleDestroyInvestment = async () => {
    if (!destroyModal) return;
    try {
      await destroyInvestment(destroyModal.id).unwrap();
      setToast({ message: 'Investment destroyed successfully. 70% refunded to your wallet.', type: 'success' });
      setDestroyModal(null);
    } catch (err: any) {
      setToast({ message: err?.data?.message || 'Failed to destroy investment', type: 'error' });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">My Active Plans</h2>
        <p className="text-slate-400 text-xs sm:text-sm">Monitor the progress of your active investments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {activePlans.length > 0 ? (
          activePlans.map((investment) => {
             const daysElapsed = calculateDaysElapsed(investment.startDate);
             const duration = calculateDuration(investment.startDate, investment.endDate);
             const progress = calculateProgress(investment.startDate, investment.endDate);
             const currentProfit = investment.earnedProfit;

             return (
              <div key={investment.id} className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <div className="flex justify-between items-start mb-4 sm:mb-6 relative z-10">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 sm:p-2.5 rounded-lg text-slate-950">
                      <TrendingUp size={20} className="sm:hidden" />
                      <TrendingUp size={24} className="hidden sm:block" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-xl font-bold text-white">{investment.plan.name}</h3>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-mono">{investment.transactionId}</p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold border ${
                    investment.status === 'active' && !investment.isPaused
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : investment.isPaused
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  }`}>
                    {investment.status === 'active' && !investment.isPaused ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span>Running</span>
                      </>
                    ) : investment.isPaused ? (
                      <>
                        <Clock size={12} />
                        <span>Paused</span>
                      </>
                    ) : (
                      <span>{investment.status}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-slate-950/50 p-2.5 sm:p-3 rounded-lg border border-slate-800">
                    <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">Invested Amount</p>
                    <p className="text-sm sm:text-lg font-bold text-white">${investment.amount.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-950/50 p-2.5 sm:p-3 rounded-lg border border-slate-800">
                    <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">Expected Return</p>
                    <p className="text-sm sm:text-lg font-bold text-cyan-400">${(investment.amount + investment.expectedProfit).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-950/50 p-2.5 sm:p-3 rounded-lg border border-slate-800">
                    <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">Current Profit</p>
                    <p className="text-sm sm:text-lg font-bold text-green-400">+${currentProfit.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-950/50 p-2.5 sm:p-3 rounded-lg border border-slate-800">
                    <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">Daily Profit</p>
                    <p className="text-sm sm:text-lg font-bold text-blue-400">${investment.dailyProfitAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">ROI: {investment.plan.roi}% {investment.plan.roiType}</span>
                    <span className="text-slate-400">Duration: {investment.plan.duration} {investment.plan.durationType}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 flex items-center">
                      <PlayCircle size={12} className="mr-1" />
                      Started: {formatDate(investment.startDate)}
                    </span>
                    <span className="text-cyan-400 font-medium">Ends: {formatDate(investment.endDate)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-cyan-400 font-medium">{investment.totalProfitDistributions} distributions</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right mt-1">
                     <span className="text-xs text-slate-500">{progress.toFixed(0)}% Completed</span>
                  </div>
                </div>

                {investment.lastProfitDate && (
                  <div className="mt-4 text-xs text-slate-500">
                    Last profit: {formatDate(investment.lastProfitDate)}
                  </div>
                )}

                {/* Destroy Plan Button */}
                {investment.status === 'active' && (
                  <button
                    onClick={() => setDestroyModal(investment)}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                  >
                    <Trash2 size={16} />
                    Destroy Plan
                  </button>
                )}
              </div>
             );
          })
        ) : (
          <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
             <div className="bg-slate-800 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                <AlertCircle size={28} className="sm:hidden" />
                <AlertCircle size={32} className="hidden sm:block" />
             </div>
             <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Active Plans</h3>
             <p className="text-slate-400 text-sm mb-6">You don't have any active investments at the moment.</p>
             <Link href="/dashboard/plans/invest" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:from-cyan-400 hover:to-blue-500 transition-colors">
               Start Investing
             </Link>
          </div>
        )}
      </div>
      {/* Destroy Confirmation Modal */}
      {destroyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setDestroyModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-rose-500/10 p-2.5 rounded-lg">
                <AlertTriangle className="text-rose-500" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Destroy Investment</h3>
            </div>

            <p className="text-slate-400 text-sm mb-5">
              Are you sure you want to destroy this investment? This action cannot be undone.
            </p>

            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Plan</span>
                <span className="text-white font-medium">{destroyModal.plan.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Invested Amount</span>
                <span className="text-white font-medium">${destroyModal.amount.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between text-sm">
                <span className="text-rose-400">Penalty (30%)</span>
                <span className="text-rose-400 font-semibold">-${(destroyModal.amount * 0.3).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400">Refund Amount</span>
                <span className="text-emerald-400 font-semibold">${(destroyModal.amount * 0.7).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-5">
              Profits already earned will remain in your wallet.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDestroyModal(null)}
                disabled={isDestroying}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDestroyInvestment}
                disabled={isDestroying}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDestroying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Destroying...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Confirm Destroy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPlans;
