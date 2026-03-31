import { NavLink } from 'react-router-dom'
import { navigation } from '../../data/navigation'

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
        {navigation.map((category) => (
          <div key={category.title} className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2 px-2">
              {category.icon} {category.title}
            </p>
            <ul className="space-y-0.5">
              {category.items.map((item) => (
                <li key={item.slug}>
                  <NavLink
                    to={`/docs/${item.slug}`}
                    className={({ isActive }) =>
                      `block px-2 py-1.5 rounded text-sm transition-colors ${
                        isActive
                          ? 'bg-violet-500/20 text-violet-300 font-medium'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`
                    }
                  >
                    {item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
