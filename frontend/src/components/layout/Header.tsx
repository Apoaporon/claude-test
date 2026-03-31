import { Link } from 'react-router-dom'

interface Props {
  onSearchOpen: () => void
}

export function Header({ onSearchOpen }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="text-violet-400 text-xl">◆</span>
          <span>Claude Code Docs</span>
        </Link>
        <button
          onClick={onSearchOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-sm hover:bg-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>検索</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 rounded text-xs bg-slate-700 text-slate-300 font-mono">Ctrl K</kbd>
        </button>
      </div>
    </header>
  )
}
