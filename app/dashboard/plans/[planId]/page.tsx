'use client'

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Star,
  Check,
  AlertCircle,
  Calculator,
  Calendar,
  Percent,
  Gift,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useGetPlanByIdQuery } from '@/store/api/investmentPlanApi';
import { useGetWalletQuery } from '@/store/api/walletApi';
import { useCreateInvestmentMutation } from '@/store/api/investmentApi';

// Profit calculation helpers (same logic as InvestPlans.tsx)
const getDurationInDays = (duration: number, durationType: string) => {
  switch (durationType) {
    case 'minutes': return duration / (24 * 60);
    case 'hours': return duration / 24;
    case 'days': return duration;
    case 'weeks': return duration * 7;
    case 'months': return duration * 30;
    default: return duration;
  }
};

const getDurationInMonths = (duration: number, durationType: string) => {
  switch (durationType) {
    case 'minutes': return duration / (30 * 24 * 60);
    case 'hours': return duration / (30 * 24);
    case 'days': return duration / 30;
    case 'weeks': return (duration * 7) / 30;
    case 'months': return duration;
    default: return duration / 30;
  }
};

const calculateReturns = (amount: number, roi: number, roiType: string, duration: number, durationType: string) => {
  let totalProfit = 0;
  const totalDays = getDurationInDays(duration, durationType);

  if (roiType === 'hourly') {
    totalProfit = amount * (roi / 100) * totalDays * 24;
  } else if (roiType === 'daily') {
    totalProfit = amount * (roi / 100) * totalDays;
  } else if (roiType === 'total') {
    totalProfit = amount * (roi / 100);
  } else if (roiType === 'monthly') {
    totalProfit = amount * (roi / 100) * getDurationInMonths(duration, durationType);
  } else if (roiType === 'weekly') {
    totalProfit = amount * (roi / 100) * (totalDays / 7);
  }

  const totalReturn = amount + totalProfit;
  const daily = totalProfit / (totalDays || 1);

  return { totalReturn, profit: totalProfit, daily };
};

