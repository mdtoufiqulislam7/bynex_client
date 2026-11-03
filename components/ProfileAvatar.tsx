'use client'

import React from 'react';

interface ProfileAvatarProps {
  /** Full URL of the user's profile photo */
  src: string | null | undefined;
  /** Full URL of the rank frame PNG (transparent center) */
  frameSrc: string | null | undefined;
  /** Fallback initials shown when no image exists */
  initials: string;
  /**
   * Size preset:
   *  - xs  → 32 × 32  (navbar mobile)
   *  - sm  → 40 × 40  (navbar desktop)
   *  - md  → 56 × 56  (sidebar / compact cards)
   *  - lg  → 80 × 80  (profile page mobile)
   *  - xl  → 96 × 96  (profile page desktop)
   *
   * Or pass a plain Tailwind size string e.g. "w-14 h-14"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
  alt?: string;
  className?: string;
}

const SIZE_CLASSES: Record<string, string> = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24',
};

/**
 * Renders a circular profile photo with an optional rank-frame PNG overlaid on top.
 *
 * Layer order (bottom → top):
 *   1. Initials fallback  (z-10)
 *   2. Profile photo      (z-10, rounded-full, object-cover)
 *   3. Rank frame PNG     (z-20, absolute inset-0, pointer-events-none)
 *
 * The frame PNG must have a transparent circular cutout in the centre so the
 * photo shows through. It is rendered at exactly the same width/height as the
 * container so the decorative border sits perfectly over the photo edge.
 */
export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  src,
  frameSrc,
  initials,
  size = 'sm',
  alt = 'Profile',
  className = '',
}) => {
  const sizeClass = SIZE_CLASSES[size] ?? size;

  return (
    <div className={`relative flex-shrink-0 ${sizeClass} ${className}`}>
      {/* ── Layer 1 & 2 : photo or initials fallback ── */}
      {src ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full rounded-full object-cover z-10"
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center font-bold z-10 select-none shadow-md shadow-cyan-500/20"
          style={{ fontSize: '35%' }}
        >
          {initials}
        </div>
      )}

      {/* ── Layer 3 : rank frame PNG on top ── */}
      {frameSrc && (
        <img
          src={frameSrc}
          alt="rank frame"
          className="absolute inset-0 w-full h-full z-20 pointer-events-none"
          style={{ objectFit: 'cover' }}
        />
      )}
    </div>
  );
};

export default ProfileAvatar;
