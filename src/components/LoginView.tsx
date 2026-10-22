import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trees, ShieldCheck, ArrowRight, Wifi, Lock, UserCheck } from 'lucide-react'

interface LoginViewProps {
  onLogin: (agentId: string) => void
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [agentId, setAgentId] = useState('KFRI-FLD-8821')
  const [password, setPassword] = useState('••••••••••')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLogin(agentId || 'KFRI-FLD-8821')
    }, 400)
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans">
      {/* Mobile Top Status / Mode Indicator */}
      <header className="w-full max-w-md mx-auto pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <Trees className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold tracking-wide text-slate-800 dark:text-slate-200">VASUDHA</span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span>KFRI FIELD APP</span>
        </div>

        {/* Subtle offline/status indicator badge */}
        <Badge
          variant="outline"
          className="gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
        >
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
          </span>
          Field Mode: Ready
        </Badge>
      </header>

      {/* Main Login Card - High Contrast & Sunlight Readable */}
      <main className="w-full max-w-md mx-auto my-auto py-4">
        <Card className="border-slate-300 dark:border-slate-800 shadow-lg rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
          {/* Card Header & Brand Emblem */}
          <CardHeader className="space-y-2 pb-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                <Trees className="size-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Vasudha Field Portal
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Kerala Forest Research Institute (KFRI)
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pt-6 pb-4">
              {/* Field Agent ID / Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="agentId"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between"
                >
                  <span>Field Agent ID / Email</span>
                  <span className="text-[10px] font-normal text-emerald-700 dark:text-emerald-400 font-mono">
                    OFFLINE CACHED
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="agentId"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    required
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    placeholder="agent.kfri@kerala.gov.in"
                    className="h-12 min-h-[44px] px-3.5 text-base border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus-visible:ring-emerald-600 focus-visible:border-emerald-600 rounded-xl"
                  />
                  <UserCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                  >
                    Surveyor Passcode
                  </Label>
                  <span className="text-[11px] text-slate-500 hover:text-emerald-700 cursor-pointer">
                    Station PIN
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-12 min-h-[44px] px-3.5 text-base border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus-visible:ring-emerald-600 focus-visible:border-emerald-600 rounded-xl"
                  />
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Offline Field Notice Banner */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <Wifi className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">Offline Survey Mode active:</strong> Local database syncs automatically when network reconnects.
                </div>
              </div>
            </CardContent>

            {/* Thumb-friendly Large Action Button (>= 44px) */}
            <CardFooter className="pt-2 pb-6 px-6 flex flex-col gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 min-h-[48px] text-base font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Authenticating Station...</span>
                ) : (
                  <>
                    <span>Sign In to Field App</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="size-3.5 text-slate-400" />
                <span>Encrypted on-device biological telemetry</span>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>

      {/* Mobile Footer Meta */}
      <footer className="w-full max-w-md mx-auto text-center pb-2 text-[11px] text-slate-500 dark:text-slate-500">
        Vasudha v2.4.0 • Govt. of Kerala Forestry Division
      </footer>
    </div>
  )
}
