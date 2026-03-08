import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Profile } from '@/types'

export function useProfile(username: string) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!username,
  })
}

export function useUserPosts(userId: string) {
  return useQuery({
    queryKey: ['user-posts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          category:categories(id, name, slug, color),
          tags:post_tags(tag:tags(id, name, slug))
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data?.map((p) => ({ ...p, tags: p.tags?.map((pt: { tag: unknown }) => pt.tag) ?? [] }))
    },
    enabled: !!userId,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user, refreshProfile } = useAuth()

  return useMutation({
    mutationFn: async (payload: Partial<Pick<Profile, 'full_name' | 'bio' | 'website' | 'avatar_url'>>) => {
      if (!user) throw new Error('Não autenticado')

      const { data, error } = await supabase
        .from('profiles')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data as Profile
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', data.username] })
      refreshProfile()
    },
  })
}
