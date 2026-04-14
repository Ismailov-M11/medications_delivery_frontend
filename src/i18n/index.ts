import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import uz from './locales/uz'
import ru from './locales/ru'
import en from './locales/en'

const savedLanguage = localStorage.getItem('language') || 'ru'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      uz,
      ru,
      en,
    },
    lng: savedLanguage,
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  })

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng)
})

export default i18n
