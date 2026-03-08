import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Globe, Pencil, Calendar } from 'lucide-react'
import { useProfile, useUserPosts, useUpdateProfile } from '@/hooks/useProfile'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import PostCard from '@/components/posts/PostCard'
import { formatDate, getInitials } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import type { Post } from '@/types'

const editSchema = z.object({
  full_name: z.string().min(2).max(80).optional().or(z.literal('')),
  bio: z.string().max(300).optional().or(z.literal('')),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  avatar_url: z.string().url('URL inválida').optional().or(z.literal('')),
})

type EditFormData = z.infer<typeof editSchema>

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const { data: profile, isLoading } = useProfile(username!)
  const { data: posts } = useUserPosts(profile?.id ?? '')
  const updateProfile = useUpdateProfile()
  const [editOpen, setEditOpen] = useState(false)

  const isOwner = user?.id === profile?.id

  const { register, handleSubmit, formState: { errors } } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    values: {
      full_name: profile?.full_name ?? '',
      bio: profile?.bio ?? '',
      website: profile?.website ?? '',
      avatar_url: profile?.avatar_url ?? '',
    },
  })

  async function onEditSubmit(data: EditFormData) {
    try {
      await updateProfile.mutateAsync({
        full_name: data.full_name || undefined,
        bio: data.bio || undefined,
        website: data.website || undefined,
        avatar_url: data.avatar_url || undefined,
      })
      toast({ title: 'Perfil atualizado!' })
      setEditOpen(false)
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Usuário não encontrado.</p>
        <Button variant="outline" className="mt-3" asChild>
          <Link to="/">Voltar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Card do perfil */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 text-xl">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback>{getInitials(profile.full_name ?? profile.username)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="text-xl font-bold">{profile.full_name ?? profile.username}</h1>
              <p className="text-muted-foreground text-sm">@{profile.username}</p>

              {profile.bio && (
                <p className="text-sm leading-relaxed max-w-prose">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {new URL(profile.website).hostname}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Membro desde {formatDate(profile.created_at)}
                </span>
              </div>
            </div>

            {isOwner && (
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5 shrink-0">
                <Pencil className="h-3.5 w-3.5" />
                Editar perfil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Posts do usuário */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Posts de @{profile.username}
        </h2>
        {!posts?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum post ainda.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post as Post} />)
        )}
      </div>

      {/* Modal de edição */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nome completo</Label>
              <Input placeholder="João Silva" {...register('full_name')} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Textarea
                placeholder="Fala um pouco sobre você..."
                className="resize-none"
                rows={3}
                {...register('bio')}
              />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input placeholder="https://seusite.com" type="url" {...register('website')} />
              {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>URL do Avatar</Label>
              <Input placeholder="https://..." type="url" {...register('avatar_url')} />
              {errors.avatar_url && <p className="text-xs text-destructive">{errors.avatar_url.message}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={updateProfile.isPending} className="flex-1">
                {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
