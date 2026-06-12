'use client'

import { useRef } from 'react'
import { useT } from '@/lib/i18n/context'

interface Props {
  name: string
  previewUrl: string | null
  onFileSelect: (file: File) => void
  onRemove?: () => void
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

export function AvatarPicker({ name, previewUrl, onFileSelect, onRemove }: Props) {
  const t = useT()
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onFileSelect(file)
          e.target.value = ''
        }}
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative w-20 h-20 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring group"
        title={previewUrl ? t.newClient.avatarChange : t.newClient.avatarHint}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">{t.newClient.avatarChange}</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center group-hover:opacity-80 transition-opacity">
            {name.trim() ? (
              <span className="text-primary-foreground font-bold text-xl tracking-wide">
                {initials(name)}
              </span>
            ) : (
              <svg className="w-8 h-8 text-primary-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
        )}
      </button>

      {previewUrl && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="cursor-pointer text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          {t.newClient.avatarRemove}
        </button>
      )}
    </div>
  )
}
