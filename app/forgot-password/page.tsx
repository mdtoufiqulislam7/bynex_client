'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { useForgotPasswordMutation } from '@/store/api/authApi'
import { Toast, ToastType } from '@/components/Toast'

export default function ForgotPassword() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const [email, setEmail] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await forgotPassword({ email }).unwrap()
      setIsSuccess(true)
      setToast({
        message: 'Password reset link sent successfully!',
        type: 'success'
      })
    } catch (error: any) {
      const errorMsg = error.data?.message || 'Failed to send reset link. Please try again.'
      setToast({
        message: errorMsg,
        type: 'error'
      })
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
          <p className="text-slate-400 mb-6">
            We've sent a password reset link to <span className="text-cyan-400 font-medium">{email}</span>.
            Please check your inbox and follow the instructions.
          </p>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-slate-300 mb-2 font-medium">Didn't receive the email?</p>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>Check your spam/junk folder</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>Verify the email address is correct</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>Wait a few minutes and try again</span>
              </li>
            </ul>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold">
              <span className="text-white">Pip</span>
              <span className="text-cyan-400">guardian</span>
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
          <p className="text-slate-400">No worries, we'll send you reset instructions.</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-2xl p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Remember your password?{' '}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
