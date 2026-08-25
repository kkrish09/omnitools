import { Link, useParams } from 'react-router-dom'
import { Crown } from 'lucide-react'
import { getCategory, toolsByCategory, isPremiumTool } from '../lib/tools'
import { useMeta } from '../lib/utils'
import { NotFound } from './StaticPages'

export default function CategoryPage() {
  const { cat } = useParams()
  const category = getCategory(cat ?? '')
  useMeta(category ? `${category.label} — Free Online Tools | OmniTools` : 'Not found — OmniTools')
  if (!category) return <NotFound />

  const tools = toolsByCategory(category.id)

  return (
    <div>
      <nav className="mb-4 text-sm text-zinc-500">
        <Link to="/" className="hover:text-indigo-500">Home</Link> / {category.label}
      </nav>
      <div className="mb-8 flex items-start gap-4">
        <span style={{ display: 'flex', width: '3.5rem', height: '3.5rem', flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-xl)', background: `linear-gradient(135deg, ${category.gradient.replace(',', ', ')})`, color: 'white' }}>
          <category.icon size={28} />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{category.label}</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">{category.tagline}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.id}
            to={`/t/${t.id}`}
            className="card group p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-700"
          >
            <div className="flex items-center gap-2">
              <t.icon className="h-7 w-7 text-indigo-500" />
              {isPremiumTool(t.id) && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">PRO</span>}
            </div>
            <h2 className="mt-3 font-semibold group-hover:text-indigo-500">{t.name}</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
