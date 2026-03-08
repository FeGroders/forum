import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, MessageSquare, ThumbsUp, ThumbsDown, CornerDownRight } from 'lucide-react'
import { useNotifications, useMarkAllRead, useMarkRead } from '@/hooks/useNotifications'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatRelativeTime, getInitials, cn } from '@/lib/utils'
import type { Notification } from '@/types'

const notifIcons = {
  comment: MessageSquare,
  reply: CornerDownRight,
  upvote: ThumbsUp,
  downvote: ThumbsDown,
  mention: Bell,
}

const notifMessages = {
  comment: 'comentou no seu post',
  reply: 'respondeu seu comentário',
  upvote: 'curtiu seu post',
  downvote: 'não curtiu seu post',
  mention: 'te mencionou',
}

interface NotificationPanelProps {
  onClose: () => void
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const { data: notifications, isLoading } = useNotifications()
  const markAllRead = useMarkAllRead()
  const markRead = useMarkRead()

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  function handleNotifClick(notif: Notification) {
    if (!notif.is_read) markRead.mutate(notif.id)
    onClose()
  }

  const unread = notifications?.filter((n) => !n.is_read).length ?? 0

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 w-80 sm:w-96 rounded-xl border bg-popover shadow-lg z-50"
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">Notificações {unread > 0 && <span className="text-primary">({unread})</span>}</h3>
        {unread > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <Check className="h-3.5 w-3.5" />
            Marcar todas
          </Button>
        )}
      </div>

      <ScrollArea className="max-h-96">
        {isLoading ? (
          <div className="flex justify-center py-8 text-muted-foreground text-sm">Carregando...</div>
        ) : !notifications?.length ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <Bell className="h-8 w-8 opacity-30" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notif) => {
              const Icon = notifIcons[notif.type]
              const link = notif.post_id
                ? `/post/${notif.post_id}${notif.comment_id ? `#comment-${notif.comment_id}` : ''}`
                : '/'

              return (
                <Link
                  key={notif.id}
                  to={link}
                  onClick={() => handleNotifClick(notif)}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors',
                    !notif.is_read && 'bg-primary/5'
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notif.actor?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{getInitials(notif.actor?.username)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Icon className="h-2.5 w-2.5" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug">
                      <span className="font-semibold">@{notif.actor?.username}</span>{' '}
                      {notifMessages[notif.type]}
                      {notif.post?.title && (
                        <span className="text-muted-foreground"> "{notif.post.title}"</span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{formatRelativeTime(notif.created_at)}</p>
                  </div>

                  {!notif.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
