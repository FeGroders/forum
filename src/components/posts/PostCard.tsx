import { Link } from 'react-router-dom'
import { MessageSquare, ThumbsUp, ThumbsDown, Eye, Pin, Lock } from 'lucide-react'
import type { Post } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useVotePost } from '@/hooks/usePosts'
import { useAuth } from '@/context/AuthContext'
import { formatRelativeTime, getInitials, cn } from '@/lib/utils'
import { toast } from '@/hooks/useToast'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth()
  const voteMutation = useVotePost()

  function handleVote(type: 1 | -1) {
    if (!user) {
      toast({ title: 'Faça login para votar', variant: 'destructive' })
      return
    }
    voteMutation.mutate({ postId: post.id, voteType: type })
  }

  return (
    <article className="flex gap-3 p-4 border rounded-xl bg-card hover:border-primary/30 transition-colors group">
      {/* Votos - coluna lateral */}
      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', post.user_vote === 1 && 'text-primary bg-primary/10')}
          onClick={() => handleVote(1)}
          disabled={voteMutation.isPending}
          aria-label="Upvote"
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <span className={cn('text-sm font-semibold tabular-nums', post.vote_score && post.vote_score > 0 ? 'text-primary' : post.vote_score && post.vote_score < 0 ? 'text-destructive' : 'text-muted-foreground')}>
          {post.vote_score ?? 0}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', post.user_vote === -1 && 'text-destructive bg-destructive/10')}
          onClick={() => handleVote(-1)}
          disabled={voteMutation.isPending}
          aria-label="Downvote"
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {post.category && (
            <Link
              to={`/category/${post.category.slug}`}
              className="font-medium hover:text-foreground transition-colors"
              style={{ color: post.category.color }}
            >
              #{post.category.name}
            </Link>
          )}
          <span>·</span>
          <Link
            to={`/profile/${post.author?.username}`}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Avatar className="h-4 w-4">
              <AvatarImage src={post.author?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[8px]">{getInitials(post.author?.username)}</AvatarFallback>
            </Avatar>
            {post.author?.username}
          </Link>
          <span>·</span>
          <time dateTime={post.created_at}>{formatRelativeTime(post.created_at)}</time>
          {post.is_pinned && (
            <Badge variant="secondary" className="gap-1 py-0 text-[10px]">
              <Pin className="h-2.5 w-2.5" />
              Fixado
            </Badge>
          )}
          {post.is_locked && (
            <Badge variant="outline" className="gap-1 py-0 text-[10px]">
              <Lock className="h-2.5 w-2.5" />
              Fechado
            </Badge>
          )}
        </div>

        {/* Título */}
        <Link to={`/post/${post.id}`}>
          <h2 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Preview do conteúdo */}
        <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 5).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-[11px] py-0 font-normal">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Rodapé */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Link to={`/post/${post.id}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
            <MessageSquare className="h-3.5 w-3.5" />
            {post.comment_count ?? 0} comentário{post.comment_count !== 1 ? 's' : ''}
          </Link>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.view_count}
          </span>
        </div>
      </div>
    </article>
  )
}
