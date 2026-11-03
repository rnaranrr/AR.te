// Serviço: cliente HTTP (axios) da API e funções auxiliares
import axios from 'axios';

import i18n from '@/i18n';

// URL base da API (definida no .env do client: VITE_API_URL=http://localhost:3000)
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Cliente axios com a URL base da API
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

// Antes de cada requisição, envia o token de login (se existir)
api.interceptors.request.use((config) => {
  // Requisições marcadas com isMod (ver modConfig) usam o token de moderador; as demais, o de usuário
  const token = localStorage.getItem(config.isMod ? 'modToken' : 'token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Idioma da interface: o servidor usa para traduzir as mensagens das respostas
  config.headers['Accept-Language'] = i18n.language || 'pt';

  return config;
});

// Se o servidor responder 401 para quem tinha token, a sessão expirou:
// limpa os dados locais e volta para o login (o de moderador tem sessão e tela próprias)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isMod = Boolean(error.config?.isMod);
    const hadToken = Boolean(localStorage.getItem(isMod ? 'modToken' : 'token'));
    const loginPath = isMod ? '/mod/login' : '/login';

    if (error.response?.status === 401 && hadToken && window.location.pathname !== loginPath) {
      if (isMod) {
        clearModeratorSession();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      window.location.href = loginPath;
    }

    return Promise.reject(error);
  }
);

// Converte um caminho relativo do servidor (ex.: "/uploads/posts/a.png") em URL completa
// URLs absolutas (http, blob, data) são devolvidas sem alteração
export function assetUrl(path) {
  if (!path) return '';
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Extrai a mensagem de erro enviada pela API ({ error: '...' }), ou usa um texto padrão
export function apiError(err, fallback) {
  return err?.response?.data?.error || fallback;
}

// Usuário logado salvo no login (ou null)
export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

// True se existe um token salvo
export function isLoggedIn() {
  return Boolean(localStorage.getItem('token'));
}

export default api;

// Marca uma requisição como de moderador: ela usa o token de moderador em vez do token de usuário
// Uso: api.put(url, dados, modConfig())
export function modConfig() {
  return { isMod: true };
}

// Moderador logado salvo no login de moderador (ou null)
export function getStoredModerator() {
  try {
    return JSON.parse(localStorage.getItem('moderator') || 'null');
  } catch {
    return null;
  }
}

// True se existe um token de moderador salvo
export function isModerator() {
  return Boolean(localStorage.getItem('modToken'));
}

// Encerra somente a sessão de moderador (a sessão de usuário continua)
export function clearModeratorSession() {
  localStorage.removeItem('modToken');
  localStorage.removeItem('moderator');
}
