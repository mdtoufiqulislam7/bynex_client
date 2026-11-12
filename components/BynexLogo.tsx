'use client'

import React from 'react'

interface BynexLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function BynexLogo({ size = 'md', showText = true, className = '' }: BynexLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes[size]} shrink-0`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bynexGoldGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE14D" />
            <stop offset="50%" stopColor="#F5B700" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Left small diamond */}
        <path d="M10 32L15.5 26.5L21 32L15.5 37.5L10 32Z" fill="url(#bynexGoldGrad)" />
        {/* Right small diamond */}
        <path d="M43 32L48.5 26.5L54 32L48.5 37.5L43 32Z" fill="url(#bynexGoldGrad)" />
        {/* Outer top/right/bottom geometric B-diamond frame */}
        <path
          d="M32 6L46 20L40.5 25.5L32 17L23.5 25.5L18 20L32 6Z"
          fill="url(#bynexGoldGrad)"
        />
        <path
          d="M32 58L18 44L23.5 38.5L32 47L40.5 38.5L46 44L32 58Z"
          fill="url(#bynexGoldGrad)"
        />
        {/* Inner B-core diamond */}
        <path
          d="M32 21L41.5 30.5L38 34L41.5 37.5L32 47L24 39L28.5 34.5L32 38L35 35L31.5 31.5L27 36L22.5 31.5L32 21Z"
          fill="url(#bynexGoldGrad)"
        />
      </svg>

      {showText && (
        <span className={`${textSizes[size]} font-bold tracking-tight leading-none`}>
          <span className="text-white">Bynex </span>
          <span className="text-amber-400">Markets</span>
        </span>
      )}
    </div>
  )
}

