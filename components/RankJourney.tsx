'use client'

import React, { useState } from 'react';
import { Lock, Check, ChevronRight, Star } from 'lucide-react';
import type { RankDefinition } from '../store/api/rankApi';
import { resolveImageUrl } from '@/lib/imageUrl';

interface RankJourneyProps {
  currentRank: number;
  definitions: RankDefinition[];
  imageBase: string;
  /** Compact mode for dashboard / mobile widgets */
  compact?: boolean;
}

type RankState = 'completed' | 'active' | 'locked';

function getRankState(defLevel: number, currentRank: number): RankState {
  if (defLevel < currentRank) return 'completed';
  if (defLevel === currentRank) return 'active';
  return 'locked';
}

// ── Tooltip card shown on hover ───────────────────────────────────────────────
const RankTooltip = ({ def, imageBase }: { def: RankDefinition; imageBase: string }) => (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-52 pointer-events-none">
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-3 text-left">
      <div className="flex items-center gap-2 mb-2">
        <img
          src={resolveImageUrl(def.badgeImage) || `${imageBase}${def.badgeImage}`}
          alt={def.name}
          className="w-8 h-8 object-contain flex-shrink-0"
        />
        <div>
          <p className="text-xs font-bold text-white">{def.name}</p>
          <p className="text-[10px] text-neutral-400">Level {def.level}</p>
        </div>
      </div>
      <div className="space-y-1 text-[11px]">
        {def.target > 0 && (
          <div className="flex justify-between">
            <span className="text-neutral-400">Target</span>
            <span className="text-white font-medium">${def.target.toLocaleString()}</span>
          </div>
        )}
        {def.directReferrals > 0 && (
          <div className="flex justify-between">
            <span className="text-neutral-400">Direct refs</span>
            <span className="text-white font-medium">{def.directReferrals} users</span>
          </div>
        )}
        {def.personalInvestment > 0 && (
          <div className="flex justify-between">
            <span className="text-neutral-400">Personal invest</span>
            <span className="text-white font-medium">${def.personalInvestment.toLocaleString()}</span>
          </div>
        )}
        {def.monthlySalary > 0 && (
          <div className="flex justify-between">
            <span className="text-neutral-400">Monthly salary</span>
            <span className="text-amber-400 font-semibold">${def.monthlySalary}</span>
          </div>
        )}
        {def.bonus && (
          <div className="flex justify-between">
            <span className="text-neutral-400">Bonus</span>
            <span className="text-emerald-400 font-semibold">{def.bonus}</span>
          </div>
        )}
        {def.commissionRange && (
          <div className="flex justify-between">
            <span className="text-neutral-400">Commission</span>
            <span className="text-amber-400 font-semibold">
              {def.commissionRange.min}–{def.commissionRange.max}%
            </span>
          </div>
        )}
      </div>
    </div>
    {/* Tooltip arrow */}
    <div className="w-3 h-3 bg-neutral-900 border-r border-b border-neutral-800 rotate-45 mx-auto -mt-1.5" />
  </div>
);

