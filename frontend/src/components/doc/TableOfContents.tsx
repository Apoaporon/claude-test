import { useScrollSpy } from '../../hooks/useScrollSpy'
import type { HeadingItem } from '../../types/doc'

interface Props {
  headings: HeadingItem[]
}

export function TableOfContents({ headings }: Props) {
  const ids = headings.map((h) => h.id)
  const activeId = useScrollSpy(ids)

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
        目次
      </p>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}>
            <a
              href={`#${heading.id}`}
              className={`block text-sm py-0.5 transition-colors ${
                activeId === heading.id
                  ? 'text-violet-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
