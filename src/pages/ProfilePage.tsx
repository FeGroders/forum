import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Globe, Pencil, Calendar, Github } from 'lucide-react'
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

// Ícones SVG para redes sem equivalente no Lucide
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  {
    key: 'github' as const,
    label: 'GitHub',
    placeholder: 'seunome',
    prefix: 'https://github.com/',
    displayPrefix: 'github.com/',
    Icon: Github,
  },
  {
    key: 'twitter' as const,
    label: 'Twitter / X',
    placeholder: 'seunome',
    prefix: 'https://x.com/',
    displayPrefix: 'x.com/',
    Icon: TwitterIcon,
  },
  {
    key: 'linkedin' as const,
    label: 'LinkedIn',
    placeholder: 'seunome',
    prefix: 'https://linkedin.com/in/',
    displayPrefix: 'linkedin.com/in/',
    Icon: LinkedInIcon,
  },
  {
    key: 'instagram' as const,
    label: 'Instagram',
    placeholder: 'seunome',
    prefix: 'https://instagram.com/',
    displayPrefix: 'instagram.com/',
    Icon: InstagramIcon,
  },
  {
    key: 'discord' as const,
    label: 'Discord',
    placeholder: 'seunome',
    prefix: 'https://discord.com/users/',
    displayPrefix: 'discord.com/users/',
    Icon: DiscordIcon,
  },
]

const editSchema = z.object({
  full_name: z.string().min(2).max(80).optional().or(z.literal('')),
  bio: z.string().max(300).optional().or(z.literal('')),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  avatar_url: z.string().url('URL inválida').optional().or(z.literal('')),
  github: z.string().max(60).optional().or(z.literal('')),
  twitter: z.string().max(60).optional().or(z.literal('')),
  linkedin: z.string().max(100).optional().or(z.literal('')),
  instagram: z.string().max(60).optional().or(z.literal('')),
  discord: z.string().max(60).optional().or(z.literal('')),
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
      github: profile?.github ?? '',
      twitter: profile?.twitter ?? '',
      linkedin: profile?.linkedin ?? '',
      instagram: profile?.instagram ?? '',
      discord: profile?.discord ?? '',
    },
  })

  async function onEditSubmit(data: EditFormData) {
    try {
      await updateProfile.mutateAsync({
        full_name: data.full_name || undefined,
        bio: data.bio || undefined,
        website: data.website || undefined,
        avatar_url: data.avatar_url || undefined,
        github: data.github || undefined,
        twitter: data.twitter || undefined,
        linkedin: data.linkedin || undefined,
        instagram: data.instagram || undefined,
        discord: data.discord || undefined,
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

  const hasSocials = SOCIAL_LINKS.some(({ key }) => !!profile[key])

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

            <div className="flex-1 min-w-0 space-y-1.5">
              <h1 className="text-xl font-bold">{profile.full_name ?? profile.username}</h1>
              <p className="text-muted-foreground text-sm">@{profile.username}</p>

              {profile.bio && (
                <p className="text-sm leading-relaxed max-w-prose">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-0.5">
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

                {hasSocials && SOCIAL_LINKS.map(({ key, label, prefix, Icon }) => {
                  const handle = profile[key]
                  if (!handle) return null
                  return (
                    <a
                      key={key}
                      href={`${prefix}${handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={label}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {handle}
                    </a>
                  )
                })}

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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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

            {/* Redes sociais */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium">Redes sociais <span className="text-muted-foreground font-normal">(apenas o nome de usuário)</span></p>
              {SOCIAL_LINKS.map(({ key, label, placeholder, displayPrefix, Icon }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Label>
                  <div className="flex items-center">
                    <span className="flex items-center h-9 px-3 rounded-l-md border border-r-0 bg-muted text-xs text-muted-foreground select-none whitespace-nowrap">
                      {displayPrefix}
                    </span>
                    <Input
                      placeholder={placeholder}
                      className="rounded-l-none"
                      {...register(key)}
                    />
                  </div>
                </div>
              ))}
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
