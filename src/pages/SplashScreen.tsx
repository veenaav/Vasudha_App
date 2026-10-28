import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import BrandName from '@/components/BrandName'

export default function SplashScreen() {
  const navigate = useNavigate()

  const handleContinue = () => {
    navigate('/welcome')
  }

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#061812] text-[#F0F5EF] flex flex-col justify-between items-center text-center px-6 py-6 sm:py-10 select-none">
      {/* Background Nature Imagery with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/nature-splash.jpg"
          alt="Lush rainforest canopy"
          className="h-full w-full object-cover object-center filter brightness-[0.35] contrast-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#061812]/85 via-[#061812]/60 to-[#061812]" />
      </div>

      {/* Main Branding Section - Positioned higher up within viewport */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-lg mx-auto -translate-y-4 sm:-translate-y-6">
        {/* Logo */}
        <div className="mb-6 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#0D2D22]/90 border border-[#1C4D3C] p-3 shadow-2xl shadow-[#061812] flex items-center justify-center backdrop-blur-sm">
          <img
            src="/logo.png"
            alt="B-Liffe Logo"
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          <BrandName />
        </h1>

        {/* Subtitle / Full Form in Normal Title Case */}
        <p className="mt-3 text-sm sm:text-base font-medium tracking-wide text-[#8FA899] max-w-md leading-relaxed">
          Bharat Local Informatics for Flora, Fauna & Ecosystems
        </p>

        {/* Action Phrase: Larger, bolder, and noticeable */}
        <p className="mt-4 text-lg sm:text-xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#A6F16A] via-[#48E59B] to-[#20D6A0] drop-shadow-sm">
          Explore. Observe. Record.
        </p>
      </div>

      {/* Action Button: Positioned further down toward bottom for better thumb reach, larger size */}
      <div className="relative z-10 pb-4 sm:pb-6 w-full max-w-xs mx-auto flex-shrink-0">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] font-extrabold text-base sm:text-lg shadow-xl shadow-[#20D6A0]/25 hover:shadow-2xl hover:shadow-[#A6F16A]/35 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 text-[#061812]" />
        </button>
      </div>
    </div>
  )
}
