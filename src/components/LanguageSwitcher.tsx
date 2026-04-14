import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'uz', label: "O'z" },
  { code: 'ru', label: 'Ру' },
  { code: 'en', label: 'En' },
]

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()

  const handleChange = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  return (
    <div className={`flex items-center gap-1 ${className ?? ''}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      {LANGUAGES.map((lang) => (
        <Button
          key={lang.code}
          variant={i18n.language === lang.code ? 'default' : 'ghost'}
          size="sm"
          className="h-7 px-2 text-xs font-medium"
          onClick={() => handleChange(lang.code)}
        >
          {lang.label}
        </Button>
      ))}
    </div>
  )
}
