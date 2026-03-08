import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useCreatePost, useCategories, useTags } from '@/hooks/usePosts'
import { toast } from '@/hooks/useToast'

const schema = z.object({
  title: z.string().min(5, 'Título muito curto (mín. 5 caracteres)').max(300, 'Título muito longo'),
  content: z.string().min(20, 'Conteúdo muito curto (mín. 20 caracteres)'),
  category_id: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function PostForm() {
  const navigate = useNavigate()
  const createPost = useCreatePost()
  const { data: categories } = useCategories()
  const { data: tags } = useTags()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagSearch, setTagSearch] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const filteredTags = tags?.filter(
    (t) => t.name.includes(tagSearch.toLowerCase()) && !selectedTags.includes(t.id)
  )

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : prev.length < 5 ? [...prev, tagId] : prev
    )
  }

  async function onSubmit(data: FormData) {
    try {
      const post = await createPost.mutateAsync({
        ...data,
        tag_ids: selectedTags,
      })
      toast({ title: 'Post criado com sucesso!' })
      navigate(`/post/${post.id}`)
    } catch {
      toast({ title: 'Erro ao criar post', description: 'Tente novamente.', variant: 'destructive' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Título */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          placeholder="Uma pergunta clara e objetiva..."
          {...register('title')}
          aria-invalid={!!errors.title}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      {/* Categoria */}
      <div className="space-y-1.5">
        <Label htmlFor="category">Categoria</Label>
        <select
          id="category"
          {...register('category_id')}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Sem categoria</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags <span className="text-muted-foreground font-normal">(máx. 5)</span></Label>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map((tagId) => {
              const tag = tags?.find((t) => t.id === tagId)
              return tag ? (
                <Badge key={tagId} variant="default" className="gap-1 cursor-pointer" onClick={() => toggleTag(tagId)}>
                  {tag.name}
                  <X className="h-3 w-3" />
                </Badge>
              ) : null
            })}
          </div>
        )}

        <Input
          placeholder="Buscar tags..."
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          className="h-8 text-sm"
        />

        {tagSearch && (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {filteredTags?.slice(0, 15).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => { toggleTag(tag.id); setTagSearch('') }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="space-y-1.5">
        <Label htmlFor="content">Conteúdo</Label>
        <Textarea
          id="content"
          placeholder="Descreva sua dúvida ou compartilhe seu conhecimento com detalhes..."
          className="min-h-[200px] resize-y"
          {...register('content')}
          aria-invalid={!!errors.content}
        />
        {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={createPost.isPending} className="flex-1 sm:flex-none">
          {createPost.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Publicar post
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
