import { Link } from 'react-router-dom'
import { PlusCircle, ArrowRight, FolderGit2, BookOpen } from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'

export default function HomePage() {
  const { profile } = useProfile()

  // Read name dynamically from the frontend profile state.
  // Falls back to 'Welcome to B-Liffe!' if no name is available.
  const greetingName =
    profile?.displayName?.trim() ||
    (profile?.fullName?.trim() ? profile.fullName.trim().split(/\s+/)[0] : '')

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6 space-y-6">
      {/* 1. Main Heading & Subtitle with personalised greeting */}
      <section className="text-center pt-2 pb-1 space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {greetingName ? `Hi, ${greetingName}!` : 'Welcome to B-Liffe!'}
        </h1>
        <p className="text-sm sm:text-base font-normal text-[#B2C8BA]">
          Record observations. Support conservation.
        </p>
      </section>


      {/* 2. Prominent Primary Action: "New Observation" */}
      <section>
        <Link
          to="/new-observation"
          className="flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] px-6 py-3.5 text-base sm:text-lg font-bold shadow-lg shadow-[#20D6A0]/20 hover:shadow-[#A6F16A]/25 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#A6F16A]/50"
        >
          <PlusCircle className="h-5 w-5 text-[#061812]" />
          <span>New Observation</span>
        </Link>
      </section>

      {/* 3. Secondary Sections: Projects & My Records Entry Points */}
      <div className="grid grid-cols-1 gap-3">
        {/* Projects Entry Point */}
        <Link
          to="/projects"
          className="group flex items-center justify-between rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 text-[#F0F5EF] shadow-xs transition-all hover:border-[#A6F16A]/50 hover:bg-[#133D2F]/60 active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] transition-colors group-hover:border-[#A6F16A]/50">
              <FolderGit2 className="h-5 w-5" />
            </span>
            <span className="flex flex-col text-left">
              <span className="font-semibold text-base text-white group-hover:text-[#A6F16A] transition-colors">
                Projects
              </span>
              <span className="text-xs text-[#7B9586]">
                Regional initiatives and surveys
              </span>
            </span>
          </span>

          <ArrowRight className="h-5 w-5 text-[#7B9586] group-hover:text-[#A6F16A] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* My Records Entry Point */}
        <Link
          to="/observations"
          className="group flex items-center justify-between rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 text-[#F0F5EF] shadow-xs transition-all hover:border-[#20D6A0]/50 hover:bg-[#133D2F]/60 active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#061812] border border-[#1C4D3C] text-[#20D6A0] transition-colors group-hover:border-[#20D6A0]/50">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="flex flex-col text-left">
              <span className="font-semibold text-base text-white group-hover:text-[#20D6A0] transition-colors">
                My Records
              </span>
              <span className="text-xs text-[#7B9586]">
                Saved field entries
              </span>
            </span>
          </span>

          <ArrowRight className="h-5 w-5 text-[#7B9586] group-hover:text-[#20D6A0] group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  )
}
