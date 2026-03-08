import { useRef, useCallback } from 'react'
import { usePosts } from '@/hooks/usePosts'
import PostCard from './PostCard'
import type { PostFilters } from '@/types'
import { Loader2, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PostListProps {
  filters?: PostFilters
}

export default function PostList({ filters = {} }: PostListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = usePosts(filters)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })
      if (node) observerRef.current.observe(node)
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Erro ao carregar posts. Tente novamente.</p>
        <Button variant="outline" className="mt-3" onClick={() => window.location.reload()}>
          Recarregar
        </Button>
      </div>
    )
  }

  const posts = data?.pages.flatMap((p) => p.data) ?? []

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <Inbox className="h-10 w-10" />
        <p className="text-sm">Nenhum post encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Sentinel para infinite scroll */}
      <div ref={loadMoreRef} className="py-2 flex justify-center">
        {isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
      </div>
    </div>
  )
}
