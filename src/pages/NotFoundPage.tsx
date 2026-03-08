import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Code2 } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <Code2 className="h-12 w-12 text-muted-foreground/40" />
      <div>
        <h1 className="text-4xl font-bold text-muted-foreground">404</h1>
        <p className="text-lg font-semibold mt-1">Página não encontrada</p>
        <p className="text-sm text-muted-foreground mt-1">
          A página que você procura não existe ou foi removida.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  )
}
