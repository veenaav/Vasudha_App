import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function SplashScreen() {
  const navigate = useNavigate()

  const handleContinue = () => {
    navigate('/welcome')
  }

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#061812] text-[#F0F5EF] flex flex-col justify-between items-center text-center px-4 sm:px-6 py-5 sm:py-7 select-none">
      {/* Background Nature Imagery with Bird - Restored original darkness & deep contrast */}
      <div className="absolute inset-0 z-0">
        <img
          src={`${import.meta.env.BASE_URL}nature-splash.jpg`}
          alt="Lush rainforest canopy with bird"
          className="h-full w-full object-cover object-center filter brightness-[0.35] contrast-[1.1]"
        />
        {/* Deep gradient overlay for foreground legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#061812]/85 via-[#061812]/60 to-[#061812]" />
      </div>

      {/* Main Branding Section - Centered with Clean Breathing Room */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full py-4 sm:py-6">
        {/* Combined Logo Unit: Balanced Proportions + Tight Lockup */}
        <div className="flex flex-col items-center justify-center">
          {/* Logo Emblem: Refined, slightly reduced size so it isn't overly dominant */}
          <div className="flex items-center justify-center">
            <img
              src={`${import.meta.env.BASE_URL}splash-logo-opt2.png`}
              alt="B-Liffe Digital Butterfly Logo"
              className="w-[145px] h-[138px] sm:w-[175px] sm:h-[166px] md:w-[190px] md:h-[180px] max-h-[28vh] object-contain select-none transition-transform duration-500 hover:scale-[1.03] filter drop-shadow-[0_0_20px_rgba(32,214,160,0.28)] drop-shadow-[0_12px_24px_rgba(0,0,0,0.75)]"
            />
          </div>

          {/* "B-LIFFE" Wordmark: Tighter spacing & soft pale mint off-white blend */}
          <h1 className="mt-1 sm:mt-1.5 select-none">
            <span className="text-[24px] sm:text-[28px] md:text-[30px] font-sans font-extrabold tracking-[0.14em] uppercase text-[#E4F6EC] drop-shadow-[0_0_12px_rgba(32,214,160,0.22)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              B-LIFFE
            </span>
          </h1>
        </div>

        {/* Action Phrase: Clean, elegant spacing without clutter */}
        <p className="mt-8 sm:mt-10 text-[16px] sm:text-[18px] font-medium tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#A6F16A] via-[#48E59B] to-[#20D6A0] drop-shadow-sm">
          Explore. Observe. Record.
        </p>
      </div>

      {/* Action Button: Refined soft ambient glow & subtle surface shine */}
      <div className="relative z-10 pb-4 sm:pb-6 w-full flex justify-center flex-shrink-0">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full max-w-[260px] sm:max-w-[280px] h-[50px] min-h-[50px] sm:h-[54px] sm:min-h-[54px] flex items-center justify-center gap-2 px-7 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#1C5743] to-[#134233] hover:from-[#21664F] hover:to-[#174D3B] text-[#F0F5EF] hover:text-white border border-[#20D6A0]/40 hover:border-[#20D6A0]/65 font-bold text-sm sm:text-base shadow-[0_0_20px_rgba(32,214,160,0.20),inset_0_1px_1px_rgba(255,255,255,0.16)] hover:shadow-[0_0_28px_rgba(32,214,160,0.32),inset_0_1px_1px_rgba(255,255,255,0.25)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4.5 h-4.5 text-[#20D6A0]" />
        </button>
      </div>
    </div>
  )
}
