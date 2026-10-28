import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import BrandName from '@/components/BrandName'

export default function SplashScreen() {
  const navigate = useNavigate()

  const handleContinue = () => {
    navigate('/welcome')
  }

  return (
    <div className="relative min-h-screen w-full bg-[#061812] text-[#F0F5EF] flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Background Nature Imagery with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/nature-splash.jpg"
          alt="Lush rainforest canopy"
          className="h-full w-full object-cover object-center filter brightness-[0.4] contrast-[1.1] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#061812]/80 via-[#061812]/50 to-[#061812]" />
      </div>

      {/* Decorative Viewfinder / Reticle Frame */}
      <div className="absolute inset-4 sm:inset-8 border border-[#1C4D3C]/40 rounded-3xl pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6">
        <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-[#A6F16A]/70">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#20D6A0]" />
            Field Sensor Active
          </span>
          <span>LAT 8.5241° N</span>
        </div>
        <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-[#7B9586]">
          <span>GRID: TVM-100W</span>
          <span>ECOSYSTEM V6</span>
        </div>
      </div>

      {/* Top Tag */}
      <div className="relative z-20 pt-4 flex justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D2D22]/80 backdrop-blur-md border border-[#1C4D3C] text-xs font-medium text-[#A6F16A] shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-[#20D6A0]" />
          <span>Biodiversity Informatics Platform</span>
        </div>
      </div>

      {/* Center Branding & Tagline */}
      <div className="relative z-20 text-center space-y-5 my-auto max-w-sm mx-auto">
        {/* Logo Mark */}
        <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#0D2D22]/90 border border-[#1C4D3C] p-3 shadow-2xl shadow-[#061812] flex items-center justify-center backdrop-blur-sm">
          <img
            src="/logo.png"
            alt="B-Liffe Logo"
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>

        {/* Brand Name */}
        <div className="space-y-2">
          <h1>
            <BrandName className="text-4xl sm:text-5xl" />
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-[#B2C8BA] font-semibold">
            Bharat Local Informatics
          </p>
        </div>

        {/* Tagline */}
        <div className="pt-2">
          <div className="inline-block px-4 py-2 rounded-2xl bg-[#061812]/80 border border-[#1C4D3C] backdrop-blur-md">
            <p className="text-base sm:text-lg font-bold text-white tracking-wide">
              “Explore. Observe. Conserve.”
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action: Strictly bound to user button click */}
      <div className="relative z-20 pb-4 max-w-xs mx-auto w-full">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] font-extrabold text-sm sm:text-base shadow-lg shadow-[#20D6A0]/20 hover:shadow-[#A6F16A]/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 text-[#061812]" />
        </button>
      </div>
    </div>
  )
}
