'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { type Locale, getT } from './translations'

const COOKIE = 'lang'

type LangCtx = { locale: Locale; setLocale: (l: Locale) => void; t: ReturnType<typeof getT> }

const LangContext = createContext<LangCtx>({
  locale: 'pl',
  setLocale: () => {},
  t: getT('pl'),
})

export function useT() {
  return useContext(LangContext).t
}

export function useLang() {
  const { locale, setLocale } = useContext(LangContext)
  return { locale, setLocale }
}

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'pl'
  const stored = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/)
  if (stored?.[1] === 'pl' || stored?.[1] === 'en') return stored[1]
  return navigator.language.startsWith('pl') ? 'pl' : 'en'
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pl')

  useEffect(() => {
    setLocaleState(detectLocale())
  }, [])

  function setLocale(l: Locale) {
    document.cookie = `${COOKIE}=${l};path=/;max-age=31536000`
    setLocaleState(l)
  }

  return (
    <LangContext.Provider value={{ locale, setLocale, t: getT(locale) }}>
      {children}
    </LangContext.Provider>
  )
}
