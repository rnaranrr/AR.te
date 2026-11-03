// Configuração: traduções (português e inglês) com i18next
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importa os arquivos JSON
import ptTranslation from './locales/pt.json';
import enTranslation from './locales/en.json';

// Textos disponíveis em cada idioma
const resources = {
  pt: { translation: ptTranslation },
  en: { translation: enTranslation }
};

// Idioma escolhido anteriormente (salvo no navegador); o padrão é português
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

// Mantém o atributo lang do HTML igual ao idioma da interface (leitores de tela e tradutores do navegador)
const updateHtmlLang = (language) => {
  document.documentElement.lang = language.startsWith('en') ? 'en' : 'pt-BR';
};

updateHtmlLang(idiomaSalvo);
i18n.on('languageChanged', updateHtmlLang);

export default i18n;
