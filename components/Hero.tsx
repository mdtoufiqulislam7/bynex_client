'use client'

import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import LiveTradingBanner from './LiveTradingBanner';

const Hero = () => {
  const [tickerIndex, setTickerIndex] = useState(0);
  const recentDeposits = [
    { user: 'AlexM***', amount: 500, time: '2s ago' },
    { user: 'SarahK***', amount: 1200, time: '5s ago' },
    { user: 'CryptoKing', amount: 5000, time: '12s ago' },
    { user: 'Investor88', amount: 350, time: '18s ago' },
    { user: 'WealthGen', amount: 2500, time: '25s ago' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % recentDeposits.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [recentDeposits.length]);

  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/1920/1080?grayscale&blur=2"
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 sm:pt-28 pb-12 overflow-x-hidden">
        {/* Prominent Middle Position Live Trading Broadcast Showcase */}
        <LiveTradingBanner />

        <div className="inline-flex items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-full px-3 sm:px-4 py-1.5 mb-6 sm:mb-8 backdrop-blur-sm animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs sm:text-sm text-slate-300 font-medium">Platform Live & Paying</span>
        </div>

        <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight px-1 sm:px-0">
          Your Future. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500">Your Investment.</span>
          <br />
          <span className="text-lg sm:text-3xl md:text-5xl text-slate-400 font-sans font-light mt-1 inline-block">Invest Today. Grow Tomorrow.</span>
        </h1>

        <p className="text-xs sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2 sm:px-0">
          Bynex Markets is a next-generation algorithmic trading and investment platform built for sustainable wealth generation with institutional-grade capital protection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 px-4 sm:px-0">
          <a href="#plans" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent border border-slate-600 text-white hover:border-cyan-400 hover:text-cyan-400 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center group">
            View Plans
            <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <Link href="/dashboard" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>

        {/* Live Ticker Bar */}
        <div className="mt-12 sm:mt-16 border-t border-slate-800/80 pt-6 flex items-center justify-between text-xs text-slate-400 max-w-xl mx-auto px-4">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="uppercase tracking-wider font-semibold text-slate-300">Live Transactions</span>
          </div>
          <div>
            Latest: <span className="text-white font-medium">{recentDeposits[tickerIndex].user}</span>{' '}
            <span className="text-green-400 font-bold">+${recentDeposits[tickerIndex].amount}</span>{' '}
            <span className="text-slate-500 text-[10px]">({recentDeposits[tickerIndex].time})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
