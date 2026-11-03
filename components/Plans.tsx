'use client'

import React from 'react';
import { Check, Info, Loader2 } from 'lucide-react';
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

  const calculateReturns = (minDeposit: number, roi: number, roiType: string, duration: number) => {
    let totalProfit = 0;

    if (roiType === 'daily') {
      totalProfit = minDeposit * (roi / 100) * duration;
    } else if (roiType === 'total') {
      totalProfit = minDeposit * (roi / 100);
    } else if (roiType === 'monthly') {
      const months = duration / 30;
      totalProfit = minDeposit * (roi / 100) * months;
    } else if (roiType === 'weekly') {
      const weeks = duration / 7;
      totalProfit = minDeposit * (roi / 100) * weeks;
    }

    const totalReturn = minDeposit + totalProfit;
    const daily = totalProfit / duration;

    return { totalReturn, profit: totalProfit, daily };
  };

  if (isLoading && plans.length === 0) {
    return (
      <section id="plans" className="py-24 bg-slate-950 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-cyan-400" size={48} />
          </div>
        </div>
      </section>
    );
  }

  if ((error || plans.length === 0) && initialPlans.length === 0) {
    return (
      <section id="plans" className="py-24 bg-slate-950 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-slate-400">No investment plans available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="plans" className="py-12 sm:py-24 bg-slate-950 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-3 sm:mb-4">Investment Plans</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">Choose a plan that aligns with your financial goals. Transparent returns, zero hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 items-start">
          {plans.map((plan) => {
            const { totalReturn, profit, daily } = calculateReturns(plan.minDeposit, plan.roi, plan.roiType, plan.duration);

            return (
              <div
                key={plan.id}
                className={`relative bg-slate-900/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-8 border ${
                  plan.isPopular
                    ? 'border-cyan-500/60 shadow-2xl shadow-cyan-500/15 md:scale-105 z-10 ring-1 ring-cyan-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                } transition-all duration-300 flex flex-col h-full`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1 px-3 sm:px-4 rounded-full shadow-lg shadow-cyan-500/30">
                    Most Popular
                  </div>
                )}

                <h3 className={`text-lg sm:text-2xl font-bold mb-2 ${plan.isPopular ? 'text-white' : 'text-slate-200'}`}>{plan.name}</h3>
                <div className="mb-2">
                  <div className="flex items-baseline">
                    {plan.approximateRoi ? (
                      <span className="text-xl sm:text-2xl font-bold text-cyan-400">{plan.approximateRoi}</span>
                    ) : (
                      <>
                        <span className="text-2xl sm:text-4xl font-bold text-cyan-400">{plan.roi}%</span>
                        <span className="text-slate-400 ml-2 text-sm">{plan.roiType} ROI</span>
                      </>
                    )}
                  </div>
                  {/* Detailed Breakdown */}
                  <div className="mt-2 bg-slate-950/70 rounded-lg p-3 border border-slate-800/80">
                    <div className="flex items-start space-x-2 text-xs text-slate-400">
                      <Info size={14} className="mt-0.5 text-cyan-400 shrink-0" />
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
                           <span className="text-slate-300 font-mono">~${daily.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1 mt-3 sm:mt-4">
                  <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-800 text-sm">
                    <span className="text-slate-400">Duration</span>
                    <span className="text-white font-medium">{plan.duration} {plan.durationType}</span>
                  </div>
                  <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-800 text-sm">
                    <span className="text-slate-400">Min Deposit</span>
                    <span className="text-white font-medium">${plan.minDeposit}</span>
                  </div>
                  <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-800 text-sm">
                    <span className="text-slate-400">Max Deposit</span>
                    <span className="text-white font-medium">${plan.maxDeposit.toLocaleString()}</span>
                  </div>
                  {plan.features && plan.features.length > 0 && (
                    <div className="pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                      {plan.features.map((feat: string, i: number) => (
                        <div key={i} className="flex items-center text-xs sm:text-sm text-slate-300">
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
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
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
