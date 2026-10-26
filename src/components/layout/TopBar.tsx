import { Link } from 'react-router-dom'

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="flex w-full items-center justify-start px-3.5 py-2.5 sm:px-6 sm:py-3">
        {/* Left-aligned Branding Group: Logo Icon + Wordmark & Subtitle */}
        <Link
          to="/"
          className="flex items-center text-left group gap-2.5 sm:gap-3.5 max-w-full"
          title="B-liffe - Bharat Local Informatics for Flora, Fauna, and Ecosystems"
        >
          {/* Logo Icon - Enlarged */}
          <img
            src="/logo.png"
            alt="B-liffe Logo"
            className="h-11 w-11 sm:h-12 sm:w-12 object-contain rounded-lg shrink-0"
          />

          {/* Wordmark and Subtitle in compact vertical arrangement */}
          <div className="flex flex-col items-start text-left min-w-0">
            {/* Wordmark: B-liffe Inter ExtraBold (800) */}
            <div
              className="flex items-baseline font-sans font-extrabold text-xl sm:text-2xl tracking-normal leading-none"
              aria-label="B-liffe"
            >
              <span style={{ color: '#39A935' }}>B</span>
              <span style={{ color: '#39A935' }}>-</span>
              <span style={{ color: '#39A935' }}>l</span>
              <span style={{ color: '#39A935' }}>i</span>
              <span style={{ color: '#F28C28' }}>f</span>
              <span style={{ color: '#39A935' }}>f</span>
              <span style={{ color: '#39A935' }}>e</span>
            </div>

            {/* Subtitle: Inter Regular (400) */}
            <p className="text-[10px] sm:text-xs leading-tight tracking-normal text-[#1B5E20] font-normal mt-0.5 max-w-xs sm:max-w-md">
              Bharat Local Informatics for Flora, Fauna, and Ecosystems
            </p>
          </div>
        </Link>
      </div>
    </header>
  )
}

