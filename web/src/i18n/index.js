import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const LANGUAGE_STORAGE_KEY = 'my-doctor-language';
export const supportedLanguages = ['ar', 'en'];

const getInitialLanguage = () => {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (supportedLanguages.includes(savedLanguage)) return savedLanguage;
  return 'ar';
};

export const applyLanguage = language => {
  const nextLanguage = supportedLanguages.includes(language) ? language : 'ar';
  document.documentElement.lang = nextLanguage;
  document.documentElement.dir = nextLanguage === 'ar' ? 'rtl' : 'ltr';
  document.title = nextLanguage === 'ar' ? 'طبيبي | رعاية صحية أقرب' : 'MyDoctor | Healthcare closer to you';
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
};

const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: initialLanguage,
    fallbackLng: 'ar',
    supportedLngs: supportedLanguages,
    interpolation: { escapeValue: false },
  });

applyLanguage(initialLanguage);

export default i18n;
