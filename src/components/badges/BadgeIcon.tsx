import type { BadgeDefinition } from '@/lib/badges'

interface BadgeIconProps {
  badge: BadgeDefinition
  size?: 'sm' | 'md'
  onClick?: () => void
}

export function BadgeIcon({ badge, size = 'md', onClick }: BadgeIconProps) {
  const iconSize = size === 'sm' ? 12 : 14
  const Tag = onClick ? 'button' : 'span'

  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80"
      style={{
        borderColor: badge.color + '55',
        backgroundColor: badge.color + '18',
        color: badge.color,
      }}
      title={badge.name}
    >
      <svg
        viewBox="0 0 24 24"
        width={iconSize}
        height={iconSize}
        fill="currentColor"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d={badge.path} />
      </svg>
      {badge.name}
    </Tag>
  )
}
