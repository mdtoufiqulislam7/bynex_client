'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';
import { Toast, ToastType } from '@/components/Toast';
import { Lock, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Check if returning from Google OAuth callback with tokens in URL
  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      setToast({
        message: decodeURIComponent(error),
        type: 'error',
      });
      return;
    }

    if (token) {
      setLoading(true);
      localStorage.setItem('accessToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Fetch user profile using the new token
      fetch('/api/v1/users/self/in', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const user = data.data?.attributes?.user || data.data?.user;
          let redirectTarget =
            searchParams.get('redirect') ||
            (typeof window !== 'undefined'
              ? sessionStorage.getItem('post_login_redirect')
              : null) ||
            '/dashboard';

          if (redirectTarget === '/live-trading' || redirectTarget === '/live-tradding') {
            redirectTarget = '/dashboard/live-trading';
          }

          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('post_login_redirect');
          }

          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            dispatch(setUser(user));

            if (user.role === 'admin' || user.role === 'superAdmin') {
              setToast({
                message: 'Admin account verified! Redirecting to Admin Control Room...',
                type: 'success',
              });
              setTimeout(() => {
                window.location.href = 'https://admin.bynex.tech';
              }, 1200);
            } else {
              setToast({
                message: `Welcome to Bynex Markets, ${user.firstName || user.fullName}!`,
                type: 'success',
              });
              setTimeout(() => {
                router.push(redirectTarget);
              }, 1000);
            }
          } else {
            router.push(redirectTarget);
          }
        })
        .catch(() => {
          let fallbackTarget =
            searchParams.get('redirect') ||
            (typeof window !== 'undefined'
              ? sessionStorage.getItem('post_login_redirect')
              : null) ||
            '/dashboard';
          if (fallbackTarget === '/live-trading' || fallbackTarget === '/live-tradding') {
            fallbackTarget = '/dashboard/live-trading';
          }
          router.push(fallbackTarget);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [searchParams, dispatch, router]);

  const handleGoogleLogin = () => {
    setLoading(true);
    // If there is a redirect query, persist it to sessionStorage
    const redirect = searchParams.get('redirect');
    if (redirect && typeof window !== 'undefined') {
      sessionStorage.setItem('post_login_redirect', redirect);
    }
    const redirectParam = redirect ? `&postLoginRedirect=${encodeURIComponent(redirect)}` : '';
    window.location.href = `/api/v1/auth/google?redirect=true&source=website${redirectParam}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2.5 mb-6 group">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-serif font-bold text-white tracking-wide">
              Bynex <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Markets</span>
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sign In to Your Account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Secure, passwordless authentication powered by Google.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-start space-x-3.5">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-0.5">Enterprise Security</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                To guarantee maximum security against credential compromise, accounts are protected exclusively by Google SSO.
              </p>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl shadow-white/5 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Connecting with Google...</span>
              </div>
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
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Footer details */}
          <div className="pt-2 text-center text-xs text-slate-500">
            By proceeding, you agree to Bynex Markets{' '}
            <Link href="/" className="text-cyan-400 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/" className="text-cyan-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center space-x-1"
          >
            <span>← Back to homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
