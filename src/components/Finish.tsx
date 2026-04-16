import { Sparkles } from 'lucide-react'

import GoHome from './GoHome'

export default function Finish() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-4 py-16 md:py-24">
      <div className="flex w-full flex-col items-center gap-6 rounded-2xl border border-border/70 bg-card p-10 text-center shadow-xs">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <Sparkles className="size-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            All caught up
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            No cards left to review for now. Great work — come back later.
          </p>
        </div>
        <GoHome />
      </div>
    </main>
  )
}
