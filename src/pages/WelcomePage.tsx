import { Link } from 'react-router-dom'
import { useProfile } from '@/context/ProfileContext'
import {
  UserCheck,
  LogIn,
  Compass,
} from 'lucide-react'

export default function WelcomePage() {
  const { setGuestSession } = useProfile()
  return (
    <div className="h-full w-full overflow-hidden bg-[#08221A] text-[#F0F5EF] flex flex-col justify-between px-3.5 sm:px-4 py-2.5 sm:py-3.5 max-w-lg mx-auto select-none font-modern">
      {/* Full-bleed Nature Image Card with blended text overlay */}
      <div className="relative flex-1 min-h-0 w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#1C4D3C] shadow-2xl shadow-[#061812]/70">
        <img
          src={`${import.meta.env.BASE_URL}nature-welcome.jpg`}
          alt="Cyan Cup Fungi Microhabitat"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.05] saturate-[1.05]"
        />

        {/* Text Container overlay: Blends smoothly with deep forest gradient and elevated upward toward the photo */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#061812] via-[#061812]/95 to-transparent pt-20 sm:pt-28 pb-7 sm:pb-9 md:pb-10 px-4 sm:px-6 z-10 flex flex-col items-start text-left space-y-2.5 sm:space-y-3">
          {/* Text-Only Header: Left-aligned 'Welcome to B-LIFFE' and Subtitle */}
          <div className="flex flex-col items-start text-left space-y-1 sm:space-y-1.5 w-full">
            <h1 className="text-[26px] sm:text-3xl md:text-[34px] font-extrabold tracking-tight text-white leading-tight font-modern flex items-baseline gap-2 flex-wrap">
              <span>Welcome to</span>
              <span className="font-sans font-extrabold tracking-[0.14em] uppercase text-[#E4F6EC] drop-shadow-[0_0_12px_rgba(32,214,160,0.22)]">
                B-LIFFE
              </span>
            </h1>
            <p className="text-[13px] sm:text-[14.5px] md:text-base font-semibold text-[#A6F16A] tracking-tight sm:tracking-normal leading-snug font-modern whitespace-nowrap overflow-hidden text-ellipsis sm:overflow-visible">
              Bharat Local Informatics • Flora, Fauna &amp; Ecosystems
            </p>
          </div>

          {/* Main description paragraph with refined letter-spacing, gentle weight, and improved line height */}
          <p className="text-[13px] sm:text-sm md:text-[15px] text-[#B2C8BA] leading-relaxed sm:leading-[1.65] font-normal tracking-[0.012em] antialiased drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] font-modern text-left">
            Your digital field companion for capturing India’s biodiversity. Record, observe, and protect ecosystems anywhere.
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
            onClick={() => setGuestSession(true)}
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
