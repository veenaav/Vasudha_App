import { Link } from 'react-router-dom'
import {
  UserCheck,
  LogIn,
  ShieldCheck,
} from 'lucide-react'
import BrandName from '@/components/BrandName'

export default function WelcomePage() {
  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#08221A] text-[#F0F5EF] flex flex-col justify-between px-4 py-3 sm:py-5 max-w-lg mx-auto select-none">
      {/* Full-bleed Nature Image Card with blended text overlay */}
      <div className="relative flex-1 min-h-0 w-full rounded-3xl overflow-hidden border border-[#1C4D3C] shadow-2xl shadow-[#061812]/70">
        <img
          src="/nature-welcome-test.jpg"
          alt="Orange Fungi Microhabitat"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.05] saturate-[1.1]"
        />

        {/* Text Container overlay: Blends smoothly with deep forest gradient and crisp readable typography */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#061812] via-[#061812]/85 to-transparent pt-20 pb-5 sm:pb-6 px-5 sm:px-6 z-10 space-y-3">
          {/* Bigger Logo & B-Liffe Badge */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#061812]/75 backdrop-blur-md border border-[#1C4D3C]/70 shadow-lg">
            <img
              src="/splash-logo.png"
              alt="B-Liffe Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#061812] border border-[#1C4D3C] p-1 object-contain"
            />
            <BrandName className="text-lg sm:text-xl font-extrabold tracking-wider" />
          </div>

          {/* Bigger, High-Readability Description Paragraph blended with the scene */}
          <p className="text-sm sm:text-base text-[#F0F5EF] leading-relaxed font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            Welcome to <BrandName className="font-bold" /> (Bharat Local Informatics for Flora, Fauna, and Ecosystems). An open, scientific field data collection platform designed for researchers, local naturalists, ward volunteers, and biodiversity committees.
          </p>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="pt-3.5 sm:pt-4 pb-1 space-y-2.5 flex-shrink-0">
        {/* Actions: Log In & Create Account */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/login"
            className="flex min-h-[46px] sm:min-h-[48px] items-center justify-center gap-2 py-2.5 sm:py-3 px-3.5 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] text-sm sm:text-base font-extrabold shadow-md shadow-[#20D6A0]/20 hover:shadow-lg hover:shadow-[#A6F16A]/30 active:scale-[0.98] transition-all"
          >
            <LogIn className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#061812]" />
            <span>Log In</span>
          </Link>

          <Link
            to="/create-account"
            className="flex min-h-[46px] sm:min-h-[48px] items-center justify-center gap-2 py-2.5 sm:py-3 px-3.5 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] text-sm sm:text-base font-extrabold shadow-md shadow-[#20D6A0]/20 hover:shadow-lg hover:shadow-[#A6F16A]/30 active:scale-[0.98] transition-all"
          >
            <UserCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#061812]" />
            <span>Create Account</span>
          </Link>
        </div>

        {/* Field Worker Local Mode Link */}
        <div className="pt-0.5 text-center">
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
