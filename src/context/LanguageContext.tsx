import React, { createContext, useContext, useState } from 'react'
import { Language, translations } from '@/i18n/translations'

export type { Language }

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: string, params?: Record<string, string | number>) => string
  tText: (vi: string, en: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ielts_pref_language')
    return saved === 'en' ? 'en' : 'vi'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('ielts_pref_language', lang)
    // Update html lang attribute
    document.documentElement.lang = lang
  }

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi')
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language]?.[key] || translations['vi']?.[key] || key
    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal))
      })
    }
    return text
  }

  const tText = (vi: string, en: string): string => {
    return language === 'en' ? en : vi
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, tText }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      language: 'vi',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key: string) => key,
      tText: (vi: string, _en: string) => vi,
    }
  }
  return context
}
