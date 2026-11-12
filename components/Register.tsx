'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, Users } from 'lucide-react';
import { Toast, ToastType } from '@/components/Toast';
import { BynexLogo } from './BynexLogo';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [referralCode, setReferralCode] = useState(refCode);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [refCode]);

  const handleGoogleSignUp = () => {
    setLoading(true);
    let url = '/api/v1/auth/google?redirect=true&source=website';
    if (referralCode.trim()) {
      url += `&referralCode=${encodeURIComponent(referralCode.trim())}`;
    }
    const redirect = searchParams.get('redirect');
    if (redirect) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('post_login_redirect', redirect);
      }
      url += `&postLoginRedirect=${encodeURIComponent(redirect)}`;
    }
    window.location.href = url;
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#050505] px-4 py-12">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Dynamic Background with Gold Accents */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-2xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4 group">
            <BynexLogo size="lg" className="group-hover:scale-105 transition-transform" />
          </Link>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Your Account</h2>
          <p className="text-neutral-400 text-sm mt-2">
            Join the premier institutional digital asset platform.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0D0D0D]/90 backdrop-blur-xl border border-amber-500/20 p-6 sm:p-8 rounded-3xl shadow-2xl">
          <div className="space-y-6">
            {/* Referral Code Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400/70">
                  <Users className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter referral code"
                  className="w-full pl-10 pr-4 py-3 bg-[#050505]/80 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              {refCode && (
                <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                  ✓ Referral code applied from invitation link
                </p>
              )}
            </div>

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full relative flex items-center justify-center gap-3.5 px-6 py-4 rounded-2xl font-bold text-sm sm:text-base text-black bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                  <span>Redirecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
                  <span>Sign Up with Google</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-black/70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center">
            <p className="text-sm text-neutral-400">
              Already have an account?{' '}
              <Link href="/login" className="text-amber-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
