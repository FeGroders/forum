import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Hash, TrendingUp, Clock, Star } from 'lucide-react'
import { useCategories } from '@/hooks/usePosts'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const { data: categories } = useCategories()
  const location = useLocation()

  // Fecha ao mudar de rota
  useEffect(() => {
    onClose()
  }, [location.pathname])

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-xl lg:hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Feed</h3>
              <nav className="space-y-0.5">
                {[
                  { href: '/', label: 'Mais recentes', icon: Clock },
                  { href: '/?sort=top', label: 'Em alta', icon: TrendingUp },
                  { href: '/?sort=top&period=week', label: 'Top da semana', icon: Star },
                ].map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors',
                      'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <Separator />

            <div>
              <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Categorias
              </h3>
              <nav className="space-y-0.5">
                {categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Hash className="h-4 w-4 shrink-0" style={{ color: cat.color }} />
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
