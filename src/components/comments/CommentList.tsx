import { Loader2, MessageSquare } from 'lucide-react'
import { useComments } from '@/hooks/useComments'
import CommentCard from './CommentCard'
import CommentForm from './CommentForm'
import { Separator } from '@/components/ui/separator'

interface CommentListProps {
  postId: string
}

export default function CommentList({ postId }: CommentListProps) {
  const { data: comments, isLoading } = useComments(postId)

  return (
    <section aria-label="Comentários">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h2 className="font-semibold">
          {isLoading ? 'Comentários' : `${comments?.length ?? 0} comentário${comments?.length !== 1 ? 's' : ''}`}
        </h2>
      </div>

      <CommentForm postId={postId} />

      <Separator className="my-5" />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments?.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Seja o primeiro a comentar!
        </p>
      ) : (
        <div className="space-y-5">
          {comments?.map((comment) => (
            <CommentCard key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}
    </section>
  )
}
