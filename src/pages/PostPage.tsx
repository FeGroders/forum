import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ThumbsUp, ThumbsDown, ArrowLeft, MessageSquare,
  Eye, Pin, Lock, Trash2, Hash
} from 'lucide-react'
import { usePost, useVotePost, useDeletePost } from '@/hooks/usePosts'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import CommentList from '@/components/comments/CommentList'
import { formatDate, formatRelativeTime, getInitials, cn } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import { Loader2 } from 'lucide-react'

export default function PostPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: post, isLoading, isError } = usePost(id!)
  const voteMutation = useVotePost()
  const deleteMutation = useDeletePost()

  function handleVote(type: 1 | -1) {
    if (!user) {
      toast({ title: 'Faça login para votar', variant: 'destructive' })
      return
    }
    voteMutation.mutate({ postId: id!, voteType: type })
  }

  async function handleDelete() {
    if (!confirm('Deletar este post permanentemente?')) return
    await deleteMutation.mutateAsync(id!)
    toast({ title: 'Post deletado.' })
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-muted-foreground">Post não encontrado.</p>
        <Button variant="outline" asChild>
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Volta */}
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      {/* Post */}
      <article className="border rounded-xl bg-card p-5 sm:p-6 space-y-4">
        {/* Categoria e badges */}
        <div className="flex flex-wrap items-center gap-2">
          {post.category && (
            <Link
              to={`/category/${post.category.slug}`}
              className="flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: post.category.color }}
            >
              <Hash className="h-3.5 w-3.5" />
              {post.category.name}
            </Link>
          )}
          {post.is_pinned && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Pin className="h-3 w-3" /> Fixado
            </Badge>
          )}
          {post.is_locked && (
            <Badge variant="outline" className="gap-1 text-xs">
              <Lock className="h-3 w-3" /> Fechado
            </Badge>
          )}
        </div>

        {/* Título */}
        <h1 className="text-xl sm:text-2xl font-bold leading-snug">{post.title}</h1>

        {/* Autor e data */}
        <div className="flex items-center gap-2">
          <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-2 hover:opacity-80">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">{getInitials(post.author?.full_name ?? post.author?.username)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-tight">{post.author?.full_name ?? post.author?.username}</p>
              <p className="text-xs text-muted-foreground">@{post.author?.username}</p>
            </div>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <time className="text-xs text-muted-foreground" dateTime={post.created_at} title={formatDate(post.created_at)}>
            {formatRelativeTime(post.created_at)}
          </time>
        </div>

        {/* Conteúdo */}
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
          {post.content}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs font-normal">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <Separator />

        {/* Ações */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Votos */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
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
            <span className={cn('text-sm font-semibold px-1 tabular-nums min-w-[2ch] text-center',
              (post.vote_score ?? 0) > 0 ? 'text-primary' : (post.vote_score ?? 0) < 0 ? 'text-destructive' : 'text-muted-foreground'
            )}>
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

          {/* Meta */}
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground px-2">
            <MessageSquare className="h-3.5 w-3.5" />
            {post.comment_count} comentário{post.comment_count !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            {post.view_count} visualização{post.view_count !== 1 ? 'ões' : ''}
          </span>

          {/* Delete (autor) */}
          {user?.id === post.author_id && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive ml-auto gap-1.5"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Deletar
            </Button>
          )}
        </div>
      </article>

      {/* Comentários */}
      <CommentList postId={id!} />
    </div>
  )
}