// ── Single rank step node ─────────────────────────────────────────────────────
const RankNode = ({
  def,
  state,
  imageBase,
  compact,
}: {
  def: RankDefinition;
  state: RankState;
  imageBase: string;
  compact: boolean;
}) => {
  const [hovered, setHovered] = useState(false);

  const isActive = state === 'active';
  const isCompleted = state === 'completed';
  const isLocked = state === 'locked';

  // Outer ring classes
  const ringClass = isActive
    ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-neutral-950'
    : isCompleted
    ? 'ring-1 ring-emerald-500/50 ring-offset-1 ring-offset-neutral-950'
    : 'ring-1 ring-neutral-800 ring-offset-1 ring-offset-neutral-950';

  // Container bg
  const containerBg = isActive
    ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-500/40'
    : isCompleted
    ? 'bg-emerald-500/5 border-emerald-500/20'
    : 'bg-[#0D0D0D]/60 border-neutral-800';

  // Glow for active
  const glowClass = isActive ? 'shadow-lg shadow-amber-500/25' : '';

  const imgSize = compact ? 'w-9 h-9' : 'w-12 h-12';

  return (
    <div
      className="relative flex flex-col items-center group overflow-visible"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip */}
      {hovered && <RankTooltip def={def} imageBase={imageBase} />}

      {/* Badge circle */}
      <div
        className={`
          relative flex items-center justify-center rounded-full border transition-all duration-300
          ${compact ? 'w-14 h-14' : 'w-16 h-16 sm:w-20 sm:h-20'}
          ${containerBg} ${ringClass} ${glowClass}
          ${isLocked ? 'opacity-40' : ''}
          ${!isLocked ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
        `}
      >
        {/* Badge image */}
        <img
          src={resolveImageUrl(def.badgeImage) || `${imageBase}${def.badgeImage}`}
          alt={def.name}
          className={`${imgSize} object-contain`}
          style={{ opacity: isLocked ? 0.5 : 1 }}
        />

        {/* Status overlay icon */}
        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md shadow-emerald-500/40 ring-2 ring-neutral-950">
            <Check size={10} strokeWidth={3} className="text-white" />
          </div>
        )}
        {isActive && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-md shadow-amber-500/50 ring-2 ring-neutral-950">
            <Star size={10} className="text-white fill-white" />
          </div>
        )}
        {isLocked && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-neutral-800 rounded-full flex items-center justify-center ring-2 ring-neutral-950">
            <Lock size={9} className="text-neutral-400" />
          </div>
        )}

        {/* Active pulse ring */}
        {isActive && (
          <div className="absolute inset-0 rounded-full animate-ping bg-amber-500/20 pointer-events-none" />
        )}
      </div>

      {/* Label */}
      <div className={`mt-2 text-center ${isLocked ? 'opacity-40' : ''}`}>
        <p
          className={`font-semibold truncate max-w-[72px] ${
            compact ? 'text-[10px]' : 'text-xs'
          } ${
            isActive
              ? 'text-amber-400'
              : isCompleted
              ? 'text-emerald-400'
              : 'text-neutral-500'
          }`}
        >
          {def.name}
        </p>
        {!compact && def.monthlySalary > 0 && (
          <p className="text-[10px] text-neutral-600 mt-0.5">${def.monthlySalary}/mo</p>
        )}
      </div>
    </div>
  );
};

