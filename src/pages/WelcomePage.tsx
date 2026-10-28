import { Link } from 'react-router-dom'
import {
  ArrowRight,
  UserCheck,
  LogIn,
  ShieldCheck,
} from 'lucide-react'
import BrandName from '@/components/BrandName'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#08221A] text-[#F0F5EF] flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto space-y-6">
      {/* Main Card with Nature Imagery & Content */}
      <div className="relative rounded-3xl overflow-hidden border border-[#1C4D3C] bg-[#0D2D22] shadow-2xl shadow-[#061812]/70">
        {/* Enhanced Visibility Image Banner */}
        <div className="h-56 sm:h-64 w-full relative overflow-hidden">
          <img
            src="/nature-welcome.jpg"
            alt="Forest Cup Fungi Microhabitat"
            className="w-full h-full object-cover object-center filter brightness-[1.05] contrast-[1.05] saturate-[1.1]"
          />
          {/* Subtle gradient overlay at the base only to blend smoothly into the card body */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2D22] via-[#0D2D22]/15 to-transparent pointer-events-none" />
        </div>

        {/* Content Section */}
        <div className="p-5 sm:p-6 -mt-4 relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="B-Liffe Logo"
              className="w-8 h-8 rounded-lg bg-[#061812] border border-[#1C4D3C] p-0.5 object-contain"
            />
            <BrandName className="text-sm font-bold tracking-wider" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Explore. Observe. Conserve.
          </h1>

          <p className="text-xs sm:text-sm text-[#B2C8BA] leading-relaxed">
            Welcome to <BrandName /> (Bharat Local Informatics for Flora, Fauna, and Ecosystems). An open, scientific field data collection platform designed for researchers, local naturalists, ward volunteers, and biodiversity committees.
          </p>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="space-y-3 pt-2">
        {/* Primary Action: Get Started */}
        <Link
          to="/create-account"
          className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] px-6 py-3.5 text-base font-extrabold shadow-lg shadow-[#20D6A0]/20 hover:shadow-[#A6F16A]/30 active:scale-[0.98] transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 text-[#061812]" />
        </Link>

        {/* Secondary Grid: Log In & Create Account */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#0D2D22] border border-[#1C4D3C] hover:border-[#A6F16A]/50 text-xs sm:text-sm font-bold text-white hover:bg-[#133D2F]/70 transition-all"
          >
            <LogIn className="w-4 h-4 text-[#A6F16A]" />
            <span>Log In</span>
          </Link>

          <Link
            to="/create-account"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#0D2D22] border border-[#1C4D3C] hover:border-[#20D6A0]/50 text-xs sm:text-sm font-bold text-white hover:bg-[#133D2F]/70 transition-all"
          >
            <UserCheck className="w-4 h-4 text-[#20D6A0]" />
            <span>Create Account</span>
          </Link>
        </div>

        {/* Field Worker Local Mode Link */}
        <div className="pt-2 text-center">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-xs text-[#7B9586] hover:text-[#A6F16A] transition-colors py-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Continue as Field Worker (Offline Mode)</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
