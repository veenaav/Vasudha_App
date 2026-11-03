import { Link } from 'react-router-dom'
import {
  UserCheck,
  LogIn,
  Compass,
} from 'lucide-react'
import BrandName from '@/components/BrandName'

export default function WelcomePage() {
  return (
    <div className="h-full w-full overflow-hidden bg-[#08221A] text-[#F0F5EF] flex flex-col justify-between px-3.5 sm:px-4 py-2.5 sm:py-3.5 max-w-lg mx-auto select-none font-modern">
      {/* Full-bleed Nature Image Card with blended text overlay */}
      <div className="relative flex-1 min-h-0 w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#1C4D3C] shadow-2xl shadow-[#061812]/70">
        <img
          src={`${import.meta.env.BASE_URL}nature-welcome.jpg`}
          alt="Cyan Cup Fungi Microhabitat"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.05] saturate-[1.05]"
        />

        {/* Text Container overlay: Blends smoothly with deep forest gradient and crisp readable typography */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#061812] via-[#061812]/92 to-transparent pt-16 sm:pt-24 pb-4 sm:pb-5 px-4 sm:px-6 z-10 space-y-2.5 sm:space-y-3">
          {/* Logo & Two-Line Title Header */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <img
              src={`${import.meta.env.BASE_URL}splash-logo.png`}
              alt="B-Liffe Logo"
              className="w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)] shrink-0"
            />
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight font-modern">
                Welcome to <BrandName className="text-xl sm:text-2xl md:text-3xl font-extrabold" />
              </h1>
              <p className="text-xs sm:text-sm md:text-base font-semibold text-[#A6F16A] tracking-normal leading-snug font-modern mt-0.5">
                Bharat Local Informatics for Flora, Fauna, and Ecosystems
              </p>
            </div>
          </div>

          {/* Main description paragraph starting on a new line immediately following the title */}
          <p className="text-xs sm:text-sm md:text-base text-[#F0F5EF] leading-relaxed font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] font-modern">
            An open, scientific field data collection platform designed for researchers, local naturalists, ward volunteers, and biodiversity committees.
          </p>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="pt-3 sm:pt-4 pb-0.5 w-full max-w-[390px] sm:max-w-[450px] mx-auto flex-shrink-0 font-modern">
        {/* Row 1: Side-by-Side (Log In & Create Account) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          <Link
            to="/login"
            className="flex h-11 sm:h-12 min-h-[44px] sm:min-h-[48px] items-center justify-center gap-2 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] text-xs sm:text-sm md:text-base font-extrabold shadow-lg shadow-[#20D6A0]/20 hover:shadow-xl hover:shadow-[#A6F16A]/30 active:scale-[0.98] transition-all font-modern whitespace-nowrap"
          >
            <LogIn className="w-4.5 h-4.5 text-[#061812] shrink-0" />
            <span>Log In</span>
          </Link>

          <Link
            to="/create-account"
            className="flex h-11 sm:h-12 min-h-[44px] sm:min-h-[48px] items-center justify-center gap-2 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] text-xs sm:text-sm md:text-base font-extrabold shadow-lg shadow-[#20D6A0]/20 hover:shadow-xl hover:shadow-[#A6F16A]/30 active:scale-[0.98] transition-all font-modern whitespace-nowrap"
          >
            <UserCheck className="w-4.5 h-4.5 text-[#061812] shrink-0" />
            <span>Create Account</span>
          </Link>
        </div>

        {/* Row 2: Guest Button Underneath (Identical Size & Layout) */}
        <div className="mt-2.5 sm:mt-3 flex justify-center">
          <Link
            to="/home"
            className="flex h-11 sm:h-12 min-h-[44px] sm:min-h-[48px] w-[calc(50%-5px)] sm:w-[calc(50%-7px)] items-center justify-center gap-2 px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] text-[#A6F16A] hover:bg-[#133D2F] hover:text-[#F0F5EF] text-xs sm:text-sm md:text-base font-extrabold shadow-md active:scale-[0.98] transition-all font-modern whitespace-nowrap"
          >
            <Compass className="w-4.5 h-4.5 text-[#A6F16A] shrink-0" />
            <span>Continue as Guest →</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
