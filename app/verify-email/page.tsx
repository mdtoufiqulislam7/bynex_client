'use client'

import { useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react'
import { useVerifyEmailMutation, useResendVerificationEmailMutation } from '@/store/api/authApi'
import { Toast, ToastType } from '@/components/Toast'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') || ''

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation()
  const [resendVerificationEmail, { isLoading: isResending }] = useResendVerificationEmailMutation()

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [status, setStatus] = useState<'input' | 'success' | 'error'>('input')
  const [errorMessage, setErrorMessage] = useState('')
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 0) return

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)

    // Focus the next empty input or the last one
    const focusIndex = Math.min(pastedData.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')

    if (code.length !== 6) {
      setToast({ message: 'Please enter the complete 6-digit code', type: 'error' })
      return
    }

    if (!email) {
      setToast({ message: 'Email address is missing. Please register again.', type: 'error' })
      return
    }

    try {
      await verifyEmail({ email, code }).unwrap()
      setStatus('success')
      setToast({ message: 'Email verified successfully! Redirecting to login...', type: 'success' })
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      const errorMsg = error?.data?.message || 'Verification failed. Please check your code and try again.'
      setStatus('error')
      setErrorMessage(errorMsg)
      setToast({ message: errorMsg, type: 'error' })
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      setToast({ message: 'Email address is missing.', type: 'error' })
      return
    }

    try {
      await resendVerificationEmail({ email }).unwrap()
      setToast({ message: 'Verification code sent! Check your inbox.', type: 'success' })
      // Reset to input state if was in error
      if (status === 'error') {
        setStatus('input')
        setOtp(['', '', '', '', '', ''])
        setErrorMessage('')
      }
    } catch (error: any) {
      const errorMsg = error?.data?.message || 'Failed to resend verification code.'
      setToast({ message: errorMsg, type: 'error' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0D0D0D] to-[#050505] flex items-center justify-center p-4">
      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="max-w-md w-full bg-[#0D0D0D]/50 backdrop-blur-lg border border-neutral-800 rounded-2xl p-5 sm:p-8">

        {status === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-emerald-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Email Verified!</h2>
            <p className="text-neutral-400 mb-6">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-neutral-300">Redirecting to login page...</p>
            </div>
            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold px-8 py-3 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="text-amber-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Verify Your Email</h2>
              <p className="text-neutral-400 text-sm">
                We&apos;ve sent a 6-digit verification code to
              </p>
              {email && (
                <p className="text-amber-400 font-medium mt-1">{email}</p>
              )}
            </div>

            {/* OTP Form */}
            <form onSubmit={handleVerify}>
              <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-lg border bg-[#050505]/50 text-white focus:outline-none focus:ring-2 transition-all ${
                      status === 'error'
                        ? 'border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500'
                        : 'border-neutral-800 focus:ring-amber-500/50 focus:border-amber-500'
                    }`}
                  />
                ))}
              </div>

              {/* Error message */}
              {status === 'error' && errorMessage && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 mb-6">
                  <XCircle size={16} className="text-rose-500 flex-shrink-0" />
                  <p className="text-rose-400 text-sm">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold py-3 px-4 rounded-lg shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>

            {/* Resend & Back */}
            <div className="mt-6 text-center space-y-4">
              <p className="text-neutral-500 text-sm">
                Didn&apos;t receive the code?{' '}
                <button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="text-amber-400 font-semibold hover:text-amber-300 hover:underline disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </button>
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-neutral-500 text-sm hover:text-neutral-300 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Register
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0D0D0D] to-[#050505] flex items-center justify-center">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center animate-pulse">
          <Loader2 className="text-amber-400 animate-spin" size={32} />
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
