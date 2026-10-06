import i18next from 'i18next';
import { handle, LanguageDetector } from 'i18next-http-middleware';
import ar from '../locales/ar.json' with { type: 'json' };
import en from '../locales/en.json' with { type: 'json' };

export const supportedLanguages = ['ar', 'en'];
export const defaultLanguage = 'ar';

i18next.use(LanguageDetector);

await i18next.init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  supportedLngs: supportedLanguages,
  fallbackLng: defaultLanguage,
  load: 'currentOnly',
  detection: {
    order: ['querystring', 'header'],
    lookupQuerystring: 'lng',
    caches: false,
  },
});

const middleware = handle(i18next, {
  defaultLanguage,
  setHeader: (res, header, language) => {
    res.setHeader(header, language);
  },
});

export const i18nMiddleware = (req, res, next) => {
  if (req.query.lang && !req.query.lng) {
    req.query.lng = req.query.lang;
  }

  middleware(req, res, next);
};

export default i18next;
