import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRtl: boolean;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Common
  'sans.brand': { en: 'Saudi Air Navigation Services', ar: 'شركة خدمات الملاحة الجوية السعودية' },
  'sans.subtitle': { en: 'AI Screening & Assessment Platform • RFQ3358', ar: 'منصة الفرز والتقييم الذكي • منافسة رقم 3358' },
  'oracle.connected': { en: 'Oracle Fusion HCM Connected', ar: 'متصل بنظام أوراكل فيوجن للموارد البشرية' },
  'data.sovereignty': { en: '100% KSA Data Sovereignty', ar: 'سيادة بيانات وطنية 100% داخل المملكة' },
  'data.sub': { en: 'Hosted in Saudi Cloud • NCA ECC', ar: 'استضافة سحابية سعودية معتمدة من الأمن السيبراني' },
  'active.req': { en: 'Active Requisition:', ar: 'الوظيفة النشطة:' },
  'total.ingested': { en: 'Total Ingested', ar: 'إجمالي السير المرفوعة' },
  'ai.screened': { en: 'AI Screened', ar: 'تم فرزها آلياً' },
  'high.match': { en: 'High Match (>85%)', ar: 'تطابق عالي (>85%)' },
  'interviews.done': { en: 'Interviews Completed', ar: 'اكتملت المقابلات' },
  'cleared.candidates': { en: 'Fully Cleared', ar: 'مكتمل التحقق الأمني' },
  'pull.oracle': { en: 'Pull from Oracle HCM', ar: 'سحب الوظائف من أوراكل' },
  'export.dossier': { en: 'Export Dossier Pack', ar: 'تصدير ملف التقييم المعتمد' },
  'explain.score': { en: 'Explain Match', ar: 'تفسير الذكاء الاصطناعي' },
  'human.override': { en: 'Recruiter Override', ar: 'تعديل مسؤول التوظيف' },
  'sync.oracle.button': { en: 'Sync Shortlist to Oracle Fusion HCM', ar: 'اعتماد ومزامنة القائمة في أوراكل فيوجن' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('sans_lang') as Language) || 'en';
  });

  const isRtl = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('sans_lang', language);
  }, [language, isRtl]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRtl, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
