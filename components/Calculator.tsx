'use client'

import React, { useState } from 'react';
import { Calculator as CalcIcon } from 'lucide-react';

const Calculator = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [days, setDays] = useState<number>(30);

  // Profit scales linearly: 365 days = 100% (doubles), 30 days ≈ 10%, 60 days ≈ 20%, 90 days ≈ 30%
  const profitPercentage = (days / 365) * 100;
  const profit = Math.floor(amount * (profitPercentage / 100));
  const totalReturn = amount + profit;

  return (
    <section id="calculator" className="py-12 sm:py-24 bg-slate-900 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-6 sm:mb-8">
            <CalcIcon className="text-cyan-400 w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-white">Profit Calculator</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
            <div className="space-y-6 sm:space-y-8">
              {/* Amount Slider */}
              <div>
                <div className="flex justify-between mb-3 sm:mb-4">
                  <label className="text-slate-400 font-medium text-sm sm:text-base">Investment Amount</label>
                  <span className="text-cyan-400 font-bold text-base sm:text-xl">${amount}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="50000"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-2">
                  <span>$50</span>
                  <span>$50,000</span>
                </div>
              </div>

              {/* Days Slider */}
              <div>
                <div className="flex justify-between mb-3 sm:mb-4">
                  <label className="text-slate-400 font-medium text-sm sm:text-base">Duration (Days)</label>
                  <span className="text-cyan-400 font-bold text-base sm:text-xl">{days} Days</span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="365"
                  step="1"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-2">
                  <span>7 Days</span>
                  <span>365 Days</span>
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col justify-center space-y-4 sm:space-y-6">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm mb-1">Profit Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-cyan-400">{profitPercentage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs sm:text-sm mb-1">Total Return</p>
                <p className="text-2xl sm:text-4xl font-bold text-white">${totalReturn.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs sm:text-sm mb-1">Net Profit</p>
                <p className="text-xl sm:text-3xl font-bold text-green-500">+${profit.toLocaleString()}</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 italic border-t border-slate-800 pt-3 sm:pt-4">
                &quot;If I invest <span className="text-white">${amount.toLocaleString()}</span> for <span className="text-white">{days}</span> days, I earn <span className="text-green-400">{profitPercentage.toFixed(1)}%</span> profit — totaling <span className="text-cyan-400">${totalReturn.toLocaleString()}</span>.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
