'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  useGetCommunityPostsQuery,
  useCreateCommunityPostMutation,
  useReactToPostMutation,
  CommunityPost,
} from '../store/api/communityApi';
import {
  MessageSquare,
  Sparkles,
  Send,
  Search,
  Flame,
  Globe2,
  TrendingUp,
  LogIn,
  UserPlus,
  Loader2,
  CheckCircle2,
  X,
  Share2,
  Lock,
} from 'lucide-react';

const REACTION_CONFIG = [
  { type: 'like' as const, emoji: '👍', label: 'Like', activeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { type: 'love' as const, emoji: '❤️', label: 'Love', activeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { type: 'fire' as const, emoji: '🔥', label: 'Fire', activeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { type: 'rocket' as const, emoji: '🚀', label: 'Rocket', activeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { type: 'clap' as const, emoji: '👏', label: 'Clap', activeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
];

const PRESET_TAGS = [
  'All',
  '#Profit',
  '#Investment',
  '#LiveSession',
  '#India',
  '#Bangladesh',
  '#SaudiArabia',
  '#Crypto',
];

const QUICK_COUNTRIES = [
  { name: 'United States', code: 'US', flag: '🇺🇸' },
  { name: 'India', code: 'IN', flag: '🇮🇳' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦' },
  { name: 'Bangladesh', code: 'BD', flag: '🇧🇩' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
  { name: 'Global', code: 'GLOBAL', flag: '🌐' },
];

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.max(1, Math.floor(diffMs / 60000));
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return 'Just now';
  }
}

export default function CommunityContent() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  // Live auto-incrementing time ticker
  const [mountTime] = useState<number>(() => Date.now());
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  useEffect(() => {
    // Ticks every 10 seconds so elapsed minutes auto-increment live on the screen
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-increment relative time function:
  // Starts with initial time, auto-increments every minute (++),
  // and if it reaches 60 minutes it cycles back to 1m so posts are always fresh
  const getPostDisplayTime = (post: CommunityPost) => {
    if (post.isSeed) {
      const elapsedMins = Math.floor((currentTime - mountTime) / 60000);
      const baseMins = post.minutesAgo || 1;
      const cycledMins = ((baseMins + elapsedMins - 1) % 59) + 1;
      return `${cycledMins}m ago`;
    }

    try {
      const diffMs = currentTime - new Date(post.createdAt).getTime();
      const diffMins = Math.max(1, Math.floor(diffMs / 60000));
      if (diffMins < 60) return `${diffMins}m ago`;
      const hours = Math.floor(diffMins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return '1m ago';
    }
  };

  // Filter & Search states
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 25;

  // New post form state
  const [postContent, setPostContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#Investment']);
  const [selectedCountry, setSelectedCountry] = useState(QUICK_COUNTRIES[0]);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Auth requirement modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<'react' | 'post'>('react');

  // API Queries & Mutations
  const { data: responseData, isLoading, isFetching } = useGetCommunityPostsQuery({
    page,
    limit,
    tag: selectedTag === 'All' ? undefined : selectedTag,
    search: searchQuery ? searchQuery.trim() : undefined,
  });

  const [createPost] = useCreateCommunityPostMutation();
  const [reactToPost] = useReactToPostMutation();

  // Optimistic local reaction tracking
  const [localReactions, setLocalReactions] = useState<{
    [postId: string]: { userReaction?: string | null; reactionsCount: number };
  }>({});

  const attributes = responseData?.data?.attributes || {};
  const posts: CommunityPost[] = attributes.results || [];
  const totalResults: number = attributes.totalResults || 0;
  const totalPages: number = attributes.totalPages || 1;

  // Handle Tag pill click for creating post
  const togglePostTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Submit new post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthModalReason('post');
      setAuthModalOpen(true);
      return;
    }

    if (!postContent.trim()) return;

    setIsSubmittingPost(true);
    try {
      await createPost({
        content: postContent.trim(),
        tags: selectedTags,
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
        countryFlag: selectedCountry.flag,
      }).unwrap();

      setPostContent('');
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to submit post');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Handle React / Like
  const handleReactionClick = async (postId: string, type: 'like' | 'love' | 'fire' | 'rocket' | 'clap') => {
    if (!isAuthenticated) {
      setAuthModalReason('react');
      setAuthModalOpen(true);
      return;
    }

    const currentPost = posts.find((p) => p.id === postId);
    const existingReaction = localReactions[postId]?.userReaction ?? currentPost?.userReaction;
    const isTogglingOff = existingReaction === type;
    const nextReaction = isTogglingOff ? null : type;
    const currentCount = localReactions[postId]?.reactionsCount ?? (currentPost?.reactionsCount || 0);
    const nextCount = isTogglingOff ? Math.max(0, currentCount - 1) : existingReaction ? currentCount : currentCount + 1;

    // Optimistic UI update
    setLocalReactions((prev) => ({
      ...prev,
      [postId]: {
        userReaction: nextReaction,
        reactionsCount: nextCount,
      },
    }));

    try {
      await reactToPost({ postId, type }).unwrap();
    } catch (err) {
      // Revert on error
      setLocalReactions((prev) => ({
        ...prev,
        [postId]: {
          userReaction: existingReaction,
          reactionsCount: currentCount,
        },
      }));
    }
  };

  return (
    <div className="relative min-h-screen bg-[#12151c] text-white">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        {/* —— Hero Header —— */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-cyan-500/30 rounded-full px-4 py-1.5 shadow-lg shadow-cyan-500/10">
            <Sparkles className="text-cyan-400 w-4 h-4" />
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-cyan-300">
              Live Investor Feed • 1,000+ Active Posts
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Global Trader{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500">
              Community
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Real-time milestone discussions, daily profit updates, live trading session inquiries, and deposit support across 80+ countries.
          </p>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <span>Worldwide Members (USA, India, GCC, Asia)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Cached with Redis for Instant Speed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Public Viewing Free for All</span>
            </div>
          </div>
        </div>

        {/* —— Create Post Box / Guest Callout —— */}
        <div className="bg-[#1b202c]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-sm">
          {isAuthenticated ? (
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 border border-cyan-400/40">
                  {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={3}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share your profit update, ask about running live sessions, or share deposit experience..."
                    className="w-full bg-[#12151c] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none"
                    maxLength={3000}
                  />

                  {/* Tags and Country bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    {/* Tag quick toggles */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-slate-500 font-medium mr-1">Tags:</span>
                      {['#Profit', '#Investment', '#LiveSession', '#India', '#Bangladesh'].map((tag) => {
                        const active = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => togglePostTag(tag)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                              active
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>

                    {/* Country Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Flag:</span>
                      <select
                        value={selectedCountry.code}
                        onChange={(e) => {
                          const found = QUICK_COUNTRIES.find((c) => c.code === e.target.value);
                          if (found) setSelectedCountry(found);
                        }}
                        className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500"
                      >
                        {QUICK_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-500">
                  {postContent.length}/3000 characters
                </span>
                <button
                  type="submit"
                  disabled={isSubmittingPost || !postContent.trim()}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-lg shadow-cyan-500/25 transition-all"
                >
                  {isSubmittingPost ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post to Community
                    </>
                  )}
                </button>
              </div>

              {postSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Your post is published and visible on the live feed!</span>
                </div>
              )}
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 text-center sm:text-left">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  Join the Bynex Global Conversation
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Anyone can read posts freely. Log in or create an account to share profit achievements, ask live trading questions, and react with emojis.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-700 hover:border-slate-500 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800/80 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/25 hover:scale-105 transition-transform"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* —— Filter Category Pills & Search Bar —— */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {PRESET_TAGS.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag);
                    setPage(1);
                  }}
                  className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all border font-medium ${
                    active
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-[#1b202c] text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search posts, users, or country..."
              className="w-full bg-[#1b202c] border border-slate-800 rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-sm font-medium">Loading community feed from Redis...</p>
          </div>
        )}

        {/* —— Community Post Cards Feed —— */}
        <div className="space-y-4">
          {!isLoading && posts.length === 0 && (
            <div className="bg-[#1b202c] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-white">No community posts found</p>
              <p className="text-sm">Try selecting a different filter or clearing your search term.</p>
            </div>
          )}

          {posts.map((post) => {
            const userReaction = localReactions[post.id]?.userReaction ?? post.userReaction;
            const totalReactions = localReactions[post.id]?.reactionsCount ?? post.reactionsCount;

            return (
              <article
                key={post.id}
                className="bg-[#1b202c] border border-slate-800/90 rounded-2xl p-5 sm:p-6 hover:border-slate-700/80 transition-all shadow-xl"
              >
                {/* Author row */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}`}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover bg-slate-800 border border-slate-700"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm sm:text-base">
                          {post.author.name}
                        </span>
                        {!post.isSeed && (
                          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                            Verified Investor
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <span>{post.author.countryFlag || '🌐'}</span>
                          <span>{post.author.country}</span>
                        </span>
                        <span>•</span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {getPostDisplayTime(post)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Relative Badge */}
                  <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Active
                  </span>
                </div>

                {/* Content body */}
                <div className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words py-1">
                  {post.content}
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 my-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => {
                          setSelectedTag(tag);
                          setPage(1);
                        }}
                        className="text-xs text-cyan-400/90 hover:text-cyan-300 font-mono cursor-pointer hover:underline"
                      >
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}

                {/* Reactions and Likes Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {REACTION_CONFIG.map(({ type, emoji, label, activeColor }) => {
                      const isSelected = userReaction === type;
                      const count = (post.reactions?.[type] || 0) + (isSelected ? 1 : 0);

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleReactionClick(post.id, type)}
                          title={isAuthenticated ? `React ${label}` : 'Log in to react'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            isSelected
                              ? activeColor
                              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <span className="text-sm leading-none">{emoji}</span>
                          {count > 0 && <span>{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>{totalReactions} total reactions</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* —— Pagination / Load More —— */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-xs font-mono text-slate-400">
              Page {page} of {totalPages} ({totalResults.toLocaleString()} posts)
            </span>
            <button
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* —— Login Required Modal —— */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1b202c] border border-slate-700 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-white">Authentication Required</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {authModalReason === 'react'
                  ? 'Please log in to like and react to posts in the Bynex Markets community.'
                  : 'Please log in to publish posts and interact with global investors.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In Now
              </Link>
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full border border-slate-700 text-slate-300 hover:text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

