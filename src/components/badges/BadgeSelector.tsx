import { useState } from 'react'
import { BADGES, BADGES_BY_ID, BADGE_CATEGORIES } from '@/lib/badges'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface BadgeSelectorProps {
  value: string[]
  onChange: (badges: string[]) => void
}

export function BadgeSelector({ value, onChange }: BadgeSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('language')

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((b) => b !== id))
    } else {
      onChange([...value, id])
    }
  }

  const filtered = BADGES.filter((b) => b.category === activeCategory)

  return (
    <div className="space-y-3">
      {/* Selected badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-md bg-muted/50 border">
          {value.map((id) => {
            const badge = BADGES_BY_ID[id]
            if (!badge) return null
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full border pl-2 pr-1 py-0.5 text-xs font-medium"
                style={{
                  borderColor: badge.color + '55',
                  backgroundColor: badge.color + '18',
                  color: badge.color,
                }}
              >
                <svg viewBox="0 0 24 24" width={11} height={11} fill="currentColor" aria-hidden="true">
                  <path d={badge.path} />
                </svg>
                {badge.name}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
                  aria-label={`Remover ${badge.name}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">{value.length} badge{value.length !== 1 ? 's' : ''} selecionado{value.length !== 1 ? 's' : ''}</p>
      )}

      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap">
        {BADGE_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            type="button"
            size="sm"
            variant={activeCategory === cat.id ? 'default' : 'outline'}
            className="h-7 text-xs"
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-1">
        {filtered.map((badge) => {
          const selected = value.includes(badge.id)
          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => toggle(badge.id)}
              className={[
                'flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs text-left transition-all cursor-pointer',
                selected ? 'font-medium' : 'hover:bg-muted',
              ].join(' ')}
              style={
                selected
                  ? {
                      borderColor: badge.color + '88',
                      backgroundColor: badge.color + '18',
                      color: badge.color,
                      outline: `2px solid ${badge.color}66`,
                      outlineOffset: '1px',
                    }
                  : undefined
              }
              title={badge.name}
            >
              <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                fill={selected ? badge.color : 'currentColor'}
                aria-hidden="true"
                className="shrink-0"
              >
                <path d={badge.path} />
              </svg>
              <span className="truncate">{badge.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
