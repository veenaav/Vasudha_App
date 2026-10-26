import { Link } from 'react-router-dom'
import { PlusCircle, ArrowRight, FolderGit2, BookOpen } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-4 sm:px-6 space-y-4">
      {/* 1. Main Heading & Subtitle */}
      <section className="text-center pt-2 pb-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Explore biodiversity
        </h1>
        <p className="mt-1.5 text-sm sm:text-base font-normal text-slate-600">
          Record observations. Support conservation.
        </p>
      </section>

      {/* 2. Prominent Primary Action: "New Observation" */}
      <section>
        <Link
          to="/new-observation"
          className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#39A935] to-[#45BD41] hover:from-[#31972E] hover:to-[#3DA739] px-6 py-3.5 text-base sm:text-lg font-medium text-white shadow-sm shadow-green-900/10 border border-green-500/30 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#39A935]/50"
        >
          <PlusCircle className="h-5 w-5 text-white" />
          <span>New Observation</span>
        </Link>
      </section>

      {/* 3. Secondary Sections: Projects & My Records Entry Points */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Projects Entry Point */}
        <Link
          to="/projects"
          className="group flex items-center justify-between rounded-2xl
               border border-slate-200/90 bg-white
               p-4 text-slate-800 shadow-xs
               transition-all hover:border-emerald-300 hover:shadow-md
               active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-[#165B33] transition-colors group-hover:bg-emerald-100">
              <FolderGit2 className="h-5 w-5" />
            </span>
            <span className="font-semibold text-base text-slate-900">Projects</span>
          </span>

          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[#165B33] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* My Records Entry Point */}
        <Link
          to="/observations"
          className="group flex items-center justify-between rounded-2xl
               border border-slate-200/90 bg-white
               p-4 text-slate-800 shadow-xs
               transition-all hover:border-orange-300 hover:shadow-md
               active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 border border-orange-100 text-[#EA580C] transition-colors group-hover:bg-orange-100">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="font-semibold text-base text-slate-900">My Records</span>
          </span>

          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[#EA580C] group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  )
}
