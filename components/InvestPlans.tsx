'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Info, TrendingUp, Loader2, AlertCircle, DollarSign, CheckCircle, Eye, Users } from 'lucide-react';
import { useGetActivePlansQuery } from '@/store/api/investmentPlanApi';
import { useCreateInvestmentMutation } from '@/store/api/investmentApi';
import { useGetWalletQuery } from '@/store/api/walletApi';

const InvestPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch data
  const { data: plansResponse, isLoading: plansLoading } = useGetActivePlansQuery();
  const { data: walletResponse, isLoading: walletLoading } = useGetWalletQuery();
  const [createInvestment, { isLoading: investing }] = useCreateInvestmentMutation();

  const plans = plansResponse?.data?.attributes || [];
  const wallet = walletResponse?.data?.attributes;
  const balance = wallet?.balance || 0;

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

  const calculateReturns = (amount: number, roi: number, roiType: string, duration: number, durationType: string) => {
    let totalProfit = 0;
    const totalDays = getDurationInDays(duration, durationType);

    if (roiType === 'hourly') {
      const totalHours = totalDays * 24;
      totalProfit = amount * (roi / 100) * totalHours;
    } else if (roiType === 'daily') {
      totalProfit = amount * (roi / 100) * totalDays;
    } else if (roiType === 'total') {
      totalProfit = amount * (roi / 100);
    } else if (roiType === 'monthly') {
      const months = getDurationInMonths(duration, durationType);
      totalProfit = amount * (roi / 100) * months;
    } else if (roiType === 'weekly') {
      const weeks = totalDays / 7;
      totalProfit = amount * (roi / 100) * weeks;
    }

    const totalReturn = amount + totalProfit;

    // Calculate daily profit
    let daily = 0;
    if (roiType === 'total') {
      // For total ROI: divide by months, then by ~30 days per month
      const durationInMonths = getDurationInMonths(duration, durationType);
      const monthlyProfit = totalProfit / (durationInMonths || 1);
      const now = new Date();
      const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      daily = monthlyProfit / daysInCurrentMonth;
    } else {
      daily = totalProfit / (totalDays || 1);
    }

    return { totalReturn, profit: totalProfit, daily };
  };

  const handleChoosePlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowModal(true);
    setError('');
    setSuccess(false);
    setAmount('');
  };

  const handleInvest = async () => {
    if (!selectedPlan || !amount) {
      setError('Please enter an amount');
      return;
    }

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    const investAmount = parseFloat(amount);

    if (investAmount < plan.minDeposit) {
      setError(`Minimum investment is $${plan.minDeposit}`);
      return;
    }

    if (investAmount > plan.maxDeposit) {
      setError(`Maximum investment is $${plan.maxDeposit}`);
      return;
    }

    if (investAmount > balance) {
      setError('Insufficient balance');
      return;
    }

    try {
      await createInvestment({
        planId: selectedPlan,
        amount: investAmount,
      }).unwrap();

      setSuccess(true);
      setAmount('');
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setSelectedPlan(null);
      }, 2000);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create investment');
    }
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  if (plansLoading || walletLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-cyan-400" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Invest & Earn</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Select a plan to start growing your portfolio today.</p>
        </div>
        <div className="flex items-center space-x-2 text-cyan-400 bg-cyan-500/10 px-3 sm:px-4 py-2 rounded-lg w-fit">
          <DollarSign size={18} />
          <span className="font-bold text-sm sm:text-base">Balance: ${balance.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
        {plans.map((plan, idx) => {
          const { totalReturn, profit, daily } = calculateReturns(plan.minDeposit, plan.roi, plan.roiType, plan.duration, plan.durationType);
          const defaultCounts = [1000, 16798, 7897];
          const investorCount = plan.totalInvestors && plan.totalInvestors > 0 ? plan.totalInvestors : (defaultCounts[idx] ?? 1000);

          return (
            <div
              key={plan.id}
              className={`relative bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border flex flex-col h-full transition-all duration-300 ${
                plan.isPopular
                  ? 'border-cyan-500 shadow-xl shadow-cyan-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  Recommended
                </div>
              )}

              <div className="mb-3 sm:mb-4">
                <h3 className={`text-lg sm:text-xl font-bold mb-1.5 ${plan.isPopular ? 'text-white' : 'text-slate-300'}`}>{plan.name}</h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                  <Users size={12} />
                  {investorCount.toLocaleString()} Active Investors
                </span>
              </div>

              <div className="mb-4 sm:mb-6 text-center bg-slate-950/50 rounded-xl p-3 sm:p-4 border border-slate-800">
                 {plan.approximateRoi ? (
                   <>
                     <span className="block text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Approximate Return</span>
                     <span className="text-xl sm:text-2xl font-bold text-cyan-400">{plan.approximateRoi}</span>
                   </>
                 ) : (
                   <>
                     <span className="block text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1">{plan.roiType} Return</span>
                     <span className="text-3xl sm:text-4xl font-bold text-cyan-400">{plan.roi}%</span>
                   </>
                 )}
                 <span className="block text-slate-500 text-xs mt-1">for {plan.duration} {plan.durationType}</span>
              </div>

              {/* Breakdown */}
              <div className="mb-4 sm:mb-6 bg-slate-800/30 rounded-lg p-3 sm:p-4 border border-slate-800/50">
                 <div className="flex items-center space-x-2 mb-3">
                    <Info size={16} className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-200">Profit Calculator</span>
                 </div>
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Min. Invest</span>
                      <span className="text-white font-medium">${plan.minDeposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Profit</span>
                      <span className="text-green-400 font-medium">+${profit.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between border-t border-slate-700/50 pt-2 mt-2">
                      <span className="text-slate-300">Total Return</span>
                      <span className="text-cyan-400 font-bold">${totalReturn.toLocaleString()}</span>
                    </div>
                 </div>
              </div>

              {plan.features && plan.features.length > 0 && (
                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center text-sm text-slate-400">
                      <Check className="w-4 h-4 text-green-500 mr-3 shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto">
                 <div className="text-xs text-center text-slate-500 mb-3">
                    Deposit Range: ${plan.minDeposit} - ${plan.maxDeposit.toLocaleString()}
                 </div>
                 <button
                   onClick={() => handleChoosePlan(plan.id)}
                   className={`w-full py-3.5 rounded-lg font-bold transition-all ${
                     plan.isPopular
                       ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 shadow-lg shadow-cyan-500/20'
                       : 'bg-slate-800 hover:bg-slate-700 text-white'
                   }`}
                 >
                   Choose This Plan
                 </button>
                 <Link
                   href={`/dashboard/plans/${plan.id}`}
                   className="w-full mt-2 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all text-sm font-medium flex items-center justify-center gap-2"
                 >
                   <Eye size={14} /> View Details
                 </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Investment Modal */}
      {showModal && selectedPlanData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4" onClick={() => !investing && setShowModal(false)}>
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-white font-bold text-xl">Invest in {selectedPlanData.name}</h3>
              <p className="text-slate-400 text-sm mt-1">{selectedPlanData.approximateRoi || `${selectedPlanData.roi}% ${selectedPlanData.roiType} ROI`}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Balance Display */}
              <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                <p className="text-slate-400 text-xs mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-white">${balance.toLocaleString()}</p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Investment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-20 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    disabled={investing}
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(Math.min(balance, selectedPlanData.maxDeposit).toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-800 text-cyan-400 px-2 py-1 rounded hover:bg-slate-700"
                    disabled={investing}
                  >
                    MAX
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Min: ${selectedPlanData.minDeposit} | Max: ${selectedPlanData.maxDeposit.toLocaleString()}
                </p>
              </div>

              {/* Calculation Preview */}
              {amount && parseFloat(amount) >= selectedPlanData.minDeposit && (
                <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-lg p-4">
                  <p className="text-emerald-400 text-xs font-medium mb-2">Expected Returns</p>
                  <div className="space-y-1 text-sm">
                    {(() => {
                      const calc = calculateReturns(parseFloat(amount), selectedPlanData.roi, selectedPlanData.roiType, selectedPlanData.duration, selectedPlanData.durationType);
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Profit:</span>
                            <span className="text-emerald-400 font-bold">+${calc.profit.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Daily Profit:</span>
                            <span className="text-slate-300">~${calc.daily.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t border-emerald-500/20 pt-2 mt-2">
                            <span className="text-white font-medium">Total Return:</span>
                            <span className="text-cyan-400 font-bold">${calc.totalReturn.toFixed(2)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-rose-400 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-emerald-400 font-medium">Investment Created!</p>
                    <p className="text-emerald-300/80 text-sm mt-1">Your investment has been created successfully.</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-lg border border-slate-700 text-white hover:bg-slate-800 transition-colors"
                  disabled={investing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvest}
                  disabled={investing || !amount || parseFloat(amount) < selectedPlanData.minDeposit}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
};

export default InvestPlans;