export default function PlanDetailPage() {
  const params = useParams();
  const planId = params?.planId as string;

  const { data, isLoading, error } = useGetPlanByIdQuery(planId || '');
  const { data: walletResponse } = useGetWalletQuery();
  const [createInvestment, { isLoading: investing }] = useCreateInvestmentMutation();

  const [calcAmount, setCalcAmount] = useState('');
  const [investAmount, setInvestAmount] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investError, setInvestError] = useState('');
  const [investSuccess, setInvestSuccess] = useState(false);

  const plan = data?.data?.attributes;
  const wallet = walletResponse?.data?.attributes;
  const balance = wallet?.balance || 0;

  const handleInvest = async () => {
    if (!plan || !investAmount) return;
    setInvestError('');

    const amount = parseFloat(investAmount);
    if (amount < plan.minDeposit) {
      setInvestError(`Minimum investment is $${plan.minDeposit}`);
      return;
    }
    if (amount > plan.maxDeposit) {
      setInvestError(`Maximum investment is $${plan.maxDeposit.toLocaleString()}`);
      return;
    }
    if (amount > balance) {
      setInvestError('Insufficient balance');
      return;
    }

    try {
      await createInvestment({ planId: plan.id, amount }).unwrap();
      setInvestSuccess(true);
      setInvestAmount('');
      setTimeout(() => {
        setShowInvestModal(false);
        setInvestSuccess(false);
      }, 2000);
    } catch (err: any) {
      setInvestError(err?.data?.message || 'Failed to create investment');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin text-amber-400 mx-auto mb-4" size={48} />
          <p className="text-neutral-400">Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle size={48} className="text-rose-500" />
        <h3 className="text-lg font-semibold text-white">Plan Not Found</h3>
        <p className="text-neutral-400 text-sm">The investment plan you're looking for doesn't exist.</p>
        <Link href="/dashboard/plans/invest" className="text-amber-400 hover:text-amber-300 font-medium text-sm flex items-center gap-1">
          <ArrowLeft size={16} /> Back to Plans
        </Link>
      </div>
    );
  }

  const calcAmountNum = parseFloat(calcAmount) || plan.minDeposit;
  const calc = calculateReturns(calcAmountNum, plan.roi, plan.roiType, plan.duration, plan.durationType);
  const totalDays = getDurationInDays(plan.duration, plan.durationType);

  // Default fallback counts if a plan has not yet been updated in DB
  const defaultInvestorFallback: Record<string, number> = {
    'starter plan': 1000,
    'standard plan': 16798,
    'premium plan': 7897,
  };
  const planKey = plan.name?.toLowerCase() || '';
  const displayInvestors =
    plan.totalInvestors && plan.totalInvestors > 0
      ? plan.totalInvestors
      : (defaultInvestorFallback[planKey] ?? 1000);
  const displayInvested = plan.totalInvested || 0;

  const formatCompact = (num: number): string => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toLocaleString();
  };

  // For invest modal preview
  const investCalc = investAmount && parseFloat(investAmount) >= plan.minDeposit
    ? calculateReturns(parseFloat(investAmount), plan.roi, plan.roiType, plan.duration, plan.durationType)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/plans/invest" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm mb-4">
          <ArrowLeft size={18} /> Back to Plans
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white">{plan.name}</h2>
            {plan.isPopular && (
              <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full text-xs font-bold">
                <Star size={12} fill="currentColor" /> Popular
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* ROI Hero Card */}
          <div className="bg-gradient-to-br from-amber-600 to-amber-600 rounded-2xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <TrendingUp size={120} />
            </div>
            <div className="relative z-10 flex items-end justify-between">
              <div>
                {plan.approximateRoi ? (
                  <>
                    <p className="text-indigo-200 text-sm font-medium mb-1 uppercase tracking-wider">Approximate Return</p>
                    <p className="text-2xl sm:text-3xl font-bold">{plan.approximateRoi}</p>
                  </>
                ) : (
                  <>
                    <p className="text-indigo-200 text-sm font-medium mb-1 uppercase tracking-wider">{plan.roiType} Return</p>
                    <p className="text-3xl sm:text-5xl font-bold">{plan.roi}%</p>
                  </>
                )}
                <p className="text-indigo-200 mt-2">for {plan.duration} {plan.durationType}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-200 text-sm font-medium mb-1">Total Duration</p>
                <p className="text-2xl sm:text-3xl font-bold">{Math.round(totalDays)}</p>
                <p className="text-indigo-200">days</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {plan.description && (
            <div className="bg-[#0D0D0D] border border-neutral-800 rounded-xl p-4 sm:p-6">
              <h3 className="text-white font-semibold mb-3">About This Plan</h3>
              <p className="text-neutral-300 text-sm leading-relaxed">{plan.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="bg-[#0D0D0D] border border-neutral-800 rounded-xl p-4 sm:p-6">
            <h3 className="text-white font-semibold mb-4">Plan Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DetailCard icon={DollarSign} label="Min Deposit" value={`$${plan.minDeposit.toLocaleString()}`} color="emerald" />
              <DetailCard icon={DollarSign} label="Max Deposit" value={`$${plan.maxDeposit.toLocaleString()}`} color="blue" />
              <DetailCard icon={Clock} label="Duration" value={`${plan.duration} ${plan.durationType}`} color="purple" />
              <DetailCard icon={Gift} label="Referral Bonus" value={`${plan.referralBonus}%`} color="amber" />
              <DetailCard icon={Users} label="Total Investors" value={displayInvestors.toLocaleString()} color="cyan" />
              <DetailCard icon={TrendingUp} label="Total Invested" value={`$${formatCompact(displayInvested)}`} color="gold" />
            </div>
          </div>

          {/* Features */}
          {plan.features && plan.features.length > 0 && (
            <div className="bg-[#0D0D0D] border border-neutral-800 rounded-xl p-4 sm:p-6">
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 bg-neutral-900/50 px-4 py-3 rounded-lg">
                    <Check size={16} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-neutral-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profit Calculator */}
          <div className="bg-[#0D0D0D] border border-neutral-800 rounded-xl p-4 sm:p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Calculator size={18} className="text-amber-400" /> Profit Calculator
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Investment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">$</span>
                  <input
                    type="number"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                    placeholder={plan.minDeposit.toString()}
                    min={plan.minDeposit}
                    max={plan.maxDeposit}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">Range: ${plan.minDeposit.toLocaleString()} — ${plan.maxDeposit.toLocaleString()}</p>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-lg p-5">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Total Profit</p>
                    <p className="text-lg font-bold text-emerald-400">+${calc.profit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Daily Profit</p>
                    <p className="text-lg font-bold text-neutral-300">~${calc.daily.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Total Return</p>
                    <p className="text-lg font-bold text-amber-400">${calc.totalReturn.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invest Button */}
          <button
            onClick={() => { setShowInvestModal(true); setInvestError(''); setInvestSuccess(false); setInvestAmount(''); }}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold py-4 px-4 rounded-xl shadow-lg shadow-amber-500/20 transform hover:-translate-y-1 transition-all flex items-center justify-center text-lg"
          >
            Invest Now <ArrowRight size={20} className="ml-2" />
          </button>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* Quick Stats */}
          <div className="bg-[#0D0D0D] border border-neutral-800 rounded-xl p-4 sm:p-6">
            <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400 flex items-center gap-2"><Percent size={14} /> ROI</span>
                <span className="text-sm font-bold text-amber-400">{plan.approximateRoi || `${plan.roi}% ${plan.roiType}`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400 flex items-center gap-2"><Clock size={14} /> Duration</span>
                <span className="text-sm font-bold text-white">{plan.duration} {plan.durationType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400 flex items-center gap-2"><DollarSign size={14} /> Min Deposit</span>
                <span className="text-sm font-bold text-white">${plan.minDeposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400 flex items-center gap-2"><DollarSign size={14} /> Max Deposit</span>
                <span className="text-sm font-bold text-white">${plan.maxDeposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400 flex items-center gap-2"><Gift size={14} /> Referral Bonus</span>
                <span className="text-sm font-bold text-white">{plan.referralBonus}%</span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-[#0D0D0D] border border-neutral-800 rounded-xl p-4 sm:p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-neutral-400" /> Timeline
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Created</p>
                <p className="text-sm font-medium text-neutral-300">{formatDate(plan.createdAt)}</p>
              </div>
              {plan.updatedAt && plan.updatedAt !== plan.createdAt && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Last Updated</p>
                  <p className="text-sm font-medium text-neutral-300">{formatDate(plan.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl p-6 text-neutral-950">
            <p className="text-sm font-bold opacity-70">Your Balance</p>
            <p className="text-2xl font-bold mt-1">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <Link href="/dashboard/deposit" className="text-xs font-bold mt-2 inline-flex items-center gap-1 bg-black/10 px-3 py-1 rounded-md">
              Add Funds <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/90 backdrop-blur-sm p-4" onClick={() => !investing && setShowInvestModal(false)}>
          <div className="max-w-md w-full bg-[#0D0D0D] border border-neutral-800 rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-neutral-800">
              <h3 className="text-white font-bold text-xl">Invest in {plan.name}</h3>
              <p className="text-neutral-400 text-sm mt-1">{plan.approximateRoi || `${plan.roi}% ${plan.roiType} ROI`}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Balance */}
              <div className="bg-[#050505]/50 rounded-lg p-4 border border-neutral-800">
                <p className="text-neutral-400 text-xs mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-white">${balance.toLocaleString()}</p>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Investment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">$</span>
                  <input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#050505] border border-neutral-800 rounded-lg pl-8 pr-20 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    disabled={investing}
                  />
                  <button
                    type="button"
                    onClick={() => setInvestAmount(Math.min(balance, plan.maxDeposit).toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-neutral-900 text-amber-400 px-2 py-1 rounded hover:bg-neutral-800"
                    disabled={investing}
                  >
                    MAX
                  </button>
                </div>
                <p className="text-xs text-neutral-400 mt-2">Min: ${plan.minDeposit} | Max: ${plan.maxDeposit.toLocaleString()}</p>
              </div>

              {/* Returns Preview */}
              {investCalc && (
                <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-lg p-4">
                  <p className="text-emerald-400 text-xs font-medium mb-2">Expected Returns</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Total Profit:</span>
                      <span className="text-emerald-400 font-bold">+${investCalc.profit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Daily Profit:</span>
                      <span className="text-neutral-300">~${investCalc.daily.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-500/20 pt-2 mt-2">
                      <span className="text-white font-medium">Total Return:</span>
                      <span className="text-amber-400 font-bold">${investCalc.totalReturn.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {investError && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-rose-400 text-sm">{investError}</p>
                </div>
              )}

              {investSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-emerald-400 font-medium">Investment Created!</p>
                    <p className="text-emerald-300/80 text-sm mt-1">Your investment has been created successfully.</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInvestModal(false)}
                  className="flex-1 py-3 rounded-lg border border-neutral-800 text-white hover:bg-neutral-900 transition-colors"
                  disabled={investing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvest}
                  disabled={investing || !investAmount || parseFloat(investAmount) < plan.minDeposit}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-black font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {investing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Processing...
                    </>
                  ) : (
                    'Confirm Investment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component
const DetailCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}> = ({ icon: Icon, label, value, color }) => {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-500',
    blue: 'bg-amber-500/10 text-amber-500',
    purple: 'bg-purple-500/10 text-purple-500',
    amber: 'bg-amber-500/10 text-amber-400',
    cyan: 'bg-amber-500/10 text-amber-500',
    gold: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="bg-neutral-900/50 rounded-lg p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colorMap[color] || 'bg-neutral-800 text-neutral-400'}`}>
        <Icon size={16} />
      </div>
      <p className="text-xs text-neutral-500 font-medium">{label}</p>
      <p className="text-sm font-bold text-white mt-0.5">{value}</p>
    </div>
  );
};
