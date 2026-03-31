import { useState, useEffect } from 'react'

const modules = import.meta.glob('../../../docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: false,
})

export function useDoc(slug: string | undefined) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const path = `../../../docs/${slug}.md`
    const loader = modules[path]

    if (!loader) {
      setError(`ドキュメントが見つかりません: ${slug}`)
      setContent(null)
      setLoading(false)
      return
    }

    loader()
      .then((raw) => {
        setContent(raw as string)
        setLoading(false)
      })
      .catch(() => {
        setError('ドキュメントの読み込みに失敗しました')
        setLoading(false)
      })
  }, [slug])

  return { content, loading, error }
}

export async function loadAllDocs(): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  for (const [path, loader] of Object.entries(modules)) {
    const slug = path.replace('../../../docs/', '').replace('.md', '')
    result[slug] = (await loader()) as string
  }
  return result
}
