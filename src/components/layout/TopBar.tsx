import { Link } from 'react-router-dom'
import BrandName from '@/components/BrandName'

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#1C4D3C] bg-[#08221A]/95 backdrop-blur-md">
      <div className="flex w-full items-center justify-start px-3.5 py-2.5 sm:px-6 sm:py-3">
        {/* Left-aligned Branding Group: Logo Icon + Wordmark & Subtitle */}
        <Link
          to="/home"
          className="flex items-center text-left group gap-2.5 sm:gap-3.5 max-w-full"
          title="B-Liffe - Bharat Local Informatics for Flora, Fauna, and Ecosystems"
        >
          {/* Logo Icon */}
          <img
            src="/logo.png"
            alt="B-Liffe Logo"
            className="h-11 w-11 sm:h-12 sm:w-12 object-contain rounded-xl shrink-0 border border-[#1C4D3C] bg-[#0D2D22] p-0.5"
          />

          {/* Wordmark and Subtitle in compact vertical arrangement */}
          <div className="flex flex-col items-start text-left min-w-0">
            {/* Standardized B-Liffe Wordmark */}
            <BrandName className="text-xl sm:text-2xl" />

            {/* Subtitle */}
            <p className="text-[10px] sm:text-xs leading-tight tracking-normal text-[#B2C8BA] font-normal mt-0.5 max-w-xs sm:max-w-md truncate">
              Bharat Local Informatics for Flora, Fauna, and Ecosystems
            </p>
          </div>
        </Link>
      </div>
    </header>
  )
}
