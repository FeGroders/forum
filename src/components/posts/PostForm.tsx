import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X, Eye, PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import MarkdownContent from '@/components/ui/MarkdownContent'
import { useCreatePost, useCategories, useTags } from '@/hooks/usePosts'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/useToast'

const schema = z.object({
  title: z.string().min(5, 'Título muito curto (mín. 5 caracteres)').max(300, 'Título muito longo'),
  content: z.string().min(20, 'Conteúdo muito curto (mín. 20 caracteres)'),
  category_id: z.string().transform((v) => v || undefined).optional(),
})

type FormData = z.infer<typeof schema>

export default function PostForm() {
  const navigate = useNavigate()
  const createPost = useCreatePost()
  const { data: categories } = useCategories()
  const { data: tags } = useTags()
  // Tags: podem ser existentes (id definido) ou novas (id null, criadas no submit)
  const [selectedTags, setSelectedTags] = useState<{ id: string; name: string }[]>([])
  const [tagSearch, setTagSearch] = useState('')
  const [creatingTag, setCreatingTag] = useState(false)
  const [contentTab, setContentTab] = useState<'escrever' | 'preview'>('escrever')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const contentValue = useWatch({ control, name: 'content', defaultValue: '' })

  const selectedNames = selectedTags.map((t) => t.name.toLowerCase())
  const filteredTags = tags?.filter(
    (t) => t.name.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedNames.includes(t.name.toLowerCase())
  )

  // Verifica se o texto digitado não existe como tag nem está já selecionado
  const trimmedSearch = tagSearch.trim()
  const canCreateTag =
    trimmedSearch.length > 0 &&
    selectedTags.length < 5 &&
    !selectedNames.includes(trimmedSearch.toLowerCase()) &&
    !tags?.some((t) => t.name.toLowerCase() === trimmedSearch.toLowerCase())

  function addExistingTag(tag: { id: string; name: string }) {
    if (selectedTags.length >= 5) return
    setSelectedTags((prev) => [...prev, { id: tag.id, name: tag.name }])
    setTagSearch('')
  }

  async function addNewTag(name: string) {
    if (selectedTags.length >= 5 || creatingTag) return
    const trimmed = name.trim()
    if (!trimmed) return

    setCreatingTag(true)
    try {
      const slug = trimmed
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { data: created, error } = await supabase
        .from('tags')
        .upsert({ name: trimmed, slug }, { onConflict: 'slug' })
        .select('id, name')
        .single()

      if (error) throw error
      setSelectedTags((prev) => [...prev, { id: created.id, name: created.name }])
      setTagSearch('')
    } catch {
      toast({ title: 'Erro ao criar tag', variant: 'destructive' })
    } finally {
      setCreatingTag(false)
    }
  }

  function removeTag(name: string) {
    setSelectedTags((prev) => prev.filter((t) => t.name !== name))
  }

  async function onSubmit(data: FormData) {
    try {
      const post = await createPost.mutateAsync({
        ...data,
        tag_ids: selectedTags.map((t) => t.id),
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
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="default"
                className="gap-1 cursor-pointer"
                onClick={() => removeTag(tag.name)}
              >
                {tag.name}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}

        <Input
          placeholder="Buscar ou criar tag..."
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (filteredTags && filteredTags.length > 0) {
                addExistingTag(filteredTags[0])
              } else if (canCreateTag) {
                void addNewTag(trimmedSearch)
              }
            }
          }}
          className="h-8 text-sm"
          disabled={selectedTags.length >= 5}
        />

        {tagSearch && (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {filteredTags?.slice(0, 15).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => addExistingTag(tag)}
              >
                {tag.name}
              </Badge>
            ))}
            {canCreateTag && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent border-dashed text-muted-foreground hover:text-foreground gap-1"
                onClick={() => addNewTag(trimmedSearch)}
              >
                {creatingTag ? <Loader2 className="h-3 w-3 animate-spin" /> : '+'}
                {creatingTag ? 'Criando...' : `Criar "${trimmedSearch}"`}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Conteúdo</Label>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Suporta</span>
            <span className="font-mono bg-muted px-1 rounded text-[11px]">Markdown</span>
          </div>
        </div>

        {/* Abas Escrever / Preview */}
        <div className="border rounded-md overflow-hidden">
          <div className="flex border-b bg-muted/40">
            <button
              type="button"
              onClick={() => setContentTab('escrever')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                contentTab === 'escrever'
                  ? 'bg-background text-foreground border-b-2 border-primary -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PenLine className="h-3.5 w-3.5" />
              Escrever
            </button>
            <button
              type="button"
              onClick={() => setContentTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                contentTab === 'preview'
                  ? 'bg-background text-foreground border-b-2 border-primary -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          </div>

          {contentTab === 'escrever' ? (
            <Textarea
              id="content"
              placeholder="Descreva sua dúvida ou compartilhe seu conhecimento com detalhes...&#10;&#10;Suporte a **negrito**, *itálico*, `código inline`, blocos de código e muito mais."
              className="min-h-[200px] resize-y border-0 rounded-none focus-visible:ring-0 font-mono text-sm"
              {...register('content')}
              aria-invalid={!!errors.content}
            />
          ) : (
            <div className="min-h-[200px] p-3">
              {contentValue?.trim() ? (
                <MarkdownContent content={contentValue} />
              ) : (
                <p className="text-sm text-muted-foreground italic">Nada para visualizar ainda...</p>
              )}
            </div>
          )}
        </div>

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
