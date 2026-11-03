'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Radio, ChevronRight, X, Sparkles, TrendingUp } from 'lucide-react';

interface ActiveStream {
  id?: string;
  _id?: string;
  title: string;
  creatorName?: string;
  youtubeVideoId?: string;
  startedAt?: string;
}

export default function LiveTradingBanner() {
  const [stream, setStream] = useState<ActiveStream | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkActiveLive = async () => {
      try {
        const res = await fetch('/api/v1/live-trading/active', {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted) {
          if (json?.data?.active && json?.data?.stream) {
            setStream(json.data.stream);
          } else {
            setStream(null);
          }
        }
      } catch (err) {
        // Silent fail on network error
      }
    };

    checkActiveLive();
    // Poll every 15 seconds to auto-show when admin starts live
    const interval = setInterval(checkActiveLive, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!stream || isDismissed) return null;

  return (
    <aside aria-label="Live Trading Announcement" className="relative z-40 bg-gradient-to-r from-red-950/90 via-slate-900 to-rose-950/90 border-b border-rose-500/30 text-white backdrop-blur-md shadow-lg shadow-rose-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
          {/* Left badge & title */}
          <Link
            href="/live-trading"
            className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 group hover:opacity-95 transition-opacity"
          >
            {/* Live pulsing badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-xs font-black tracking-wider uppercase shadow-md shadow-red-600/40 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <Radio size={13} className="shrink-0" />
              LIVE
            </span>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                {stream.title}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-xs text-rose-300/80 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 shrink-0">
                <TrendingUp size={12} />
                Market Floor
              </span>
            </div>
          </Link>

          {/* Right action button & close */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            <Link
              href="/live-trading"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-red-600/25 active:scale-95"
            >
              <Sparkles size={14} className="hidden sm:inline" />
              Watch Live
              <ChevronRight size={14} />
            </Link>

            <button
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss banner"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
