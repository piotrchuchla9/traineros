'use client'

import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n/context'

export function LangSwitcher() {
  const { locale, setLocale } = useLang()
  const router = useRouter()

  function handleSwitch() {
    setLocale(locale === 'pl' ? 'en' : 'pl')
    router.refresh()
  }

  return (
    <button
      onClick={handleSwitch}
      title={locale === 'pl' ? 'Switch to English' : 'Przełącz na polski'}
      className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {locale === 'pl' ? 'EN' : 'PL'}
    </button>
  )
}
