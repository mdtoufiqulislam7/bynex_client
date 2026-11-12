'use client'

import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, Radio } from 'lucide-react';
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
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#050505]">
      {/* Black & Gold Atmospheric Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://picsum.photos/1920/1080?grayscale&blur=2"
          alt="Background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/85 to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,183,0,0.18),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(245,183,0,0.08),_transparent_50%)]" />

        {/* Subtle Golden Candlestick Silhouette */}
        <svg
          className="absolute right-0 top-16 w-[340px] sm:w-[520px] h-[260px] opacity-25 pointer-events-none"
          viewBox="0 0 400 200"
          fill="none"
          aria-hidden="true"
        >
          {[
            { x: 30, y: 120, h: 32, wickTop: 108, wickBot: 162 },
            { x: 60, y: 105, h: 40, wickTop: 92, wickBot: 156 },
            { x: 90, y: 112, h: 28, wickTop: 98, wickBot: 150 },
            { x: 120, y: 95, h: 36, wickTop: 80, wickBot: 142 },
            { x: 150, y: 82, h: 44, wickTop: 68, wickBot: 138 },
            { x: 180, y: 90, h: 30, wickTop: 76, wickBot: 130 },
            { x: 210, y: 72, h: 42, wickTop: 55, wickBot: 125 },
            { x: 240, y: 60, h: 38, wickTop: 42, wickBot: 110 },
            { x: 270, y: 50, h: 48, wickTop: 34, wickBot: 108 },
            { x: 300, y: 40, h: 40, wickTop: 22, wickBot: 94 },
            { x: 330, y: 26, h: 46, wickTop: 10, wickBot: 86 },
            { x: 360, y: 18, h: 42, wickTop: 4, wickBot: 72 },
          ].map((c, idx) => (
            <g key={idx}>
              <line x1={c.x + 6} y1={c.wickTop} x2={c.x + 6} y2={c.wickBot} stroke="#F5B700" strokeWidth="1.5" strokeOpacity="0.65" />
              <rect x={c.x} y={c.y} width="12" height={c.h} rx="1.5" fill="#F5B700" fillOpacity={0.35 + idx * 0.04} />
            </g>
          ))}
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 sm:pt-28 pb-12 overflow-x-hidden">
        {/* Prominent Middle Position Live Trading Broadcast Showcase */}
        <LiveTradingBanner />

        <div className="inline-flex items-center space-x-2 bg-neutral-950/90 border border-amber-500/35 rounded-full px-3 sm:px-4 py-1.5 mb-6 sm:mb-8 backdrop-blur-sm animate-fade-in-up shadow-[0_0_20px_rgba(245,183,0,0.08)]">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs sm:text-sm text-neutral-200 font-medium">Platform Live &amp; Paying</span>
        </div>

        <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight px-1 sm:px-0">
          Your Future. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">Your Investment.</span>
          <br />
          <span className="text-lg sm:text-3xl md:text-5xl text-neutral-300 font-sans font-light mt-1 inline-block">Invest Today. Grow Tomorrow.</span>
        </h1>

        <p className="text-xs sm:text-base md:text-lg text-neutral-400 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2 sm:px-0">
          Bynex Markets is a next-generation algorithmic trading and investment platform built for sustainable wealth generation with institutional-grade capital protection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 px-4 sm:px-0">
          <a href="#plans" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-black/70 border border-amber-400/80 text-white hover:bg-amber-500/10 hover:border-amber-300 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center group">
            View Plans
            <ChevronRight className="ml-2 w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </a>
          <Link href="/dashboard" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black rounded-full font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>

        {/* Live Ticker Bar */}
        <div className="mt-12 sm:mt-16 border-t border-amber-500/20 pt-6 flex items-center justify-between text-xs text-neutral-400 max-w-xl mx-auto px-4">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span className="uppercase tracking-wider font-semibold text-neutral-200 text-left">Live Transactions</span>
          </div>
          <div className="h-4 w-px bg-amber-500/30 mx-3 hidden sm:block" />
          <div>
            Latest: <span className="text-white font-medium">{recentDeposits[tickerIndex].user}</span>{' '}
            <span className="text-emerald-400 font-bold">+${recentDeposits[tickerIndex].amount}</span>{' '}
            <span className="text-neutral-500 text-[10px]">({recentDeposits[tickerIndex].time})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
