'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  Radio,
  Pin,
  Clock,
  ShieldCheck,
  Share2,
  TrendingUp,
  Volume2,
  MessageSquare,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Lock,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Toast, ToastType } from '@/components/Toast';

interface HighlightComment {
  id?: string;
  _id?: string;
  text: string;
  authorName?: string;
  authorRole?: string;
  isPinned?: boolean;
  createdAt?: string;
}

interface LiveStreamData {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  status: 'live' | 'ended' | 'scheduled';
  isActive: boolean;
  creatorName?: string;
  startedAt?: string;
  highlights?: HighlightComment[];
  viewerCount?: number;
}

/**
 * Convert any HTML, AI markup, or encoded tags into pure solid text.
 */
function cleanToSolidText(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let text = raw.trim();

  // Decode common HTML entities
  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');

  // Extract clean links from <a href="...">...</a> before stripping tags
  text = text.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, content) => {
    const cleanContent = content.replace(/<[^>]+>/g, '').trim();
    if (!cleanContent || href.includes(cleanContent) || cleanContent.includes(href)) {
      return href;
    }
    return `${cleanContent}: ${href}`;
  });

  // Strip Google/AI junk tags: <response-element...>, <!---->, <link-block...>
  text = text.replace(/<response-element[\s\S]*?<\/response-element>/gi, (match) => {
    const linkMatch = match.match(/https?:\/\/[^\s"'<>]+/);
    return linkMatch ? ` ${linkMatch[0]} ` : ' ';
  });
  text = text.replace(/<link-block[^>]*>/gi, '');
  text = text.replace(/<\/link-block>/gi, '');
  text = text.replace(/<!---->/g, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Convert HTML structural tags into natural linebreaks & bullet points
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<li>/gi, '\n• ');
  text = text.replace(/<\/li>/gi, '');
  text = text.replace(/<\/ul>/gi, '\n');
  text = text.replace(/<\/ol>/gi, '\n');
  text = text.replace(/<h[1-6][^>]*>/gi, '\n\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n');

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Normalize whitespace: remove leading/trailing spaces per line and excessive empty lines
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''));

  return lines.join('\n').trim();
}

/**
 * Format URLs and trading signal badges in solid text into clickable, styled elements.
 */
