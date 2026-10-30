import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
} from 'lucide-react'
import { apiRegister } from '@/lib/profileService'

export default function CreateAccountPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
    acceptTerms?: string
  }>({})

  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: {
      fullName?: string
      email?: string
      password?: string
      confirmPassword?: string
      acceptTerms?: string
    } = {}

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required (minimum 2 characters)'
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password'
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = 'You must accept the ethical data terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await apiRegister(fullName, email, password)
      navigate('/home')
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please check backend connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08221A] text-[#F0F5EF] flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto">
      {/* Top Header with Back Arrow */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#1C4D3C]/70 flex-shrink-0">
        <Link
          to="/welcome"
          aria-label="Back"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0D2D22] border border-[#1C4D3C] text-[#F0F5EF] hover:bg-[#133D2F] hover:border-[#A6F16A]/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#A6F16A]" />
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="my-auto py-4 space-y-5">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-[#B2C8BA]">
            Join grassroots biodiversity researchers and ward surveyors
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-7 shadow-2xl shadow-[#061812] space-y-4"
        >
          {serverError && (
            <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{serverError}</span>
            </div>
          )}
          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="reg-name"
              className="block text-xs font-semibold uppercase tracking-wider text-[#B2C8BA]"
            >
              Full Name / Field Alias
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B9586]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="reg-name"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }))
                }}
                placeholder="Dr. Ananya Nair / Field Volunteer"
                className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-[#061812] border ${
                  errors.fullName ? 'border-rose-500' : 'border-[#1C4D3C]'
                } text-sm text-[#F0F5EF] placeholder-[#7B9586] focus:outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] transition-all`}
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="reg-email"
              className="block text-xs font-semibold uppercase tracking-wider text-[#B2C8BA]"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B9586]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                placeholder="researcher@field.org"
                className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-[#061812] border ${
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

          {/* Password & Confirm Password in 2-column or stacked */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="reg-pass"
                className="block text-xs font-semibold uppercase tracking-wider text-[#B2C8BA]"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B9586]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-pass"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  placeholder="Min 6 chars"
                  className={`w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl bg-[#061812] border ${
                    errors.password ? 'border-rose-500' : 'border-[#1C4D3C]'
                  } text-sm text-[#F0F5EF] placeholder-[#7B9586] focus:outline-none focus:border-[#A6F16A] transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7B9586] hover:text-[#F0F5EF]"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="reg-confirm-pass"
                className="block text-xs font-semibold uppercase tracking-wider text-[#B2C8BA]"
              >
                Confirm
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B9586]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm-pass"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }}
                  placeholder="Re-type password"
                  className={`w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl bg-[#061812] border ${
                    errors.confirmPassword ? 'border-rose-500' : 'border-[#1C4D3C]'
                  } text-sm text-[#F0F5EF] placeholder-[#7B9586] focus:outline-none focus:border-[#A6F16A] transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7B9586] hover:text-[#F0F5EF]"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          </div>

          {/* Terms and Ethical Fieldwork Agreement */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked)
                  if (errors.acceptTerms)
                    setErrors((prev) => ({ ...prev, acceptTerms: undefined }))
                }}
                className="mt-0.5 h-4 w-4 rounded-md border-[#1C4D3C] bg-[#061812] text-[#A6F16A] focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-xs text-[#B2C8BA] leading-tight">
                I agree to the{' '}
                <Link to="/privacy" className="text-[#A6F16A] underline font-medium">
                  Ethical Field Data Policy
                </Link>{' '}
                and confirm that habitat sensitive location data will be handled responsibly.
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 pl-6">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.acceptTerms}</span>
              </p>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] font-extrabold text-sm sm:text-base shadow-lg shadow-[#20D6A0]/20 hover:shadow-[#A6F16A]/30 active:scale-[0.98] transition-all disabled:opacity-70 mt-2"
          >
            {isSubmitting ? (
              <span>Validating Account...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-[#061812]" />
                <span>Create Account</span>
              </>
            )}
          </button>

          {/* Link to Login */}
          <div className="pt-1 text-center text-xs text-[#B2C8BA]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#20D6A0] font-bold hover:underline">
              Log In
            </Link>
          </div>
        </form>
      </div>

      {/* Offline Mode Bypass */}
      <div className="pt-2 pb-1 text-center">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="text-xs text-[#7B9586] hover:text-[#A6F16A] transition-colors"
        >
          Skip sign in and open Field Dashboard (Offline Mode) →
        </button>
      </div>
    </div>
  )
}
