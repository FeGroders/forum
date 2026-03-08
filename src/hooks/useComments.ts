import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Comment } from '@/types'

export function useComments(postId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!comments_author_id_fkey(id, username, avatar_url, full_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Busca votos do usuário
      let userVotes: Map<string, number> = new Map()
      if (user && data) {
        const commentIds = data.map((c) => c.id)
        const { data: votes } = await supabase
          .from('votes')
          .select('comment_id, vote_type')
          .eq('user_id', user.id)
          .in('comment_id', commentIds)

        userVotes = new Map(votes?.map((v) => [v.comment_id, v.vote_type]))
      }

      // Busca score de votos para cada comentário
      const commentsWithVotes = await Promise.all(
        (data ?? []).map(async (comment) => {
          const { data: votes } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('comment_id', comment.id)

          const score = votes?.reduce((sum, v) => sum + v.vote_type, 0) ?? 0

          return {
            ...comment,
            vote_score: score,
            user_vote: userVotes.get(comment.id) ?? null,
          } as Comment
        })
      )

      // Organiza em árvore (raiz + replies)
      const roots: Comment[] = []
      const map = new Map<string, Comment>()

      commentsWithVotes.forEach((c) => {
        map.set(c.id, { ...c, replies: [] })
      })

      map.forEach((comment) => {
        if (comment.parent_id && map.has(comment.parent_id)) {
          const parent = map.get(comment.parent_id)!
          parent.replies = parent.replies ?? []
          parent.replies.push(comment)
        } else {
          roots.push(comment)
        }
      })

      return roots
    },
    enabled: !!postId,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (payload: { content: string; post_id: string; parent_id?: string }) => {
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('comments')
        .insert({ ...payload, author_id: user.id })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_data, { post_id }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', post_id] })
      queryClient.invalidateQueries({ queryKey: ['post', post_id] })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      const { error } = await supabase.from('comments').delete().eq('id', commentId)
      if (error) throw error
      return postId
    },
    onSuccess: (postId) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}

export function useVoteComment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ commentId, postId, voteType }: { commentId: string; postId: string; voteType: 1 | -1 }) => {
      if (!user) throw new Error('Usuário não autenticado')

      const { data: existing } = await supabase
        .from('votes')
        .select('id, vote_type')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        if (existing.vote_type === voteType) {
          await supabase.from('votes').delete().eq('id', existing.id)
        } else {
          await supabase.from('votes').update({ vote_type: voteType }).eq('id', existing.id)
        }
      } else {
        await supabase.from('votes').insert({ user_id: user.id, comment_id: commentId, vote_type: voteType })
      }

      return postId
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}
