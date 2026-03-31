import { useParams } from 'react-router-dom'
import { useDoc } from '../hooks/useDoc'
import { DocViewer } from '../components/doc/DocViewer'
import { Breadcrumb } from '../components/doc/Breadcrumb'

export function DocPage() {
  const { '*': slug } = useParams()
  const { content, loading, error } = useDoc(slug)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-sm">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-slate-400 mb-2">404</div>
        <div className="text-slate-500 text-sm">{error}</div>
      </div>
    )
  }

  if (!content) return null

  return (
    <div>
      {slug && <Breadcrumb slug={slug} />}
      <DocViewer content={content} />
    </div>
  )
}
