import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Plus, LogOut, User, Menu, Code2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useUnreadCount } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import NotificationPanel from '@/components/notifications/NotificationPanel'
import { getInitials } from '@/lib/utils'
import MobileNav from './MobileNav'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const { data: unreadCount = 0 } = useUnreadCount()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex h-14 items-center gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-primary shrink-0">
            <Code2 className="h-5 w-5" />
            <span className="hidden sm:inline">DevForum</span>
          </Link>

          {/* Busca - flex em mobile, expandida em desktop */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar posts..."
                className="pl-8 h-8 text-sm"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 ml-auto">
            {user ? (
              <>
                {/* Novo post */}
                <Button size="sm" className="hidden sm:flex gap-1" asChild>
                  <Link to="/new-post">
                    <Plus className="h-4 w-4" />
                    <span>Post</span>
                  </Link>
                </Button>

                {/* Notificações */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => setNotifOpen((v) => !v)}
                    aria-label="Notificações"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                  {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
                </div>

                {/* Menu do usuário */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url ?? undefined} />
                        <AvatarFallback>{getInitials(profile?.full_name ?? profile?.username)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{profile?.full_name ?? profile?.username}</p>
                      <p className="text-xs text-muted-foreground">@{profile?.username}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={`/profile/${profile?.username}`} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Meu Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="sm:hidden">
                      <Link to="/new-post" className="cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Post
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Criar conta</Link>
                </Button>
              </>
            )}

            {/* Menu mobile para categorias */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </header>
  )
}
