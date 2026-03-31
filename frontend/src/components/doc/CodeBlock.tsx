import { useState, useRef } from 'react'

interface Props {
  children?: React.ReactNode
}

export function CodeBlock({ children }: Props) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  const handleCopy = () => {
    const text = preRef.current?.innerText ?? ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="relative group my-4">
      <pre ref={preRef} className="bg-zinc-900 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-slate-700 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-600"
      >
        {copied ? 'コピー済み!' : 'コピー'}
      </button>
    </div>
  )
}
