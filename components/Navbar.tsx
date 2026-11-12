'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LayoutDashboard, LogOut, Download } from 'lucide-react';
import { BynexLogo } from './BynexLogo';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { clearAuth } from '../store/slices/authSlice';
import { useLogoutMutation } from '../store/api/authApi';
import { useGetMyRankQuery } from '../store/api/rankApi';
import { resolveImageUrl } from '@/lib/imageUrl';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const [logout] = useLogoutMutation();
  const { data: rankData } = useGetMyRankQuery(undefined, { skip: !isAuthenticated });
  const rankName = rankData?.data?.attributes?.currentRankInfo?.name || 'Starter';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    // Capture install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setInstallPrompt(null);
    setMobileMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHome = pathname === '/';
  const getLink = (id: string) => isHome ? `#${id}` : `/#${id}`;

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await logout({ refreshToken }).unwrap();
    } catch {}
    dispatch(clearAuth());
    router.push('/');
  };

  const resolvedAvatar = resolveImageUrl(user?.image);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [resolvedAvatar]);

  const avatarContent = resolvedAvatar && !avatarFailed
    ? <img src={resolvedAvatar} alt="Profile" onError={() => setAvatarFailed(true)} className="w-9 h-9 rounded-full object-cover border-2 border-amber-400/50" />
    : (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-bold text-sm border-2 border-amber-400/50">
        {user?.firstName?.[0]}{user?.lastName?.[0]}
      </div>
    );

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#050505]/95 backdrop-blur-md border-b border-amber-500/20 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <BynexLogo size="md" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-x-4 xl:gap-x-6">
            <a href={isHome ? "#" : "/"} className="text-neutral-300 hover:text-amber-400 transition-colors text-xs xl:text-sm font-medium uppercase tracking-wider whitespace-nowrap">Home</a>
            <a href={getLink('about')} className="text-neutral-300 hover:text-amber-400 transition-colors text-xs xl:text-sm font-medium uppercase tracking-wider whitespace-nowrap">About Us</a>
            <a href={getLink('plans')} className="text-neutral-300 hover:text-amber-400 transition-colors text-xs xl:text-sm font-medium uppercase tracking-wider whitespace-nowrap">Investment Plans</a>
            <a href={getLink('calculator')} className="text-neutral-300 hover:text-amber-400 transition-colors text-xs xl:text-sm font-medium uppercase tracking-wider whitespace-nowrap">Calculator</a>
            <Link href="/investing-info" className={`transition-colors text-xs xl:text-sm font-medium uppercase tracking-wider whitespace-nowrap ${pathname === '/investing-info' ? 'text-amber-400 font-semibold' : 'text-neutral-300 hover:text-amber-400'}`}>Investing Info</Link>
            <Link href="/community" className={`transition-colors text-xs xl:text-sm font-medium uppercase tracking-wider whitespace-nowrap ${pathname === '/community' ? 'text-amber-400 font-semibold' : 'text-neutral-300 hover:text-amber-400'}`}>Community</Link>
            <a href={getLink('contact')} className="text-neutral-300 hover:text-amber-400 transition-colors text-xs xl:text-sm font-medium uppercase tracking-wider whitespace-nowrap">Contact</a>
          </div>

          {/* Desktop Right — auth-aware */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 shrink-0 pl-2 xl:pl-4">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 focus:outline-none hover:opacity-90 transition-opacity"
                >
                  {avatarContent}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white leading-tight">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-amber-400 font-medium">{rankName}</p>
                  </div>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-44 bg-[#0D0D0D] border border-amber-500/20 rounded-xl shadow-2xl overflow-hidden z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-neutral-200 hover:bg-neutral-900 hover:text-amber-400 transition-colors"
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-400 hover:bg-neutral-900 transition-colors"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-amber-400 font-medium text-xs xl:text-sm whitespace-nowrap px-2 py-1 transition-colors">Login</Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black px-5 xl:px-6 py-2 xl:py-2.5 rounded-full font-bold text-xs xl:text-sm whitespace-nowrap transition-all hover:scale-105 shadow-lg shadow-amber-500/25 shrink-0"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-amber-400 hover:text-amber-300 transition-colors">
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#0A0A0A] border-b border-amber-500/20 p-4 flex flex-col space-y-4 shadow-2xl">
          <a href={isHome ? "#" : "/"} onClick={() => setMobileMenuOpen(false)} className="text-neutral-300 hover:text-amber-400 font-medium block">Home</a>
          <a href={getLink('about')} onClick={() => setMobileMenuOpen(false)} className="text-neutral-300 hover:text-amber-400 font-medium block">About Us</a>
          <a href={getLink('plans')} onClick={() => setMobileMenuOpen(false)} className="text-neutral-300 hover:text-amber-400 font-medium block">Investment Plans</a>
          <a href={getLink('calculator')} onClick={() => setMobileMenuOpen(false)} className="text-neutral-300 hover:text-amber-400 font-medium block">Calculator</a>
          <Link href="/investing-info" onClick={() => setMobileMenuOpen(false)} className={`font-medium block ${pathname === '/investing-info' ? 'text-amber-400' : 'text-neutral-300 hover:text-amber-400'}`}>Investing Info</Link>
          <Link href="/community" onClick={() => setMobileMenuOpen(false)} className={`font-medium block ${pathname === '/community' ? 'text-amber-400' : 'text-neutral-300 hover:text-amber-400'}`}>Community</Link>
          <a href={getLink('contact')} onClick={() => setMobileMenuOpen(false)} className="text-neutral-300 hover:text-amber-400 font-medium block">Contact</a>

          <div className="h-px bg-neutral-800 my-2"></div>

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-1">
                {avatarContent}
                <span className="text-white font-medium text-sm">{user?.firstName} {user?.lastName}</span>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-neutral-300 hover:text-amber-400 font-medium"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium text-left"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-amber-400 font-medium block">Login</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-6 py-3 rounded-xl font-bold text-center block shadow-lg shadow-amber-500/25">Get Started</Link>
            </>
          )}

          {/* Install App button — only shown when browser supports PWA install and not yet installed */}
          {!isInstalled && installPrompt && (
            <>
              <div className="h-px bg-neutral-800 my-2"></div>
              <button
                onClick={handleInstall}
                className="flex items-center gap-2.5 w-full px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-sm hover:bg-amber-500/20 transition-colors"
              >
                <Download size={16} />
                Add to Home Screen
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
