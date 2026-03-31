import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import { loadAllDocs } from '../../hooks/useDoc'
import { navigation } from '../../data/navigation'

interface SearchItem {
  slug: string
  title: string
  content: string
}

interface Props {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [index, setIndex] = useState<Fuse<SearchItem> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()

    if (index) return

    loadAllDocs().then((docs) => {
      const items: SearchItem[] = Object.entries(docs).map(([slug, content]) => {
        const allItems = navigation.flatMap((cat) => cat.items)
        const navItem = allItems.find((i) => i.slug === slug)
        return {
          slug,
          title: navItem?.title ?? slug,
          content: content.slice(0, 500),
        }
      })
      setIndex(new Fuse(items, { keys: ['title', 'content'], threshold: 0.4 }))
    })
  }, [open, index])

  useEffect(() => {
    if (!index || !query.trim()) {
      setResults([])
      return
    }
    setResults(index.search(query).map((r) => r.item).slice(0, 8))
  }, [query, index])

  const handleSelect = (slug: string) => {
    navigate(`/docs/${slug}`)
    onClose()
    setQuery('')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ドキュメントを検索..."
            className="flex-1 bg-transparent text-white outline-none placeholder-slate-500"
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
        </div>
        {results.length > 0 && (
          <ul className="py-2 max-h-80 overflow-y-auto">
            {results.map((item) => (
              <li key={item.slug}>
                <button
                  onClick={() => handleSelect(item.slug)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-800 transition-colors"
                >
                  <div className="text-sm font-medium text-slate-100">{item.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">/docs/{item.slug}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
        {query && results.length === 0 && (
          <div className="px-4 py-6 text-center text-slate-500 text-sm">
            「{query}」に一致するドキュメントが見つかりません
          </div>
        )}
      </div>
    </div>
  )
}
