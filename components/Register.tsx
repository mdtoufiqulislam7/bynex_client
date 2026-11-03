'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, ArrowRight, Loader2, Users } from 'lucide-react';
import { Toast, ToastType } from '@/components/Toast';

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
    window.location.href = url;
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Dynamic Background with Modern Cyan/Emerald Accents */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2.5 mb-4 group">
            <div className="bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-6 w-6 text-slate-950 font-black" />
            </div>
            <span className="text-2xl font-serif font-bold text-white tracking-wide">
              Bynex <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Markets</span>
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Your Account</h2>
          <p className="text-slate-400 text-sm mt-2">
            Join the premier institutional digital asset platform.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl">
          <div className="space-y-6">
            {/* Referral Code Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Users className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter referral code"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
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
              className="w-full relative flex items-center justify-center gap-3.5 px-6 py-4 rounded-2xl font-semibold text-sm sm:text-base text-slate-950 bg-white hover:bg-slate-100 shadow-xl shadow-white/5 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
                  <span>Redirecting to Google...</span>
                </>
              ) : (
                <>
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
                  <span>Sign Up with Google</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-400 font-semibold hover:underline">
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
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
