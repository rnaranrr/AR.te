import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importa os arquivos JSON
import ptTranslation from './locales/pt.json';
import enTranslation from './locales/en.json';

const resources = {
  pt: { translation: ptTranslation },
  en: { translation: enTranslation }
};

const idiomaSalvo = localStorage.getItem('idiomaSalvo') || 'pt';

i18n
  .use(initReactI18next) // Passa i18 pra react
  .init({
    resources,
    lng: idiomaSalvo, // Idioma padrão inicial
    fallbackLng: 'pt', // Idioma de segurança caso falte alguma tradução no pt
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;