import { useSearchParams, Link } from "react-router-dom"
import { Plus, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PostList from '@/components/posts/PostList'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { PostFilters } from '@/types'

const sortOptions = [
  { value: 'latest', label: 'Recentes', icon: Clock },
  { value: 'top', label: 'Em alta', icon: TrendingUp },
] as const

export default function HomePage() {
  const [params] = useSearchParams()
  const { user } = useAuth()
  const sort = (params.get('sort') ?? 'latest') as PostFilters['sortBy']

  const filters: PostFilters = { sortBy: sort }

  return (
    <div className="space-y-4">
      {/* Cabeçalho mobile com botão de novo post */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {sortOptions.map((opt) => (
            <Link
              key={opt.value}
              to={opt.value === 'latest' ? '/' : `/?sort=${opt.value}`}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                sort === opt.value
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <opt.icon className="h-3.5 w-3.5" />
              {opt.label}
            </Link>
          ))}
        </div>

        {user && (
          <Button size="sm" asChild className="lg:hidden">
            <Link to="/new-post">
              <Plus className="h-4 w-4" />
              Post
            </Link>
          </Button>
        )}
      </div>

      <PostList filters={filters} />
    </div>
  )
}
