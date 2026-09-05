import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { translations } from '../lib/i18n'
import type { Lang } from '../lib/i18n'

type T = typeof translations['en']

interface LanguageContextType {
  lang: Lang
  t: T
  setLang: (l: Lang) => void
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('flaash-lang')
    return (saved === 'es' || saved === 'en') ? saved : 'es'
  })

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem('flaash-lang', l)
    setLangState(l)
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang] as T, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider')
  return ctx
}
