'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useResetPasswordMutation } from '@/store/api/authApi'
import { Toast, ToastType } from '@/components/Toast'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  useEffect(() => {
    if (!token) {
      setToast({
        message: 'Invalid or missing reset token. Please request a new password reset link.',
        type: 'error'
      })
    }
  }, [token])

  const validatePassword = (password: string) => {
    const errors: string[] = []
    if (password.length < 8) errors.push('At least 8 characters')
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
    if (!/[0-9]/.test(password)) errors.push('One number')
    return errors
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'password') {
      setValidationErrors(validatePassword(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setToast({
        message: 'Invalid reset token',
        type: 'error'
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({
        message: 'Passwords do not match',
        type: 'error'
      })
      return
    }

    if (validationErrors.length > 0) {
      setToast({
        message: 'Please meet all password requirements',
        type: 'error'
      })
      return
    }

    try {
      await resetPassword({
        token,
        newPassword: formData.password,
      }).unwrap()

      setIsSuccess(true)
      setToast({
        message: 'Password reset successful! Redirecting to login...',
        type: 'success'
      })
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      const errorMsg = error.data?.message || 'Failed to reset password. The link may have expired.'
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
          <h2 className="text-2xl font-bold text-white mb-3">Password Reset Successful!</h2>
          <p className="text-slate-400 mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-300">Redirecting to login page in 3 seconds...</p>
          </div>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            Go to Login Now
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
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-slate-400">Choose a strong password for your account</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-2xl p-5 sm:p-8">
          {!token ? (
            <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-rose-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-rose-400 text-sm mb-2">Invalid or missing reset token. Please request a new password reset link.</p>
                  <Link
                    href="/forgot-password"
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                  >
                    Request new reset link →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-12 pr-12 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-slate-400 font-medium">Password must contain:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['At least 8 characters', 'One uppercase letter', 'One lowercase letter', 'One number'].map((req, idx) => {
                        const isValid = !validationErrors.includes(req)
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${isValid ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                            <span className={`text-xs ${isValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {req}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-12 pr-12 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || validationErrors.length > 0 || formData.password !== formData.confirmPassword}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center animate-pulse">
          <Loader2 className="text-cyan-400 animate-spin" size={32} />
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
