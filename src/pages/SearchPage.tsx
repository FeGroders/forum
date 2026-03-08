import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import PostList from '@/components/posts/PostList'

export default function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold">
          {query ? (
            <>Resultados para <span className="text-primary">"{query}"</span></>
          ) : (
            'Busca'
          )}
        </h1>
      </div>

      {query ? (
        <PostList filters={{ search: query }} />
      ) : (
        <p className="text-muted-foreground text-sm text-center py-12">
          Digite algo na barra de busca para pesquisar posts.
        </p>
      )}
    </div>
  )
}
