import { useParams } from 'react-router-dom'
import { Hash } from 'lucide-react'
import { useCategories } from '@/hooks/usePosts'
import PostList from '@/components/posts/PostList'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: categories } = useCategories()
  const category = categories?.find((c) => c.slug === slug)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Hash className="h-5 w-5" style={{ color: category?.color }} />
        <div>
          <h1 className="text-lg font-semibold">{category?.name ?? slug}</h1>
          {category?.description && (
            <p className="text-sm text-muted-foreground">{category.description}</p>
          )}
        </div>
      </div>

      <PostList filters={{ category: slug }} />
    </div>
  )
}
