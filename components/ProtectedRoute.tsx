'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give Redux time to hydrate from localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only run checks after initial loading
    if (isLoading) return;

    // Check if user is not authenticated
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Check if user is admin (admins should not access user dashboard)
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      router.replace('/login');
      return;
    }
  }, [isAuthenticated, user, router, isLoading]);

  // Show loading during hydration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading if still checking auth
  if (!isAuthenticated || !user) {
    return null; // Return null while redirecting
  }

  // Check if user is admin
  if (user.role === 'admin' || user.role === 'superadmin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="bg-rose-500/10 border border-rose-500/50 rounded-xl p-6 mb-4">
            <h2 className="text-xl font-bold text-rose-400 mb-2">Access Denied</h2>
            <p className="text-slate-300">This portal is for users only. Please use the admin panel to access the admin dashboard.</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
