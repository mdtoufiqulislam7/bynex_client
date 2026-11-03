'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
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

export default function LiveTradingRoom() {
  const [stream, setStream] = useState<LiveStreamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const prevHighlightsCountRef = useRef(0);

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
      if (data?.data?.active && data?.data?.stream) {
        const currentStream: LiveStreamData = data.data.stream;
        setStream(currentStream);

        // Check if a new highlight arrived to notify the user
        const newCount = currentStream.highlights?.length || 0;
        if (
          prevHighlightsCountRef.current > 0 &&
          newCount > prevHighlightsCountRef.current
        ) {
          const newest = currentStream.highlights?.[newCount - 1];
          if (newest) {
            setToast({
              message: `New highlight from Admin: "${newest.text.slice(0, 50)}${newest.text.length > 50 ? '...' : ''}"`,
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
    <div className="min-h-screen bg-[#070B14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Breadcrumb & Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs sm:text-sm text-slate-400 hover:text-cyan-400 transition-colors"
            >
              ← Back to Home
            </Link>
            <span className="text-slate-600">/</span>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-200">
                Live Trading Floor
              </span>
              {stream?.status === 'live' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-xs font-black tracking-wider uppercase shadow-md shadow-red-600/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchStream(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              title="Refresh Stream"
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? 'animate-spin text-cyan-400' : ''}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="min-h-[500px] flex flex-col items-center justify-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-12 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Connecting to Bynex Live Trading Floor...</p>
          </div>
        )}

        {/* Offline / No Live Stream State */}
        {!isLoading && !stream && (
          <div className="rounded-3xl bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-950 border border-slate-800/80 p-8 sm:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent pointer-events-none" />

            <div className="w-20 h-20 rounded-3xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-center mx-auto mb-6 shadow-inner text-slate-400">
              <Radio size={36} className="text-slate-500" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Trading Session Currently Offline
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-8">
              Our market strategists stream live analysis, trade execution, and high-probability
              setups during London and New York market hours. The stream will automatically display here
              when an admin starts broadcasting.
            </p>

            <div className="inline-flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard/plans/invest"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20"
              >
                Explore Investment Plans
              </Link>
              <Link
                href="/community"
                className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-sm transition-all"
              >
                View Community Feed
              </Link>
            </div>
          </div>
        )}

        {/* Active Live Stream Trading Room Layout */}
        {!isLoading && stream && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Columns: Live Video Player & Stream Details */}
            <div className="lg:col-span-8 space-y-5">
              {/* YouTube Video Player Responsive Container */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl aspect-video group">
                <iframe
                  src={`https://www.youtube.com/embed/${stream.youtubeVideoId}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1`}
                  title={stream.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0 absolute inset-0"
                />
              </div>

              {/* Stream Title, Host Info, Badges */}
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-md">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-600 text-white text-xs font-black tracking-wider uppercase shadow-md shadow-red-600/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        LIVE NOW
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 rounded-md">
                        <TrendingUp size={12} />
                        Professional Trading Floor
                      </span>
                      {stream.startedAt && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={12} />
                          Started {formatTime(stream.startedAt)}
                        </span>
                      )}
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                      {stream.title}
                    </h1>

                    <div className="flex items-center gap-2 pt-1 text-xs sm:text-sm text-slate-400">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
                        B
                      </div>
                      <span className="font-semibold text-slate-200">
                        {stream.creatorName || 'Bynex Markets Admin'}
                      </span>
                      <ShieldCheck size={14} className="text-cyan-400" />
                      <span className="text-slate-600">•</span>
                      <span>Official Broadcast</span>
                    </div>
                  </div>
                </div>

                {stream.description && (
                  <p className="mt-4 pt-4 border-t border-slate-800 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {stream.description}
                  </p>
                )}
              </div>

              {/* Pinned Facebook-Style Highlight Card on Mobile / Desktop */}
              {pinnedHighlight && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-cyan-500/10 border-2 border-amber-500/40 p-4 sm:p-5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-bl-lg flex items-center gap-1">
                    <Pin size={11} className="fill-current" />
                    Pinned by Host
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                      <Sparkles size={18} />
                    </div>

                    <div className="flex-1 min-w-0 pr-16 sm:pr-20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                          Official Pinned Announcement
                        </span>
                        {pinnedHighlight.createdAt && (
                          <span className="text-[11px] text-slate-400">
                            • {formatTime(pinnedHighlight.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                        {pinnedHighlight.text}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Columns: Highlight Comments Feed (Facebook Live Pin Style) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-5 flex flex-col h-[650px] shadow-2xl backdrop-blur-md">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-cyan-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Live Highlights & Signals
                    </h2>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-mono">
                    {allHighlights.length} updates
                  </span>
                </div>

                {/* Subtitle notice */}
                <div className="py-2.5 px-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 flex items-center gap-2 my-3 shrink-0">
                  <ShieldCheck size={14} className="text-cyan-400 shrink-0" />
                  <span>Signals & market notes broadcasted live by Admin.</span>
                </div>

                {/* Highlights List Scrollable Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {allHighlights.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                      <Pin size={24} className="mb-2 opacity-40" />
                      <p className="text-xs">No highlight notes published yet.</p>
                      <p className="text-[11px] text-slate-600 mt-1">
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
                              ? 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border-amber-500/50 shadow-md shadow-amber-500/10'
                              : 'bg-slate-950/50 border-slate-800/70 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-cyan-400">
                                {highlight.authorName || 'Bynex Admin'}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800/40 text-cyan-300 uppercase font-mono font-bold">
                                MOD
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              {isPinned && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  <Pin size={9} className="fill-current" />
                                  Pinned
                                </span>
                              )}
                              <span>{formatTime(highlight.createdAt)}</span>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words font-medium">
                            {highlight.text}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer disclaimer */}
                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center shrink-0">
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