// ── Connector line between nodes ──────────────────────────────────────────────
const Connector = ({ left, right }: { left: RankState; right: RankState }) => {
  const isActive = left === 'completed' && right === 'active';
  const isCompleted = left === 'completed' && right === 'completed';
  const isDone = isCompleted || isActive;

  return (
    <div className="flex items-center flex-1 min-w-[12px] mt-[-20px]">
      {/* Left dot */}
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDone ? 'bg-amber-500' : 'bg-neutral-800'}`} />
      {/* Line */}
      <div className={`flex-1 h-px ${isDone ? 'bg-gradient-to-r from-amber-500 to-amber-500/60' : 'bg-neutral-900'}`} />
      {/* Arrow head */}
      <ChevronRight
        size={10}
        className={`flex-shrink-0 ${isDone ? 'text-amber-400' : 'text-neutral-700'}`}
      />
    </div>
  );
};

// ── Vertical connector (mobile) ───────────────────────────────────────────────
const VerticalConnector = ({ left, right }: { left: RankState; right: RankState }) => {
  const isDone = (left === 'completed' && right === 'completed') ||
                 (left === 'completed' && right === 'active');
  return (
    <div className="flex flex-col items-center w-6 flex-shrink-0 py-1">
      <div className={`flex-1 w-px ${isDone ? 'bg-gradient-to-b from-amber-500 to-amber-500/40' : 'bg-neutral-900'}`}
        style={{ minHeight: 24 }}
      />
    </div>
  );
};

// ── Main RankJourney component ────────────────────────────────────────────────
export const RankJourney: React.FC<RankJourneyProps> = ({
  currentRank,
  definitions,
  imageBase,
  compact = false,
}) => {
  const sorted = [...definitions].sort((a, b) => a.level - b.level);

  return (
    <div className={`bg-[#050505]/60 border border-neutral-800 rounded-xl ${compact ? 'p-3' : 'p-4 sm:p-6'}`}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white">Rank Journey</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Your path from Starter to Ambassador — hover any rank to see details
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-neutral-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Current
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-neutral-800 inline-block" /> Locked
            </span>
          </div>
        </div>
      )}

      {/* ── Desktop: horizontal row ─────────────────────────────────────── */}
      <div className="hidden sm:flex items-start gap-0 overflow-visible">
        {sorted.map((def, idx) => {
          const state = getRankState(def.level, currentRank);
          const nextDef = sorted[idx + 1];
          const nextState = nextDef ? getRankState(nextDef.level, currentRank) : null;

          return (
            <React.Fragment key={def.level}>
              <RankNode def={def} state={state} imageBase={imageBase} compact={compact} />
              {nextState !== null && (
                <Connector left={state} right={nextState} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Mobile: vertical list ───────────────────────────────────────── */}
      <div className="flex sm:hidden flex-col">
        {sorted.map((def, idx) => {
          const state = getRankState(def.level, currentRank);
          const nextDef = sorted[idx + 1];
          const nextState = nextDef ? getRankState(nextDef.level, currentRank) : null;

          return (
            <React.Fragment key={def.level}>
              {/* Row: connector dot + rank info */}
              <div className="flex items-center gap-3">
                {/* Left track */}
                <div className="flex flex-col items-center w-8 flex-shrink-0">
                  {/* Track dot */}
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      state === 'active'
                        ? 'bg-amber-500/20 border-amber-500/50 shadow-md shadow-amber-500/20'
                        : state === 'completed'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-[#0D0D0D] border-neutral-800'
                    } ${state === 'locked' ? 'opacity-40' : ''}`}
                  >
                    {state === 'completed' && <Check size={12} className="text-emerald-400" strokeWidth={3} />}
                    {state === 'active' && <Star size={12} className="text-amber-400 fill-amber-400" />}
                    {state === 'locked' && <Lock size={10} className="text-neutral-600" />}
                  </div>
                </div>

                {/* Right: badge + info row */}
                <div
                  className={`flex-1 flex items-center gap-3 py-3 ${
                    state === 'active'
                      ? 'bg-amber-500/5 border border-amber-500/20 rounded-xl px-3'
                      : ''
                  } ${state === 'locked' ? 'opacity-40' : ''}`}
                >
                  <img
                    src={resolveImageUrl(def.badgeImage) || `${imageBase}${def.badgeImage}`}
                    alt={def.name}
                    className="w-10 h-10 object-contain flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${
                      state === 'active' ? 'text-amber-400' : state === 'completed' ? 'text-emerald-400' : 'text-neutral-500'
                    }`}>
                      {def.name}
                    </p>
                    <div className="flex flex-wrap gap-x-3 mt-0.5">
                      {def.target > 0 && (
                        <span className="text-[10px] text-neutral-500">Target: ${def.target.toLocaleString()}</span>
                      )}
                      {def.monthlySalary > 0 && (
                        <span className="text-[10px] text-amber-400/80">${def.monthlySalary}/mo</span>
                      )}
                      {def.bonus && (
                        <span className="text-[10px] text-emerald-500/70">{def.bonus}</span>
                      )}
                    </div>
                  </div>
                  {state === 'active' && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                      YOU ARE HERE
                    </span>
                  )}
                </div>
              </div>

              {/* Vertical connector */}
              {nextState !== null && (
                <div className="flex items-stretch gap-3">
                  <VerticalConnector left={state} right={nextState} />
                  <div className="flex-1" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current rank callout (desktop) */}
      {!compact && (
        <div className="hidden sm:flex items-center justify-center mt-5 pt-4 border-t border-neutral-800">
          <p className="text-xs text-neutral-500">
            You are currently{' '}
            <span className="text-amber-400 font-semibold">
              {definitions.find((d) => d.level === currentRank)?.name || 'Starter'}
            </span>
            {currentRank < 7 && (
              <>
                {' '}— next goal is{' '}
                <span className="text-white font-semibold">
                  {definitions.find((d) => d.level === currentRank + 1)?.name}
                </span>
              </>
            )}
            {currentRank === 7 && (
              <span className="text-amber-400"> · Maximum rank achieved! 🎉</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default RankJourney;
