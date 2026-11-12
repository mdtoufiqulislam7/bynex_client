'use client'

import React from 'react';
import { Check, Info, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import { useGetActivePlansQuery } from '@/store/api/investmentPlanApi';

interface PlansProps {
  initialPlans?: any[];
}

const Plans: React.FC<PlansProps> = ({ initialPlans = [] }) => {
  const { data: plansResponse, isLoading, error } = useGetActivePlansQuery(undefined, {
    skip: initialPlans.length > 0,
  });
  
  const plans = initialPlans.length > 0 
    ? initialPlans 
    : (plansResponse?.data?.attributes || []);

  const getDurationInDays = (duration: number, durationType: string = 'days') => {
    switch (durationType) {
      case 'minutes': return duration / (24 * 60);
      case 'hours': return duration / 24;
      case 'days': return duration;
      case 'weeks': return duration * 7;
      case 'months': return duration * 30;
      default: return duration;
    }
  };

  const calculateReturns = (minDeposit: number, roi: number, roiType: string, duration: number, durationType: string = 'days') => {
    let totalProfit = 0;
    const totalDays = getDurationInDays(duration, durationType);

    if (roiType === 'hourly') {
      totalProfit = minDeposit * (roi / 100) * totalDays * 24;
    } else if (roiType === 'daily') {
      totalProfit = minDeposit * (roi / 100) * totalDays;
    } else if (roiType === 'total') {
      totalProfit = minDeposit * (roi / 100);
    } else if (roiType === 'monthly') {
      const months = totalDays / 30;
      totalProfit = minDeposit * (roi / 100) * months;
    } else if (roiType === 'weekly') {
      const weeks = totalDays / 7;
      totalProfit = minDeposit * (roi / 100) * weeks;
    }

    const totalReturn = minDeposit + totalProfit;
    const daily = totalProfit / (totalDays || 1);

    return { totalReturn, profit: totalProfit, daily };
  };

  if (isLoading && plans.length === 0) {
    return (
      <section id="plans" className="py-24 bg-[#050505] relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-amber-400" size={48} />
          </div>
        </div>
      </section>
    );
  }

  if ((error || plans.length === 0) && initialPlans.length === 0) {
    return (
      <section id="plans" className="py-24 bg-[#050505] relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-neutral-400">No investment plans available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="plans" className="py-12 sm:py-24 bg-[#050505] relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-3 sm:mb-4">Investment Plans</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base">Choose a plan that aligns with your financial goals. Transparent returns, zero hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 items-start">
          {plans.map((plan, idx) => {
            const { totalReturn, profit, daily } = calculateReturns(plan.minDeposit, plan.roi, plan.roiType, plan.duration, plan.durationType);
            const defaultCounts = [1000, 16798, 7897];
            const investorCount = plan.totalInvestors && plan.totalInvestors > 0 ? plan.totalInvestors : (defaultCounts[idx] ?? 1000);

            return (
              <div
                key={plan.id}
                className={`relative bg-[#0D0D0D]/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-8 border ${
                  plan.isPopular
                    ? 'border-amber-400/70 shadow-2xl shadow-amber-500/15 md:scale-105 z-10 ring-1 ring-amber-400/30'
                    : 'border-neutral-800 hover:border-amber-500/40'
                } transition-all duration-300 flex flex-col h-full`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1 px-3 sm:px-4 rounded-full shadow-lg shadow-amber-500/30">
                    Most Popular
                  </div>
                )}

                <h3 className={`text-lg sm:text-2xl font-bold mb-1.5 ${plan.isPopular ? 'text-white' : 'text-neutral-200'}`}>{plan.name}</h3>
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
                    <Users size={12} />
                    {investorCount.toLocaleString()} Active Investors
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex items-baseline">
                    {plan.approximateRoi ? (
                      <span className="text-xl sm:text-2xl font-bold text-amber-400">{plan.approximateRoi}</span>
                    ) : (
                      <>
                        <span className="text-2xl sm:text-4xl font-bold text-amber-400">{plan.roi}%</span>
                        <span className="text-neutral-400 ml-2 text-sm">{plan.roiType} ROI</span>
                      </>
                    )}
                  </div>
                  {/* Detailed Breakdown */}
                  <div className="mt-2 bg-[#050505]/90 rounded-lg p-3 border border-neutral-800/80">
                    <div className="flex items-start space-x-2 text-xs text-neutral-400">
                      <Info size={14} className="mt-0.5 text-amber-400 shrink-0" />
                      <div className="space-y-1">
                        <p>Min. Deposit <strong>${plan.minDeposit}</strong> yields:</p>
                        <div className="flex justify-between w-full space-x-4">
                           <span>Total Return:</span>
                           <span className="text-white font-mono">${totalReturn.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between w-full space-x-4">
                           <span>Net Profit:</span>
                           <span className="text-emerald-400 font-mono">+${profit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between w-full space-x-4">
                           <span>Daily Profit:</span>
                           <span className="text-neutral-300 font-mono">~${daily.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1 mt-3 sm:mt-4">
                  <div className="flex justify-between py-1.5 sm:py-2 border-b border-neutral-800 text-sm">
                    <span className="text-neutral-400">Duration</span>
                    <span className="text-white font-medium">{plan.duration} {plan.durationType}</span>
                  </div>
                  <div className="flex justify-between py-1.5 sm:py-2 border-b border-neutral-800 text-sm">
                    <span className="text-neutral-400">Min Deposit</span>
                    <span className="text-white font-medium">${plan.minDeposit}</span>
                  </div>
                  <div className="flex justify-between py-1.5 sm:py-2 border-b border-neutral-800 text-sm">
                    <span className="text-neutral-400">Max Deposit</span>
                    <span className="text-white font-medium">${plan.maxDeposit.toLocaleString()}</span>
                  </div>
                  {plan.features && plan.features.length > 0 && (
                    <div className="pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                      {plan.features.map((feat: string, i: number) => (
                        <div key={i} className="flex items-center text-xs sm:text-sm text-neutral-300">
                          <Check className="w-4 h-4 text-emerald-400 mr-2 sm:mr-3 flex-shrink-0" />
                          {feat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/dashboard/plans/invest"
                  className={`w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base text-center transition-all block ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black shadow-lg shadow-amber-500/25'
                      : 'bg-neutral-900 border border-amber-500/40 hover:bg-amber-500/10 text-white'
                  }`}
                >
                  Invest Now
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Plans;
