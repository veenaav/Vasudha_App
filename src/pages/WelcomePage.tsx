import { Link } from 'react-router-dom'
import {
  UserCheck,
  LogIn,
  ShieldCheck,
} from 'lucide-react'
import BrandName from '@/components/BrandName'

export default function WelcomePage() {
  return (
    <div className="h-full w-full overflow-hidden bg-[#08221A] text-[#F0F5EF] flex flex-col justify-between px-3.5 sm:px-4 py-2.5 sm:py-4 max-w-lg mx-auto select-none font-modern">
      {/* Full-bleed Nature Image Card with blended text overlay */}
      <div className="relative flex-1 min-h-0 w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#1C4D3C] shadow-2xl shadow-[#061812]/70">
        <img
          src="/nature-welcome.jpg"
          alt="Cyan Cup Fungi Microhabitat"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.05] saturate-[1.05]"
        />

        {/* Text Container overlay: Blends smoothly with deep forest gradient and crisp readable typography */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#061812] via-[#061812]/92 to-transparent pt-16 sm:pt-24 pb-4 sm:pb-6 px-4 sm:px-6 z-10 space-y-3 sm:space-y-3.5">
          {/* Logo & Two-Line Title Header */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <img
              src="/splash-logo.png"
              alt="B-Liffe Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)] shrink-0"
            />
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight font-modern">
                Welcome to <BrandName className="text-xl sm:text-2xl md:text-3xl font-extrabold" />
              </h1>
              <p className="text-xs sm:text-sm md:text-base font-semibold text-[#A6F16A] tracking-normal leading-snug font-modern mt-1">
                Bharat Local Informatics for Flora, Fauna, and Ecosystems
              </p>
            </div>
          </div>

          {/* Main description paragraph starting on a new line immediately following the title */}
          <p className="text-sm sm:text-base md:text-lg text-[#F0F5EF] leading-relaxed font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] font-modern">
            An open, scientific field data collection platform designed for researchers, local naturalists, ward volunteers, and biodiversity committees.
          </p>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="pt-2.5 sm:pt-4 pb-0.5 space-y-2 sm:space-y-2.5 flex-shrink-0 font-modern">
        {/* Actions: Log In & Create Account */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <Link
            to="/login"
            className="flex min-h-[44px] sm:min-h-[48px] items-center justify-center gap-2 py-2 sm:py-3 px-3 sm:px-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] text-sm sm:text-base font-extrabold shadow-md shadow-[#20D6A0]/20 hover:shadow-lg hover:shadow-[#A6F16A]/30 active:scale-[0.98] transition-all font-modern"
          >
            <LogIn className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#061812]" />
            <span>Log In</span>
          </Link>

          <Link
            to="/create-account"
            className="flex min-h-[44px] sm:min-h-[48px] items-center justify-center gap-2 py-2 sm:py-3 px-3 sm:px-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] text-sm sm:text-base font-extrabold shadow-md shadow-[#20D6A0]/20 hover:shadow-lg hover:shadow-[#A6F16A]/30 active:scale-[0.98] transition-all font-modern"
          >
            <UserCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#061812]" />
            <span>Create Account</span>
          </Link>
        </div>

        {/* Field Worker Local Mode Link */}
        <div className="pt-0.5 text-center">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#7B9586] hover:text-[#A6F16A] transition-colors py-0.5 font-modern"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Continue as Field Worker (Offline Mode)</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