function renderSolidTextTokens(solidText: string) {
  const tokenRegex = /(https?:\/\/[^\s<]+|\[(?:🟢 BUY|🔴 SELL|🎯 TP|🛑 SL|⚡ ALERT|💎 VIP)[^\]]*\])/g;
  const parts = solidText.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 underline font-semibold break-all inline-flex items-center gap-0.5 mx-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
          <ExternalLink size={12} className="inline-block shrink-0" />
        </a>
      );
    }

    if (part.startsWith('[') && part.endsWith(']')) {
      const isBuy = part.includes('BUY');
      const isSell = part.includes('SELL');
      const isTp = part.includes('TP');
      const isSl = part.includes('SL');
      const colorClass = isBuy
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
        : isSell
        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
        : isTp
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
        : isSl
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
        : 'bg-purple-500/20 text-purple-400 border-purple-500/40';

      return (
        <span
          key={index}
          className={`inline-block px-2 py-0.5 rounded font-black text-xs uppercase tracking-wider border mx-1 shadow-sm ${colorClass}`}
        >
          {part.slice(1, -1)}
        </span>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

const SolidTextDisplay: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const solid = cleanToSolidText(text);
  return (
    <div className={`whitespace-pre-line leading-relaxed break-words font-sans select-text ${className || ''}`}>
      {renderSolidTextTokens(solid)}
    </div>
  );
};

interface LiveTradingRoomProps {
  embedded?: boolean;
}

export default function LiveTradingRoom({ embedded = false }: LiveTradingRoomProps) {
  const router = useRouter();
  const [stream, setStream] = useState<LiveStreamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const prevHighlightsCountRef = useRef(0);

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth?.isAuthenticated
  );

  useEffect(() => {
    // Determine login status
    if (isAuthenticated) {
      setIsUserLoggedIn(true);
    } else if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      setIsUserLoggedIn(Boolean(token));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // If user is on the public page and already logged in, redirect into the dashboard room
    if (!embedded && isUserLoggedIn) {
      router.replace('/dashboard/live-trading');
    }
  }, [embedded, isUserLoggedIn, router]);

  const fetchStream = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const res = await fetch('/api/v1/live-trading/active', {
        cache: 'no-store',
      });
      if (!res.ok) {
        setStream(null);
        return;
      }
      const data = await res.json();
      const attributes = data?.data?.attributes || data?.data;

      if (attributes?.active && attributes?.stream) {
        const currentStream: LiveStreamData = attributes.stream;
        setStream(currentStream);

        const newCount = currentStream.highlights?.length || 0;
        if (
          prevHighlightsCountRef.current > 0 &&
          newCount > prevHighlightsCountRef.current
        ) {
          const newest = currentStream.highlights?.[newCount - 1];
          if (newest) {
            setToast({
              message: `New highlight published by Admin!`,
              type: 'info',
            });
          }
        }
        prevHighlightsCountRef.current = newCount;
      } else {
        setStream(null);
      }
    } catch (err) {
      // Silent error on poll
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStream();
    // Poll every 5 seconds for real-time highlight comments & status
    const interval = setInterval(() => fetchStream(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setToast({
        message: 'Live stream link copied to clipboard!',
        type: 'success',
      });
    }
  };

  const handleGoogleLogin = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('post_login_redirect', '/dashboard/live-trading');
    }
    window.location.href = '/api/v1/auth/google?redirect=true&source=website&postLoginRedirect=%2Fdashboard%2Flive-trading';
  };

  // Find active pinned highlight (or latest highlight)
  const pinnedHighlight =
    stream?.highlights?.slice().reverse().find((h) => h.isPinned) ||
    (stream?.highlights && stream.highlights.length > 0
      ? stream.highlights[stream.highlights.length - 1]
      : null);

  // Sorted list of all highlights (newest first)
  const allHighlights = stream?.highlights
    ? [...stream.highlights].reverse()
    : [];

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={
        embedded
          ? 'space-y-6'
          : 'min-h-screen bg-[#050505] text-neutral-100 pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8'
      }
    >
      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className={embedded ? 'space-y-6' : 'max-w-7xl mx-auto space-y-6'}>
        {/* Top Header Breadcrumb & Controls */}
        <div className="flex items-center justify-between flex-wrap gap-2.5 sm:gap-4 pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href={embedded ? '/dashboard' : '/'}
              className="text-xs sm:text-sm font-semibold text-neutral-400 hover:text-amber-400 transition-colors shrink-0"
            >
              {embedded ? 'Dashboard' : '← Back'}
            </Link>
            <span className="text-neutral-600">/</span>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                Live Trading Floor
              </span>
              {stream?.status === 'live' && (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] sm:text-xs font-black tracking-wider uppercase shadow-md shadow-red-600/30 animate-pulse shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => fetchStream(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#0D0D0D] border border-neutral-800 hover:border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
              title="Refresh Stream"
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? 'animate-spin text-amber-400' : ''}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#0D0D0D] border border-neutral-800 hover:border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="min-h-[500px] flex flex-col items-center justify-center rounded-2xl bg-[#0D0D0D]/40 border border-neutral-800/60 p-12 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mb-4" />
            <p className="text-neutral-400 text-sm">Connecting to Bynex Live Trading Floor...</p>
          </div>
        )}

        {/* —— NON-LOGGED-IN GATE (Requires user login for access) —— */}
        {!isLoading && !isUserLoggedIn && (
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#0D0D0D] via-[#0d1322] to-[#050505] border-2 border-amber-500/30 p-5 sm:p-14 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent pointer-events-none" />

            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 sm:mb-6 text-amber-400 shadow-xl shadow-amber-950/40">
              <Lock size={26} className="sm:w-9 sm:h-9" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-3 sm:mb-4">
              <Radio size={12} className="animate-pulse" />
              Members Only Access
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight">
              Sign In to Enter the Live Trading Room
            </h1>
            <p className="text-neutral-400 max-w-lg mx-auto text-xs sm:text-base leading-relaxed mb-6 sm:mb-8 px-2">
              Live market execution, institutional strategy commentary, and live pinned signals are
              restricted to authenticated Bynex Markets members. Please sign in or create an account to access the broadcast.
            </p>

            {/* Google Sign In & Auth Actions */}
            <div className="max-w-sm mx-auto space-y-3">
              <button
                onClick={handleGoogleLogin}
                className="w-full inline-flex items-center justify-center gap-3 py-3 px-5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm shadow-xl shadow-amber-500/10 transition-all active:scale-95 cursor-pointer"
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

              <div className="flex items-center gap-3 pt-1">
                <Link
                  href="/login?redirect=/dashboard/live-trading"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('post_login_redirect', '/dashboard/live-trading');
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors"
                >
                  <LogIn size={14} />
                  Sign In
                </Link>
                <Link
                  href="/register?redirect=/dashboard/live-trading"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('post_login_redirect', '/dashboard/live-trading');
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white font-bold text-xs transition-colors"
                >
                  <UserPlus size={14} />
                  Register Free
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Offline / No Live Stream State (When logged in but no active stream) */}
        {!isLoading && isUserLoggedIn && !stream && (
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#0D0D0D]/80 via-[#0D0D0D]/40 to-[#050505] border border-neutral-800/80 p-6 sm:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent pointer-events-none" />

            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-neutral-900/70 border border-neutral-800/60 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner text-neutral-400">
              <Radio size={28} className="sm:w-9 sm:h-9 text-neutral-500" />
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white mb-2 sm:mb-3">
              Trading Session Currently Offline
            </h1>
            <p className="text-neutral-400 max-w-lg mx-auto text-xs sm:text-base leading-relaxed mb-6 sm:mb-8 px-2">
              Our market strategists stream live analysis, trade execution, and high-probability
              setups during London and New York market hours. The stream will automatically display here
              when an admin starts broadcasting.
            </p>

            <div className="inline-flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto px-4 sm:px-0">
              <Link
                href="/dashboard/plans/invest"
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 text-center"
              >
                Explore Investment Plans
              </Link>
              <Link
                href="/community"
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#0D0D0D] border border-neutral-800 hover:border-neutral-800 text-neutral-300 font-semibold text-xs sm:text-sm transition-all text-center"
              >
                View Community Feed
              </Link>
            </div>
          </div>
        )}

        {/* Active Live Stream Trading Room Layout (When logged in & stream is active) */}
        {!isLoading && isUserLoggedIn && stream && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
            {/* Left 8 Columns: Live Video Player & Stream Details */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-5">
              {/* YouTube Video Player Responsive Container */}
              <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-2xl aspect-video group">
                <iframe
                  src={`https://www.youtube.com/embed/${stream.youtubeVideoId}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1`}
                  title={stream.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0 absolute inset-0"
                />
              </div>

              {/* Stream Title, Host Info, Badges */}
              <div className="rounded-xl sm:rounded-2xl bg-[#0D0D0D]/60 border border-neutral-800/80 p-4 sm:p-6 backdrop-blur-md">
                <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] sm:text-xs font-black tracking-wider uppercase shadow-md shadow-red-600/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        LIVE NOW
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-amber-300 bg-amber-950/60 border border-amber-800/40 px-2 sm:px-2.5 py-0.5 rounded-md">
                        <TrendingUp size={11} className="shrink-0" />
                        Professional Trading Floor
                      </span>
                      {stream.startedAt && (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-neutral-400">
                          <Clock size={11} className="shrink-0" />
                          Started {formatTime(stream.startedAt)}
                        </span>
                      )}
                    </div>

                    <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug break-words">
                      {stream.title}
                    </h1>

                    <div className="flex items-center gap-1.5 sm:gap-2 pt-1 text-xs sm:text-sm text-neutral-400 flex-wrap">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-[10px] sm:text-xs shrink-0">
                        B
                      </div>
                      <span className="font-semibold text-neutral-200 truncate">
                        {stream.creatorName || 'Bynex Markets Admin'}
                      </span>
                      <ShieldCheck size={13} className="text-amber-400 shrink-0" />
                      <span className="text-neutral-600">•</span>
                      <span className="text-xs text-neutral-400">Official Broadcast</span>
                    </div>
                  </div>
                </div>

                {stream.description && (
                  <p className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-800 text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line break-words">
                    {stream.description}
                  </p>
                )}
              </div>

              {/* Pinned Facebook-Style Highlight Card on Mobile / Desktop */}
              {pinnedHighlight && (
                <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0D0D0D] to-amber-500/10 border-2 border-amber-500/40 p-3.5 sm:p-5 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-500/20">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wide">
                      <Sparkles size={14} className="text-amber-400 shrink-0" />
                      <span>Official Pinned Announcement</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider shrink-0">
                      <Pin size={10} className="fill-current" />
                      Pinned
                    </span>
                  </div>

                  <div className="pt-0.5">
                    {pinnedHighlight.createdAt && (
                      <div className="text-[10px] sm:text-[11px] text-neutral-400 mb-1.5">
                        Broadcasted {formatTime(pinnedHighlight.createdAt)}
                      </div>
                    )}
                    <SolidTextDisplay
                      text={pinnedHighlight.text}
                      className="text-xs sm:text-sm text-neutral-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Columns: Highlight Comments Feed (Facebook Live Pin Style) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-xl sm:rounded-2xl bg-[#0D0D0D]/70 border border-neutral-800 p-3.5 sm:p-5 flex flex-col h-[480px] sm:h-[550px] lg:h-[650px] shadow-2xl backdrop-blur-md">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-amber-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Live Highlights & Signals
                    </h2>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40 font-mono">
                    {allHighlights.length} updates
                  </span>
                </div>

                {/* Subtitle notice */}
                <div className="py-2.5 px-3 rounded-lg bg-[#050505]/60 border border-neutral-800/60 text-xs text-neutral-400 flex items-center gap-2 my-3 shrink-0">
                  <ShieldCheck size={14} className="text-amber-400 shrink-0" />
                  <span>Signals & market notes broadcasted live by Admin.</span>
                </div>

                {/* Highlights List Scrollable Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                  {allHighlights.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                      <Pin size={24} className="mb-2 opacity-40" />
                      <p className="text-xs">No highlight notes published yet.</p>
                      <p className="text-[11px] text-neutral-600 mt-1">
                        When the admin pins trading signals or highlights, they will appear here in real time.
                      </p>
                    </div>
                  ) : (
                    allHighlights.map((highlight, idx) => {
                      const isPinned = highlight.isPinned;
                      return (
                        <div
                          key={highlight._id || highlight.id || idx}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isPinned
                              ? 'bg-gradient-to-br from-amber-500/10 via-[#0D0D0D] to-[#050505] border-amber-500/50 shadow-md shadow-amber-500/10'
                              : 'bg-[#050505]/50 border-neutral-800/70 hover:border-neutral-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-amber-400">
                                {highlight.authorName || 'Bynex Admin'}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800/40 text-amber-300 uppercase font-mono font-bold">
                                MOD
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                              {isPinned && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  <Pin size={9} className="fill-current" />
                                  Pinned
                                </span>
                              )}
                              <span>{formatTime(highlight.createdAt)}</span>
                            </div>
                          </div>

                          <SolidTextDisplay
                            text={highlight.text}
                            className="text-xs sm:text-sm text-neutral-200 font-medium"
                          />
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer disclaimer */}
                <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-500 text-center shrink-0">
                  Market prices fluctuate rapidly. Always apply proper risk management.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
