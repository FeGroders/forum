import PostForm from '@/components/posts/PostForm'

export default function NewPostPage() {
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold">Novo post</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compartilhe sua dúvida ou conhecimento com a comunidade.
        </p>
      </div>
      <PostForm />
    </div>
  )
}
