import { useState } from 'react'
import LoginView from './components/LoginView'
import MobileFieldLayout from './components/MobileFieldLayout'
import Home from '@/pages/Home'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trees } from 'lucide-react'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [agentId, setAgentId] = useState('KFRI-FLD-8821')
  const [isRecording, setIsRecording] = useState(false)

  if (!isLoggedIn) {
    return (
      <LoginView
        onLogin={(id) => {
          setAgentId(id)
          setIsLoggedIn(true)
        }}
      />
    )
  }

  if (isRecording) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans select-none antialiased">
        <div className="w-full max-w-md mx-auto min-h-screen bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl">
          <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRecording(false)}
              className="h-10 min-h-[40px] px-2.5 text-xs font-semibold gap-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Field Hub</span>
            </Button>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <Trees className="size-4" />
              <span>Specimen Form</span>
            </div>
          </header>
          <main className="flex-1 p-2 pb-12 overflow-y-auto">
            <Home />
          </main>
        </div>
      </div>
    )
  }

  return (
    <MobileFieldLayout
      agentId={agentId}
      onLogout={() => setIsLoggedIn(false)}
      onStartObservation={() => setIsRecording(true)}
    />
  )
}

export default App