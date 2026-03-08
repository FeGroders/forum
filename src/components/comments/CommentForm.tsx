import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import MarkdownContent from '@/components/ui/MarkdownContent'
import { useCreateComment } from '@/hooks/useComments'
import { useAuth } from '@/context/AuthContext'
import { toast } from '@/hooks/useToast'
import { getInitials } from '@/lib/utils'

const schema = z.object({
  content: z.string().min(2, 'Comentário muito curto').max(5000, 'Comentário muito longo'),
})

type FormData = z.infer<typeof schema>

interface CommentFormProps {
  postId: string
  parentId?: string
  onSuccess?: () => void
  placeholder?: string
}

export default function CommentForm({ postId, parentId, onSuccess, placeholder }: CommentFormProps) {
  const { user, profile } = useAuth()
  const createComment = useCreateComment()
  const [focused, setFocused] = useState(false)

  const [commentTab, setCommentTab] = useState<'escrever' | 'preview'>('escrever')

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const contentValue = useWatch({ control, name: 'content', defaultValue: '' })

  async function onSubmit(data: FormData) {
    try {
      await createComment.mutateAsync({ content: data.content, post_id: postId, parent_id: parentId })
      reset()
      setFocused(false)
      setCommentTab('escrever')
      onSuccess?.()
    } catch {
      toast({ title: 'Erro ao comentar', variant: 'destructive' })
    }
  }

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        <a href="/login" className="text-primary hover:underline">Faça login</a> para comentar.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
        <AvatarImage src={profile?.avatar_url ?? undefined} />
        <AvatarFallback className="text-xs">{getInitials(profile?.username)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        {focused ? (
          <div className="border rounded-md overflow-hidden">
            <div className="flex border-b bg-muted/40">
              <button
                type="button"
                onClick={() => setCommentTab('escrever')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-colors ${
                  commentTab === 'escrever'
                    ? 'bg-background text-foreground border-b-2 border-primary -mb-px'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <PenLine className="h-3 w-3" />
                Escrever
              </button>
              <button
                type="button"
                onClick={() => setCommentTab('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-colors ${
                  commentTab === 'preview'
                    ? 'bg-background text-foreground border-b-2 border-primary -mb-px'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Eye className="h-3 w-3" />
                Preview
              </button>
            </div>

            {commentTab === 'escrever' ? (
              <Textarea
                placeholder={placeholder ?? 'Escreva um comentário... Suporta **Markdown** e `código`.'}
                className="resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm"
                onFocus={() => setFocused(true)}
                {...register('content')}
                rows={4}
              />
            ) : (
              <div className="min-h-[96px] p-3">
                {contentValue?.trim() ? (
                  <MarkdownContent content={contentValue} className="text-sm" />
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nada para visualizar ainda...</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <Textarea
            placeholder={placeholder ?? 'Escreva um comentário...'}
            className="resize-none transition-all"
            onFocus={() => setFocused(true)}
            {...register('content')}
            rows={2}
          />
        )}

        {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}

        {focused && (
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={createComment.isPending}>
              {createComment.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Comentar
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setFocused(false); setCommentTab('escrever'); reset() }}>
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
