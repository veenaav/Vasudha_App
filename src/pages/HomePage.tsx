import { Link } from 'react-router-dom'
import { PlusCircle, ArrowRight, FolderGit2, BookOpen } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-4 sm:px-6 space-y-4">
      {/* 1. Compact Field Tagline (Top header already displays B LIFFE and full form) */}
      <section className="text-center pt-1 pb-1">
        <p className="text-xs sm:text-sm font-medium tracking-wide text-[#C5D1BD] leading-relaxed">
          Explore biodiversity. Record observations. Support conservation.
        </p>
      </section>

      {/* 2. Prominent Primary Action: "New Observation" */}
      <section>
        <Link
          to="/new-observation"
          className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#263D2B] px-6 py-3.5 text-base sm:text-lg font-medium text-[#F5F0E4] border border-[#C5D1BD]/40 shadow-lg transition-all hover:bg-[#344F3A] hover:border-[#C5D1BD]/60 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#C5D1BD]/50"
        >
          <PlusCircle className="h-5 w-5 text-[#C5D1BD]" />
          <span>New Observation</span>
        </Link>
      </section>

      {/* 3. Secondary Sections: Projects & My Records Entry Points */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Projects Entry Point */}
        <Link
          to="/projects"
          className="flex items-center justify-between rounded-2xl
               border border-white/20 bg-white/10
               p-4 text-[#F5F0E4] shadow-xl
               backdrop-blur-md transition-colors
               hover:bg-white/15 active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <FolderGit2 className="h-5 w-5 text-[#C5D1BD]" />
            <span className="font-medium text-base">Projects</span>
          </span>

          <ArrowRight className="h-5 w-5 text-[#C5D1BD]" />
        </Link>

        {/* My Records Entry Point */}
        <Link
          to="/observations"
          className="flex items-center justify-between rounded-2xl
               border border-white/20 bg-white/10
               p-4 text-[#F5F0E4] shadow-xl
               backdrop-blur-md transition-colors
               hover:bg-white/15 active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-[#C5D1BD]" />
            <span className="font-medium text-base">My Records</span>
          </span>

          <ArrowRight className="h-5 w-5 text-[#C5D1BD]" />
        </Link>
      </div>
    </div>
  )
}
