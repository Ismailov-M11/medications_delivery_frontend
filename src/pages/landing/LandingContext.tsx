import { createContext, useContext, useState, type ReactNode } from 'react'
import { TRANSLATIONS, type Lang } from './translations'

// Widened type — string literals replaced with string so all three languages are assignable
type DeepLoose<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
  ? DeepLoose<U>[]
  : T extends object
  ? { [K in keyof T]: DeepLoose<T[K]> }
  : T

export type Translations = DeepLoose<typeof TRANSLATIONS['uz']>

type LandingContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
}

const LandingContext = createContext<LandingContextType>({} as LandingContextType)

export function LandingProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('uz')
  return (
    <LandingContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] as unknown as Translations }}>
      {children}
    </LandingContext.Provider>
  )
}

export const useLandingT = () => useContext(LandingContext)
