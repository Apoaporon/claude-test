import { Link } from 'react-router-dom'
import { navigation } from '../data/navigation'

export function HomePage() {
  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Claude Code ドキュメント
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl">
          Claude Codeの使い方・機能・ベストプラクティスをまとめたドキュメントサイトです。
          サイドバーまたは下のカテゴリから読み始めてください。
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {navigation.map((category) => (
          <div key={category.title} className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
            <div className="text-3xl mb-3">{category.icon}</div>
            <h2 className="text-lg font-semibold text-white mb-2">{category.title}</h2>
            <p className="text-sm text-slate-400 mb-4">{category.description}</p>
            <ul className="space-y-1">
              {category.items.map((item) => (
                <li key={item.slug}>
                  <Link
                    to={`/docs/${item.slug}`}
                    className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                  >
                    <span>→</span>
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
