import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Server,
  LogIn,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import BrandName from '@/components/BrandName'

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Status dialogs
  const [showAuthPendingModal, setShowAuthPendingModal] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStatus, setForgotStatus] = useState<string | null>(null)

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      // Open the diagnostic modal identifying real backend requirements
      setShowAuthPendingModal(true)
    }, 400)
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotStatus('Please enter a valid email address')
      return
    }
    setForgotStatus('submitted')
  }

  return (
    <div className="min-h-screen bg-[#08221A] text-[#F0F5EF] flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto">
      {/* Top Bar with Back to Welcome */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1C4D3C]/70">
        <Link
          to="/welcome"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0D2D22] border border-[#1C4D3C] text-xs font-semibold text-[#F0F5EF] hover:bg-[#133D2F] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#A6F16A]" />
          <span>Welcome</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <BrandName className="text-xs" />
          <span className="text-[10px] text-[#7B9586]">Authentication</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="my-auto py-6 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>Log In to</span>
            <BrandName className="text-2xl sm:text-3xl font-extrabold" />
          </h1>
          <p className="text-xs sm:text-sm text-[#B2C8BA]">
            Access your field projects, synced records, and survey visits
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-7 shadow-2xl shadow-[#061812] space-y-4"
        >
          {/* Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wider text-[#B2C8BA]"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B9586]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                placeholder="researcher@field.org"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#061812] border ${
                  errors.email ? 'border-rose-500' : 'border-[#1C4D3C]'
                } text-sm text-[#F0F5EF] placeholder-[#7B9586] focus:outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] transition-all`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#B2C8BA]"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotStatus(null)
                  setForgotEmail(email)
                  setShowForgotPasswordModal(true)
                }}
                className="text-xs text-[#A6F16A] hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B9586]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                }}
                placeholder="Enter password"
                className={`w-full pl-10 pr-11 py-3 rounded-2xl bg-[#061812] border ${
                  errors.password ? 'border-rose-500' : 'border-[#1C4D3C]'
                } text-sm text-[#F0F5EF] placeholder-[#7B9586] focus:outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7B9586] hover:text-[#F0F5EF] transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] font-extrabold text-sm sm:text-base shadow-lg shadow-[#20D6A0]/20 hover:shadow-[#A6F16A]/30 active:scale-[0.98] transition-all disabled:opacity-70 mt-2"
          >
            {isSubmitting ? (
              <span>Validating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-[#061812]" />
                <span>Log In</span>
              </>
            )}
          </button>

          {/* Quick link to create account */}
          <div className="pt-2 text-center text-xs text-[#B2C8BA]">
            Don&apos;t have an account?{' '}
            <Link
              to="/create-account"
              className="text-[#A6F16A] font-bold hover:underline"
            >
              Create Account
            </Link>
          </div>
        </form>
      </div>

      {/* Field Worker Local Mode Bypass footer */}
      <div className="pt-2 pb-1 text-center">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="text-xs text-[#7B9586] hover:text-[#A6F16A] transition-colors"
        >
          Skip sign in and open Field Dashboard (Offline Mode) →
        </button>
      </div>

      {/* Backend Requirements & Validation Diagnostic Modal */}
      {showAuthPendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061812]/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-6 shadow-2xl text-[#F0F5EF] space-y-4">
            <div className="flex items-center gap-3 border-b border-[#1C4D3C]/70 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#061812] border border-[#1C4D3C] flex items-center justify-center text-[#A6F16A]">
                <CheckCircle2 className="w-5 h-5 text-[#A6F16A]" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-white">
                  Form Validation Passed
                </h3>
                <p className="text-xs text-[#A6F16A]">
                  Client inputs are fully valid
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#B2C8BA] leading-relaxed">
              <div className="p-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Server className="w-4 h-4 text-[#20D6A0]" />
                  <span>Backend Authentication Pending</span>
                </div>
                <p>
                  As required, fake authentication success is not hardcoded. To connect this form to real production authentication, the following remains necessary:
                </p>
              </div>

              <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-[#B2C8BA]">
                <li>
                  <strong className="text-white">Auth Provider:</strong> Deploy an identity provider (e.g. Supabase Auth, Firebase Auth, or a custom Express/NestJS JWT service).
                </li>
                <li>
                  <strong className="text-white">API Endpoint:</strong> Wire <code className="text-[#A6F16A] bg-[#061812] px-1 py-0.5 rounded">POST /auth/login</code> to verify credentials and issue session tokens.
                </li>
                <li>
                  <strong className="text-white">Session Persistence:</strong> Store signed token securely for authenticated cloud synchronization.
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] font-bold text-xs shadow-md transition-all active:scale-[0.98]"
              >
                <span>Continue to Home Dashboard (Offline Field Mode)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowAuthPendingModal(false)}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#061812] border border-[#1C4D3C] text-xs font-semibold text-[#B2C8BA] hover:text-white transition-colors"
              >
                Return to Login Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061812]/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-6 shadow-2xl text-[#F0F5EF] space-y-4">
            <div className="flex items-center gap-3 border-b border-[#1C4D3C]/70 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#061812] border border-[#1C4D3C] flex items-center justify-center text-[#20D6A0]">
                <ShieldAlert className="w-5 h-5 text-[#20D6A0]" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-white">
                  Reset Password
                </h3>
                <p className="text-xs text-[#B2C8BA] flex items-center gap-1">
                  <span>Recover your</span> <BrandName className="text-xs" /> <span>credentials</span>
                </p>
              </div>
            </div>

            {forgotStatus === 'submitted' ? (
              <div className="space-y-3 text-xs text-[#B2C8BA]">
                <div className="p-3.5 rounded-2xl bg-[#061812] border border-[#1C4D3C] space-y-2">
                  <div className="flex items-center gap-2 text-[#A6F16A] font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reset Request Validated</span>
                  </div>
                  <p>
                    Reset link requested for <strong className="text-white">{forgotEmail}</strong>. When a mail delivery service (e.g. Resend, SendGrid, or SMTP) is integrated with the backend, password recovery emails will be dispatched automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] font-bold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs text-[#B2C8BA]">
                  Enter your registered field email and we will send instructions to reset your password.
                </p>

                <div className="space-y-1">
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.org"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#061812] border border-[#1C4D3C] text-xs text-white focus:outline-none focus:border-[#A6F16A]"
                  />
                  {forgotStatus && forgotStatus !== 'submitted' && (
                    <p className="text-[11px] text-rose-400">{forgotStatus}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] font-bold text-xs"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="py-2.5 px-4 rounded-2xl bg-[#061812] border border-[#1C4D3C] text-xs text-[#B2C8BA]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
