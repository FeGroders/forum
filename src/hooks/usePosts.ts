import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Post, PostFilters } from '@/types'

const PAGE_SIZE = 20

export function usePosts(filters: PostFilters = {}) {
  const { user } = useAuth()

  return useInfiniteQuery({
    queryKey: ['posts', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, username, avatar_url, full_name),
          category:categories(id, name, slug, color, icon),
          tags:post_tags(tag:tags(id, name, slug))
        `)
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1)

      if (filters.category) {
        query = query.eq('category.slug', filters.category)
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
      }

      switch (filters.sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'top':
          query = query.order('view_count', { ascending: false })
          break
        default:
          query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
      }

      const { data, error } = await query
      if (error) throw error

      // Busca votos do usuário logado
      if (user && data) {
        const postIds = data.map((p) => p.id)
        const { data: votes } = await supabase
          .from('votes')
          .select('post_id, vote_type')
          .eq('user_id', user.id)
          .in('post_id', postIds)

        const voteMap = new Map(votes?.map((v) => [v.post_id, v.vote_type]))

        // Busca contagem de votos e comentários
        const postsWithMeta = await Promise.all(
          data.map(async (post) => {
            const [{ count: commentCount }, { data: voteData }] = await Promise.all([
              supabase.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
              supabase.from('votes').select('vote_type').eq('post_id', post.id),
            ])

            const score = voteData?.reduce((sum, v) => sum + v.vote_type, 0) ?? 0

            return {
              ...post,
              tags: post.tags?.map((pt: { tag: unknown }) => pt.tag) ?? [],
              comment_count: commentCount ?? 0,
              vote_score: score,
              user_vote: voteMap.get(post.id) ?? null,
            }
          })
        )

        return { data: postsWithMeta as Post[], nextPage: data.length === PAGE_SIZE ? pageParam + 1 : undefined }
      }

      return {
        data: data?.map((p) => ({ ...p, tags: p.tags?.map((pt: { tag: unknown }) => pt.tag) ?? [] })) as Post[],
        nextPage: data && data.length === PAGE_SIZE ? pageParam + 1 : undefined,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })
}

export function usePost(id: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data: post, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, username, avatar_url, full_name, bio),
          category:categories(id, name, slug, color, icon),
          tags:post_tags(tag:tags(id, name, slug))
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // Incrementa view_count




      const [{ data: votes }, { count: commentCount }] = await Promise.all([
        supabase.from('votes').select('vote_type').eq('post_id', id),
        supabase.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', id),
      ])

      const score = votes?.reduce((sum, v) => sum + v.vote_type, 0) ?? 0

      let userVote: number | null = null
      if (user) {
        const { data: myVote } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .single()
        userVote = myVote?.vote_type ?? null
      }

      return {
        ...post,
        tags: post.tags?.map((pt: { tag: unknown }) => pt.tag) ?? [],
        vote_score: score,
        comment_count: commentCount ?? 0,
        user_vote: userVote,
      } as Post
    },
    enabled: !!id,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (payload: {
      title: string
      content: string
      category_id?: string
      tag_ids?: string[]
    }) => {
      if (!user) throw new Error('Usuário não autenticado')

      const { data: post, error } = await supabase
        .from('posts')
        .insert({ title: payload.title, content: payload.content, category_id: payload.category_id, author_id: user.id })
        .select()
        .single()

      if (error) throw error

      if (payload.tag_ids?.length) {
        await supabase.from('post_tags').insert(
          payload.tag_ids.map((tag_id) => ({ post_id: post.id, tag_id }))
        )
      }

      return post
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useVotePost() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ postId, voteType }: { postId: string; voteType: 1 | -1 }) => {
      if (!user) throw new Error('Usuário não autenticado')

      const { data: existing } = await supabase
        .from('votes')
        .select('id, vote_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        if (existing.vote_type === voteType) {
          // Remove voto
          await supabase.from('votes').delete().eq('id', existing.id)
        } else {
          // Muda voto
          await supabase.from('votes').update({ vote_type: voteType }).eq('id', existing.id)
        }
      } else {
        // Novo voto
        await supabase.from('votes').insert({ user_id: user.id, post_id: postId, vote_type: voteType })
      }
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name')
      if (error) throw error
      return data
    },
    staleTime: Infinity,
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tags').select('*').order('name')
      if (error) throw error
      return data
    },
    staleTime: Infinity,
  })
}
