import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ThumbsUp, ThumbsDown, MessageSquare, Trash2, CornerDownRight } from 'lucide-react'
import type { Comment } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useVoteComment, useDeleteComment } from '@/hooks/useComments'
import { formatRelativeTime, getInitials, cn } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import CommentForm from './CommentForm'
import MarkdownContent from '@/components/ui/MarkdownContent'

interface CommentCardProps {
  comment: Comment
  postId: string
  depth?: number
}

export default function CommentCard({ comment, postId, depth = 0 }: CommentCardProps) {
  const { user } = useAuth()
  const voteMutation = useVoteComment()
  const deleteMutation = useDeleteComment()
  const [showReply, setShowReply] = useState(false)

  const maxDepth = 3

  function handleVote(type: 1 | -1) {
    if (!user) {
      toast({ title: 'Faça login para votar', variant: 'destructive' })
      return
    }
    voteMutation.mutate({ commentId: comment.id, postId, voteType: type })
  }

  function handleDelete() {
    if (!confirm('Deletar este comentário?')) return
    deleteMutation.mutate({ commentId: comment.id, postId })
  }

  return (
    <div className={cn('flex gap-3', depth > 0 && 'ml-6 pl-4 border-l-2 border-border/60')}>
      {/* Avatar */}
      <Link to={`/profile/${comment.author?.username}`} className="shrink-0 mt-1">
        <Avatar className="h-7 w-7">
          <AvatarImage src={comment.author?.avatar_url ?? undefined} />
          <AvatarFallback className="text-[10px]">{getInitials(comment.author?.username)}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to={`/profile/${comment.author?.username}`} className="font-medium text-foreground hover:text-primary">
            {comment.author?.username}
          </Link>
          <span>·</span>
          <time dateTime={comment.created_at}>{formatRelativeTime(comment.created_at)}</time>
        </div>

        {/* Conteúdo */}
        <MarkdownContent content={comment.content} className="text-sm" />

        {/* Ações */}
        <div className="flex items-center gap-0.5 -ml-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 px-2 text-xs gap-1', comment.user_vote === 1 && 'text-primary')}
            onClick={() => handleVote(1)}
            disabled={voteMutation.isPending}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            {(comment.vote_score ?? 0) > 0 ? comment.vote_score : ''}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 px-2 text-xs', comment.user_vote === -1 && 'text-destructive')}
            onClick={() => handleVote(-1)}
            disabled={voteMutation.isPending}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>

          {user && depth < maxDepth && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 text-muted-foreground"
              onClick={() => setShowReply((v) => !v)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Responder
            </Button>
          )}

          {user?.id === comment.author_id && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive ml-auto"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Formulário de resposta */}
        {showReply && (
          <div className="pt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <CornerDownRight className="h-3 w-3" />
              <span>Respondendo a @{comment.author?.username}</span>
            </div>
            <CommentForm
              postId={postId}
              parentId={comment.id}
              placeholder={`Responder @${comment.author?.username}...`}
              onSuccess={() => setShowReply(false)}
            />
          </div>
        )}

        {/* Respostas (recursivo) */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-4">
            {comment.replies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
