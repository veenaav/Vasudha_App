import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import BrandName from '@/components/BrandName'

export default function SplashScreen() {
  const navigate = useNavigate()

  const handleContinue = () => {
    navigate('/welcome')
  }

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#061812] text-[#F0F5EF] flex flex-col justify-between items-center text-center px-4 sm:px-6 py-4 sm:py-6 md:py-8 select-none">
      {/* Background Nature Imagery with Bird - Restored original darkness & deep contrast */}
      <div className="absolute inset-0 z-0">
        <img
          src="/nature-splash.jpg"
          alt="Lush rainforest canopy with bird"
          className="h-full w-full object-cover object-center filter brightness-[0.35] contrast-[1.1]"
        />
        {/* Original deep gradient overlay for foreground legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#061812]/85 via-[#061812]/60 to-[#061812]" />
      </div>

      {/* Main Branding Section - Balanced Vertical Composition */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full py-1 sm:py-2">
        {/* Tree Logo: Preserved size & aspect ratio with subtle floating glow */}
        <div className="mb-3 sm:mb-4 flex items-center justify-center">
          <img
            src="/splash-logo.png"
            alt="B-Liffe Tree Logo"
            className="w-[150px] h-[150px] sm:w-[192px] sm:h-[192px] max-h-[28vh] aspect-square object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] drop-shadow-[0_0_16px_rgba(166,241,106,0.18)] select-none transition-transform duration-500 hover:scale-[1.03]"
          />
        </div>

        {/* B-Liffe Title: Refined font weight (Bold 700 instead of ExtraBold 800) */}
        <h1 className="text-[40px] sm:text-[54px] font-bold tracking-tight leading-tight select-none">
          <BrandName className="text-[40px] sm:text-[54px] font-bold tracking-tight" />
        </h1>

        {/* Subtitle / Full Form: Soft mint color, ~14px mobile, ~16px desktop */}
        <p className="mt-2 sm:mt-2.5 text-[14px] sm:text-[16px] font-medium tracking-wide text-[#A2EAD0] max-w-md leading-relaxed px-2">
          Bharat Local Informatics for Flora, Fauna & Ecosystems
        </p>

        {/* Action Phrase: Moved lower with increased spacing (mt-6 sm:mt-8), refined medium-bold weight */}
        <p className="mt-6 sm:mt-8 text-[17px] sm:text-[20px] font-medium tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#A6F16A] via-[#48E59B] to-[#20D6A0] drop-shadow-sm">
          Explore. Observe. Record.
        </p>
      </div>

      {/* Action Button: Prominent, height ~54px mobile / ~60px desktop, rounded-2xl, green-to-turquoise gradient */}
      <div className="relative z-10 pb-3 sm:pb-5 w-full flex justify-center flex-shrink-0">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full max-w-[280px] sm:max-w-xs h-[54px] min-h-[54px] sm:h-[60px] sm:min-h-[60px] flex items-center justify-center gap-2.5 px-8 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] font-extrabold text-base sm:text-lg shadow-xl shadow-[#20D6A0]/25 hover:shadow-2xl hover:shadow-[#A6F16A]/35 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 text-[#061812]" />
        </button>
      </div>
    </div>
  )
}
