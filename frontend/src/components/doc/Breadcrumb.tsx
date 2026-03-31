import { Link } from 'react-router-dom'
import { navigation } from '../../data/navigation'

interface Props {
  slug: string
}

export function Breadcrumb({ slug }: Props) {
  const parts = slug.split('/')
  const categorySlug = parts[0]
  const category = navigation.find((cat) =>
    cat.items.some((item) => item.slug.startsWith(categorySlug))
  )
  const item = category?.items.find((i) => i.slug === slug)

  return (
    <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
      <Link to="/" className="hover:text-slate-200 transition-colors">
        ホーム
      </Link>
      {category && (
        <>
          <span>/</span>
          <span className="text-slate-300">{category.title}</span>
        </>
      )}
      {item && (
        <>
          <span>/</span>
          <span className="text-slate-100">{item.title}</span>
        </>
      )}
    </nav>
  )
}
