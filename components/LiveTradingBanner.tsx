'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  Radio,
  ChevronRight,
  X,
  Sparkles,
  TrendingUp,
  Lock,
  LogIn,
  UserPlus,
  Play,
  VolumeX,
  ShieldCheck,
  Flame,
  Activity,
} from 'lucide-react';

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const router = useRouter();

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth?.isAuthenticated
  );

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
          const attributes = json?.data?.attributes || json?.data;
          if (attributes?.active && attributes?.stream) {
            setStream(attributes.stream);
          } else {
            setStream(null);
          }
        }
      } catch (err) {
        // Silent fail
      }
    };

    checkActiveLive();
    const interval = setInterval(checkActiveLive, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!stream) return null;

  const checkIsUserLoggedIn = () => {
    if (isAuthenticated) return true;
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) return true;
    }
    return false;
  };

  const handleEnterStream = (e: React.MouseEvent) => {
    e.preventDefault();
    if (checkIsUserLoggedIn()) {
      router.push('/live-trading');
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleGoogleLogin = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('post_login_redirect', '/live-trading');
    }
    window.location.href = '/api/v1/auth/google?redirect=true&source=website&postLoginRedirect=%2Flive-trading';
  };

  return (
    <>
      {/* Wide Centered Middle Live Broadcast Showcase in Hero */}
      <div className="w-full max-w-4xl lg:max-w-5xl mx-auto mb-10 sm:mb-12 text-left animate-in fade-in zoom-in-95 duration-300">
        <div
          onClick={handleEnterStream}
          className="relative rounded-3xl bg-gradient-to-b from-[#1c0b17]/95 via-[#0c1220]/95 to-[#070b14]/95 border-2 border-red-500/80 text-white shadow-[0_0_60px_-10px_rgba(239,68,68,0.5)] backdrop-blur-2xl overflow-hidden cursor-pointer group hover:border-red-400 transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Top Live Bar */}
          <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 bg-gradient-to-r from-red-950/90 via-slate-900 to-rose-950/90 border-b border-red-500/30">
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/40 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <Radio size={13} className="shrink-0" />
                STREAMING LIVE
              </span>
              <span className="text-sm sm:text-base font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                {stream.title}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full shrink-0">
              <Flame size={13} className="text-red-400 fill-red-400" />
              <span className="font-semibold">Trading Floor Session Active</span>
            </div>
          </div>

          {/* Wide Video Preview with Live Feed */}
          <div className="relative aspect-video w-full bg-black overflow-hidden group/player">
            {stream.youtubeVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${stream.youtubeVideoId}?autoplay=1&mute=1&controls=0&playsinline=1&modestbranding=1&rel=0`}
                title={stream.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full border-0 pointer-events-none"
              />
            ) : null}

            {/* Dark Gradient Overlay for text clarity */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent flex flex-col justify-between p-5 sm:p-8 transition-all group-hover/player:from-slate-950/95">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-200 bg-black/75 border border-slate-700/70 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-lg">
                  <VolumeX size={14} className="text-slate-400" />
                  Live Preview Playing • Click to join with audio
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/85 border border-cyan-500/40 px-3.5 py-1.5 rounded-full backdrop-blur-md font-semibold shadow-lg">
                  <ShieldCheck size={14} className="text-cyan-400" />
                  Verified Institutional Desk
                </span>
              </div>

              {/* Center Play Button Cue */}
              <div className="flex items-center justify-center my-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl shadow-red-600/60 group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300">
                  <Play size={32} className="fill-current ml-1" />
                </div>
              </div>

              {/* Bottom Cue */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Activity size={13} className="text-emerald-400 animate-pulse" />
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                      Live Market Execution & Signals
                    </p>
                  </div>
                  <p className="text-base sm:text-xl font-extrabold text-white truncate">
                    {stream.title}
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 group-hover:from-red-500 group-hover:to-amber-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-red-600/35 transition-all">
                    <Sparkles size={16} />
                    Watch Live Stream
                    <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Alert Footer */}
          <div className="px-5 sm:px-8 py-3 bg-slate-950 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
            <span className="flex items-center gap-2 truncate">
              <TrendingUp size={14} className="text-cyan-400 shrink-0" />
              <span>Real-time technical analysis, high-probability trade setups, and live host notes.</span>
            </span>
            <span className="text-cyan-400 font-bold group-hover:underline shrink-0 hidden sm:inline">
              Join Live Floor (Members Only) →
            </span>
          </div>
        </div>
      </div>

      {/* —— Login Required Modal (When Non-User Clicks to Enter) —— */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f1422] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-cyan-950/50 space-y-5 text-center relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-cyan-500/20 border border-red-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/40">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
                <Radio size={11} className="animate-pulse" />
                Live Trading Session Active
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Members-Only Access
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                Real-time trade execution, proprietary market commentary, and live pinned signals are
                exclusively accessible to authenticated Bynex members.
              </p>
            </div>

            {/* Quick Google Sign In */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleGoogleLogin}
                className="w-full inline-flex items-center justify-center gap-3 py-3 px-5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg transition-all active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href="/login?redirect=/live-trading"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('post_login_redirect', '/live-trading');
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                >
                  <LogIn size={13} />
                  Sign In
                </Link>
                <Link
                  href="/register?redirect=/live-trading"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('post_login_redirect', '/live-trading');
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-bold text-xs transition-colors"
                >
                  <UserPlus size={13} />
                  Register Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
