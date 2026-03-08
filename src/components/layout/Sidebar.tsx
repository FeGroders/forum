import { Link, useParams, useLocation } from 'react-router-dom'
import { Hash, TrendingUp, Clock, Star } from 'lucide-react'
import { useCategories } from '@/hooks/usePosts'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const sortLinks = [
  { href: '/', label: 'Mais recentes', icon: Clock },
  { href: '/?sort=top', label: 'Em alta', icon: TrendingUp },
  { href: '/?sort=top&period=week', label: 'Top da semana', icon: Star },
]

export default function Sidebar() {
  const { data: categories } = useCategories()
  const { slug } = useParams()
  const location = useLocation()

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] sticky top-16">
      <div className="space-y-4 pb-6">
        {/* Feed */}
        <div>
          <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Feed</h3>
          <nav className="space-y-0.5">
            {sortLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                  location.pathname === link.href && location.search === (link.href.includes('?') ? '?' + link.href.split('?')[1] : '')
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Separator />

        {/* Categorias */}
        <div>
          <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Categorias
          </h3>
          <nav className="space-y-0.5">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                  slug === cat.slug
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <Hash className="h-3.5 w-3.5" style={{ color: cat.color }} />
                </span>
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </ScrollArea>
  )
}
