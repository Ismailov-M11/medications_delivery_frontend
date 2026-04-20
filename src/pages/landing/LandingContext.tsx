import { createContext, useContext, useState, type ReactNode } from 'react'
import { TRANSLATIONS, type Lang, type Translations } from './translations'

type LandingContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
}

const LandingContext = createContext<LandingContextType>({} as LandingContextType)

export function LandingProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('uz')
  return (
    <LandingContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LandingContext.Provider>
  )
}

export const useLandingT = () => useContext(LandingContext)
