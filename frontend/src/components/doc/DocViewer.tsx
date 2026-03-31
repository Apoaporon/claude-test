import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import 'highlight.js/styles/github-dark.css'
import { CodeBlock } from './CodeBlock'
import { TableOfContents } from './TableOfContents'
import type { HeadingItem } from '../../types/doc'

interface Props {
  content: string
}

function extractHeadings(markdown: string): HeadingItem[] {
  const headings: HeadingItem[] = []
  const lines = markdown.split('\n')
  for (const line of lines) {
    const match = line.match(/^(#{2,4})\s+(.+)$/)
    if (match) {
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s\u3040-\u9fff]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      headings.push({ id, text, level: match[1].length })
    }
  }
  return headings
}

export function DocViewer({ content }: Props) {
  const headings = useMemo(() => extractHeadings(content), [content])

  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 prose prose-invert prose-slate max-w-none prose-headings:scroll-mt-20 prose-a:text-violet-400 prose-code:text-violet-300 prose-pre:p-0 prose-pre:bg-transparent">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: 'wrap' }],
            rehypeHighlight,
          ]}
          components={{
            pre({ children }) {
              return <CodeBlock>{children}</CodeBlock>
            },
            code({ className, children, ...props }) {
              // コードブロック内（pre > code）はそのまま渡す
              if (className) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }
              // インラインコード
              return (
                <code
                  className="bg-zinc-800 text-violet-300 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              )
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
      <aside className="hidden xl:block w-56 shrink-0">
        <TableOfContents headings={headings} />
      </aside>
    </div>
  )
}
